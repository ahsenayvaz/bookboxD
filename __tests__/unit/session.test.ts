import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};
const connectionMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

vi.mock("next/server", () => ({
  connection: (...args: unknown[]) => connectionMock(...args),
}));

import {
  createSession,
  decrypt,
  deleteSession,
  encrypt,
  getSession,
  SESSION_COOKIE,
} from "@/lib/session";

const TEST_SECRET = "0123456789abcdef0123456789abcdef_bookboxd_test";

describe("Session-Verwaltung (UC-01, NFA-01)", () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = TEST_SECRET;
    cookieStore.get.mockReset();
    cookieStore.set.mockReset();
    cookieStore.delete.mockReset();
    connectionMock.mockReset();
  });

  afterEach(() => {
    process.env.SESSION_SECRET = originalSecret;
  });

  it("signiert und entschlüsselt eine gültige Session-Payload", async () => {
    const token = await encrypt({ userId: "user_123" });
    expect(typeof token).toBe("string");
    expect(await decrypt(token)).toEqual({ userId: "user_123" });
  });

  it("gibt null für fehlende, manipulierte oder ungültige Tokens zurück", async () => {
    expect(await decrypt(undefined)).toBeNull();
    expect(await decrypt("")).toBeNull();
    expect(await decrypt("kein.gueltiges.jwt")).toBeNull();

    const token = await encrypt({ userId: "user_123" });
    const tampered = `${token.slice(0, -4)}XXXX`;
    expect(await decrypt(tampered)).toBeNull();
  });

  it("wirft einen Fehler, wenn SESSION_SECRET fehlt oder zu kurz ist", async () => {
    process.env.SESSION_SECRET = "zu-kurz";
    await expect(encrypt({ userId: "user_1" })).rejects.toThrow("SESSION_SECRET");
  });

  it("setzt ein signiertes httpOnly-Cookie mit 30 Tagen Laufzeit (createSession)", async () => {
    await createSession("user_42");
    expect(cookieStore.set).toHaveBeenCalledTimes(1);
    const [name, token, options] = cookieStore.set.mock.calls[0];
    expect(name).toBe(SESSION_COOKIE);
    expect(await decrypt(token)).toEqual({ userId: "user_42" });
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  });

  it("liest eine aktive Session aus dem Cookie aus und ruft connection() auf", async () => {
    const token = await encrypt({ userId: "user_99" });
    cookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();
    expect(connectionMock).toHaveBeenCalledTimes(1);
    expect(session).toEqual({ userId: "user_99" });
  });

  it("gibt null zurück, wenn kein Session-Cookie vorhanden ist", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getSession()).toBeNull();
    expect(connectionMock).not.toHaveBeenCalled();
  });

  it("löscht das Session-Cookie beim Abmelden (deleteSession)", async () => {
    await deleteSession();
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
  });
});
