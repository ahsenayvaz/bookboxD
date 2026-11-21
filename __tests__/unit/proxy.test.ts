import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { encrypt, SESSION_COOKIE } from "@/lib/session";
import { config, proxy } from "@/proxy";

const TEST_SECRET = "0123456789abcdef0123456789abcdef_bookboxd_test";

describe("Proxy-Routenschutz (UC-01, UC-02, NFA-01)", () => {
  const originalSecret = process.env.SESSION_SECRET;

  beforeEach(() => {
    process.env.SESSION_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    process.env.SESSION_SECRET = originalSecret;
  });

  it("konfiguriert den Matcher für /settings und /library", () => {
    expect(config.matcher).toEqual(["/settings/:path*", "/library/:path*"]);
  });

  it("leitet nicht angemeldete Besucher von /settings und /library zu /login weiter", async () => {
    const resSettings = await proxy(new NextRequest("http://localhost:3000/settings"));
    expect(resSettings.status).toBe(307);
    expect(resSettings.headers.get("location")).toBe("http://localhost:3000/login");

    const resLibrary = await proxy(new NextRequest("http://localhost:3000/library"));
    expect(resLibrary.status).toBe(307);
    expect(resLibrary.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("leitet bei manipuliertem Session-Cookie ebenfalls zu /login weiter", async () => {
    const req = new NextRequest("http://localhost:3000/settings", {
      headers: { cookie: `${SESSION_COOKIE}=ungueltig.token.wert` },
    });
    const res = await proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/login");
  });

  it("lässt angemeldete Nutzer mit gültigem Session-Cookie passieren", async () => {
    const token = await encrypt({ userId: "user_1" });
    const req = new NextRequest("http://localhost:3000/settings", {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
    });
    const res = await proxy(req);
    expect(res.status).toBe(200);
    expect(res.headers.get("location")).toBeNull();
  });
});
