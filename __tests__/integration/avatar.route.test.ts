import { beforeEach, describe, expect, it, vi } from "vitest";

const findUniqueMock = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    avatar: {
      findUnique: (...args: unknown[]) => findUniqueMock(...args),
    },
  },
}));

import { GET } from "@/app/api/avatar/[userId]/route";

describe("GET /api/avatar/[userId] (UC-02)", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it("liefert gespeichertes Profilbild mit Content-Type und unveränderlichem Cache-Header", async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    findUniqueMock.mockResolvedValueOnce({ data: bytes, mimeType: "image/jpeg" });

    const res = await GET(new Request("http://localhost:3000/api/avatar/u1"), {
      params: Promise.resolve({ userId: "u1" }),
    } as never);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/jpeg");
    expect(res.headers.get("Cache-Control")).toContain("immutable");
    expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes);
  });

  it("gibt 404 zurück, wenn der Nutzer kein Profilbild besitzt", async () => {
    findUniqueMock.mockResolvedValueOnce(null);

    const res = await GET(new Request("http://localhost:3000/api/avatar/u_none"), {
      params: Promise.resolve({ userId: "u_none" }),
    } as never);

    expect(res.status).toBe(404);
  });
});
