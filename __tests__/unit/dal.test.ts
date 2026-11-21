import { describe, expect, it, vi } from "vitest";

class RedirectError extends Error {
  constructor(public destination: string) {
    super(`NEXT_REDIRECT:${destination}`);
  }
}

const getSessionMock = vi.fn();
const findUniqueMock = vi.fn();
const redirectMock = vi.fn((destination: string) => {
  throw new RedirectError(destination);
});

vi.mock("react", () => ({
  cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

vi.mock("next/navigation", () => ({
  redirect: (destination: string) => redirectMock(destination),
}));

vi.mock("@/lib/session", () => ({
  getSession: () => getSessionMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}));

import { getCurrentUser, requireUser } from "@/lib/dal";

describe("Data Access Layer – Autorisierung (UC-01, NFA-01)", () => {
  it("gibt null zurück, wenn keine aktive Session existiert", async () => {
    getSessionMock.mockResolvedValueOnce(null);
    expect(await getCurrentUser()).toBeNull();
    expect(findUniqueMock).not.toHaveBeenCalled();
  });

  it("lädt den angemeldeten Nutzer ohne Passwort-Hash aus der Datenbank", async () => {
    const mockUser = {
      id: "u1",
      email: "reader@example.com",
      username: "reader",
      bio: null,
      avatarUrl: null,
    };
    getSessionMock.mockResolvedValueOnce({ userId: "u1" });
    findUniqueMock.mockResolvedValueOnce(mockUser);

    const user = await getCurrentUser();
    expect(user).toEqual(mockUser);
    expect(findUniqueMock).toHaveBeenCalledWith({
      where: { id: "u1" },
      select: { id: true, email: true, username: true, bio: true, avatarUrl: true },
    });
  });

  it("leitet in requireUser bei fehlender Authentifizierung auf /login weiter", async () => {
    getSessionMock.mockResolvedValueOnce(null);
    await expect(requireUser()).rejects.toThrow("NEXT_REDIRECT:/login");
  });

  it("gibt in requireUser den authentifizierten Nutzer zurück", async () => {
    const mockUser = {
      id: "u2",
      email: "anna@example.com",
      username: "anna",
      bio: "Hallo",
      avatarUrl: null,
    };
    getSessionMock.mockResolvedValueOnce({ userId: "u2" });
    findUniqueMock.mockResolvedValueOnce(mockUser);

    expect(await requireUser()).toEqual(mockUser);
  });
});
