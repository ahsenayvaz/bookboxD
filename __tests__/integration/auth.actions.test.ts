import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { MockPrismaKnownError, prismaMock, createSessionMock, deleteSessionMock, redirectMock } = vi.hoisted(() => {
  class RedirectError extends Error {
    constructor(public destination: string) {
      super(`NEXT_REDIRECT:${destination}`);
    }
  }
  class MockPrismaKnownError extends Error {
    constructor(public code: string) {
      super(`Prisma error ${code}`);
    }
  }
  return {
    MockPrismaKnownError,
    prismaMock: {
      user: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    },
    createSessionMock: vi.fn(),
    deleteSessionMock: vi.fn(),
    redirectMock: vi.fn((dest: string) => {
      throw new RedirectError(dest);
    }),
  };
});

vi.mock("next/navigation", () => ({
  redirect: (dest: string) => redirectMock(dest),
}));

vi.mock("@/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: MockPrismaKnownError,
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/session", () => ({
  createSession: (...args: unknown[]) => createSessionMock(...args),
  deleteSession: (...args: unknown[]) => deleteSessionMock(...args),
}));

import { login, logout, register } from "@/actions/auth";

function makeFormData(entries: Record<string, string | undefined>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) {
    if (v !== undefined) fd.set(k, v);
  }
  return fd;
}

describe("Auth Server Actions (UC-01, NFA-01)", () => {
  beforeEach(() => {
    prismaMock.user.create.mockReset();
    prismaMock.user.findUnique.mockReset();
    createSessionMock.mockReset();
    deleteSessionMock.mockReset();
    redirectMock.mockClear();
  });

  describe("register", () => {
    it("legt ein neues Konto an, speichert das Passwort als bcrypt-Hash, startet eine Session und leitet zum Profil weiter", async () => {
      prismaMock.user.create.mockResolvedValueOnce({ id: "user_new_1" });

      const fd = makeFormData({
        email: "  Leserin@Example.COM ",
        username: "  BuchFan_99 ",
        password: "SicheresPasswort123!",
        privacy: "on",
      });

      await expect(register(undefined, fd)).rejects.toThrow("NEXT_REDIRECT:/u/buchfan_99");

      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      const created = prismaMock.user.create.mock.calls[0][0].data;
      expect(created.email).toBe("leserin@example.com");
      expect(created.username).toBe("buchfan_99");
      // NFA-01: Passwort darf nicht im Klartext gespeichert werden
      expect(created.passwordHash).not.toBe("SicheresPasswort123!");
      expect(created.passwordHash).toMatch(/^\$2[ab]\$12\$/);
      expect(await bcrypt.compare("SicheresPasswort123!", created.passwordHash)).toBe(true);
      expect(createSessionMock).toHaveBeenCalledWith("user_new_1");
    });

    it("lehnt ungültige Eingaben und fehlende Datenschutz-Bestätigung ab und behält E-Mail/Benutzername bei", async () => {
      const fd = makeFormData({
        email: "keine-email",
        username: "ab",
        password: "123",
      });

      const state = await register(undefined, fd);
      expect(state?.fieldErrors?.email).toBeDefined();
      expect(state?.fieldErrors?.username).toBeDefined();
      expect(state?.fieldErrors?.password).toBeDefined();
      expect(state?.fieldErrors?.privacy).toBeDefined();
      expect(state?.values).toEqual({ email: "keine-email", username: "ab" });
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it("weist bereits vergebene E-Mail-Adresse mit spezifischer Meldung ab", async () => {
      prismaMock.user.create.mockRejectedValueOnce(new MockPrismaKnownError("P2002"));
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: "existing_id" });

      const fd = makeFormData({
        email: "dup@example.com",
        username: "neuer_user",
        password: "Passwort123",
        privacy: "on",
      });

      const state = await register(undefined, fd);
      expect(state?.fieldErrors?.email?.[0]).toContain("bereits ein Konto");
      expect(createSessionMock).not.toHaveBeenCalled();
    });

    it("weist bereits vergebenen Benutzernamen ab", async () => {
      prismaMock.user.create.mockRejectedValueOnce(new MockPrismaKnownError("P2002"));
      prismaMock.user.findUnique.mockResolvedValueOnce(null);

      const fd = makeFormData({
        email: "neu@example.com",
        username: "vergeben",
        password: "Passwort123",
        privacy: "on",
      });

      const state = await register(undefined, fd);
      expect(state?.fieldErrors?.username?.[0]).toContain("bereits vergeben");
      expect(createSessionMock).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("meldet Nutzer per E-Mail-Adresse erfolgreich an", async () => {
      const hash = await bcrypt.hash("Geheim1234", 4);
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: "u1", passwordHash: hash });

      const fd = makeFormData({ identifier: "User@Example.com", password: "Geheim1234" });
      await expect(login(undefined, fd)).rejects.toThrow("NEXT_REDIRECT:/");

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: "user@example.com" },
        select: { id: true, passwordHash: true },
      });
      expect(createSessionMock).toHaveBeenCalledWith("u1");
    });

    it("meldet Nutzer per Benutzernamen erfolgreich an", async () => {
      const hash = await bcrypt.hash("Geheim1234", 4);
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: "u2", passwordHash: hash });

      const fd = makeFormData({ identifier: "Leser_1", password: "Geheim1234" });
      await expect(login(undefined, fd)).rejects.toThrow("NEXT_REDIRECT:/");

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { username: "leser_1" },
        select: { id: true, passwordHash: true },
      });
      expect(createSessionMock).toHaveBeenCalledWith("u2");
    });

    it("gibt bei falschem Passwort oder unbekanntem Nutzer die generische Fehlermeldung aus", async () => {
      const hash = await bcrypt.hash("RichtigesPW", 4);
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: "u1", passwordHash: hash });

      const wrongPw = await login(
        undefined,
        makeFormData({ identifier: "u1", password: "FalschesPW" }),
      );
      expect(wrongPw?.error).toBe("Die Anmeldedaten sind ungültig.");
      expect(wrongPw?.values).toEqual({ identifier: "u1" });
      expect(createSessionMock).not.toHaveBeenCalled();

      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      const unknownUser = await login(
        undefined,
        makeFormData({ identifier: "existiert_nicht", password: "irgendwas" }),
      );
      expect(unknownUser?.error).toBe("Die Anmeldedaten sind ungültig.");
    });

    it("prüft Pflichtfelder beim Login", async () => {
      const state = await login(undefined, makeFormData({ identifier: "", password: "" }));
      expect(state?.fieldErrors?.identifier).toBeDefined();
      expect(state?.fieldErrors?.password).toBeDefined();
    });
  });

  describe("logout", () => {
    it("beendet die Sitzung und leitet auf die Startseite weiter", async () => {
      await expect(logout()).rejects.toThrow("NEXT_REDIRECT:/");
      expect(deleteSessionMock).toHaveBeenCalledTimes(1);
    });
  });
});
