import bcrypt from "bcryptjs";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  MockPrismaKnownError,
  requireUserMock,
  refreshMock,
  deleteSessionMock,
  redirectMock,
  prismaMock,
} = vi.hoisted(() => {
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
    requireUserMock: vi.fn(),
    refreshMock: vi.fn(),
    deleteSessionMock: vi.fn(),
    redirectMock: vi.fn((dest: string) => {
      throw new RedirectError(dest);
    }),
    prismaMock: {
      user: {
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
        delete: vi.fn(),
      },
      avatar: {
        upsert: vi.fn(),
        deleteMany: vi.fn(),
      },
      $transaction: vi.fn(async (ops: unknown[]) => ops),
    },
  };
});

vi.mock("next/cache", () => ({
  refresh: () => refreshMock(),
}));

vi.mock("next/navigation", () => ({
  redirect: (dest: string) => redirectMock(dest),
}));

vi.mock("@/generated/prisma/client", () => ({
  Prisma: {
    PrismaClientKnownRequestError: MockPrismaKnownError,
  },
}));

vi.mock("@/lib/dal", () => ({
  requireUser: () => requireUserMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/session", () => ({
  deleteSession: () => deleteSessionMock(),
}));

import { deleteAccount, deleteAvatar, updateProfile, uploadAvatar } from "@/actions/profile";

const MOCK_USER = {
  id: "user_1",
  email: "leser@example.com",
  username: "leser_1",
  bio: "Alt",
  avatarUrl: null,
};

describe("Profil- und Avatar-Actions (UC-02, NFA-01)", () => {
  beforeEach(() => {
    requireUserMock.mockResolvedValue(MOCK_USER);
    refreshMock.mockReset();
    deleteSessionMock.mockReset();
    redirectMock.mockClear();
    prismaMock.user.update.mockReset();
    prismaMock.user.findUniqueOrThrow.mockReset();
    prismaMock.user.delete.mockReset();
    prismaMock.avatar.upsert.mockReset();
    prismaMock.avatar.deleteMany.mockReset();
    prismaMock.$transaction.mockClear();
  });

  describe("updateProfile", () => {
    it("speichert gültigen Benutzernamen und Kurzbeschreibung", async () => {
      const fd = new FormData();
      fd.set("username", "Neu_Name");
      fd.set("bio", "  Ich liebe Science-Fiction.  ");

      const state = await updateProfile(undefined, fd);
      expect(state?.success).toBe("Profil gespeichert.");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "user_1" },
        data: { username: "neu_name", bio: "Ich liebe Science-Fiction." },
      });
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it("speichert eine leere Kurzbeschreibung als null", async () => {
      const fd = new FormData();
      fd.set("username", "leser_1");
      fd.set("bio", "   ");

      await updateProfile(undefined, fd);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "user_1" },
        data: { username: "leser_1", bio: null },
      });
    });

    it("weist ungültige Bio (>300 Zeichen) und vergebenen Benutzernamen ab", async () => {
      const invalidFd = new FormData();
      invalidFd.set("username", "leser_1");
      invalidFd.set("bio", "a".repeat(301));
      const invalidState = await updateProfile(undefined, invalidFd);
      expect(invalidState?.fieldErrors?.bio).toBeDefined();

      prismaMock.user.update.mockRejectedValueOnce(new MockPrismaKnownError("P2002"));
      const dupFd = new FormData();
      dupFd.set("username", "bereits_da");
      dupFd.set("bio", "Hi");
      const dupState = await updateProfile(undefined, dupFd);
      expect(dupState?.fieldErrors?.username?.[0]).toContain("bereits vergeben");
    });
  });

  describe("uploadAvatar", () => {
    it("skaliert ein gültiges PNG auf 400×400 JPEG und speichert es in einer Transaktion", async () => {
      const pngBuffer = await sharp({
        create: { width: 800, height: 600, channels: 4, background: { r: 200, g: 100, b: 50, alpha: 1 } },
      })
        .png()
        .toBuffer();

      const fd = new FormData();
      fd.set("avatar", new File([new Uint8Array(pngBuffer)], "profil.png", { type: "image/png" }));

      const state = await uploadAvatar(undefined, fd);
      expect(state?.success).toBe("Profilbild gespeichert.");
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);

      const upsertArg = prismaMock.avatar.upsert.mock.calls[0][0];
      expect(upsertArg.create.mimeType).toBe("image/jpeg");
      const processedMeta = await sharp(Buffer.from(upsertArg.create.data)).metadata();
      expect(processedMeta.format).toBe("jpeg");
      expect(processedMeta.width).toBe(400);
      expect(processedMeta.height).toBe(400);
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    it("weist fehlende Dateien und Dateien über 2 MB ab", async () => {
      const emptyFd = new FormData();
      expect((await uploadAvatar(undefined, emptyFd))?.error).toContain("wähle ein Bild");

      const bigBytes = new Uint8Array(2 * 1024 * 1024 + 1);
      const bigFd = new FormData();
      bigFd.set("avatar", new File([bigBytes], "gross.jpg", { type: "image/jpeg" }));
      expect((await uploadAvatar(undefined, bigFd))?.error).toContain("höchstens 2 MB");
    });

    it("weist nicht erlaubte Formate (z. B. WebP) und defekte Dateien anhand des Inhalts ab", async () => {
      const webpBuffer = await sharp({
        create: { width: 100, height: 100, channels: 3, background: { r: 10, g: 20, b: 30 } },
      })
        .webp()
        .toBuffer();

      const webpFd = new FormData();
      // Bewusst gefälschte .jpg-Endung, um Inhaltsprüfung zu testen
      webpFd.set("avatar", new File([new Uint8Array(webpBuffer)], "fake.jpg", { type: "image/jpeg" }));
      expect((await uploadAvatar(undefined, webpFd))?.error).toContain("Nur JPG- oder PNG-Dateien");

      const corruptFd = new FormData();
      corruptFd.set("avatar", new File(["kein echtes bild"], "kaputt.png", { type: "image/png" }));
      expect((await uploadAvatar(undefined, corruptFd))?.error).toContain("nicht als Bild gelesen");
    });
  });

  describe("deleteAvatar", () => {
    it("entfernt gespeichertes Profilbild und setzt avatarUrl auf null", async () => {
      await deleteAvatar();
      expect(prismaMock.avatar.deleteMany).toHaveBeenCalledWith({ where: { userId: "user_1" } });
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: "user_1" },
        data: { avatarUrl: null },
      });
      expect(refreshMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAccount", () => {
    it("lehnt Kontolöschung bei falschem Passwort ab", async () => {
      const hash = await bcrypt.hash("EchtesPasswort", 4);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ passwordHash: hash });

      const fd = new FormData();
      fd.set("password", "FalschesPasswort");
      const state = await deleteAccount(undefined, fd);

      expect(state?.error).toBe("Das Passwort ist falsch.");
      expect(prismaMock.user.delete).not.toHaveBeenCalled();
    });

    it("löscht das Konto nach Passwortbestätigung, beendet die Session und leitet auf / weiter", async () => {
      const hash = await bcrypt.hash("EchtesPasswort", 4);
      prismaMock.user.findUniqueOrThrow.mockResolvedValueOnce({ passwordHash: hash });

      const fd = new FormData();
      fd.set("password", "EchtesPasswort");
      await expect(deleteAccount(undefined, fd)).rejects.toThrow("NEXT_REDIRECT:/");

      expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: "user_1" } });
      expect(deleteSessionMock).toHaveBeenCalledTimes(1);
    });
  });
});
