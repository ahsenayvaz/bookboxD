import { prisma } from "@/lib/db";

// Liefert das Profilbild aus der Datenbank. Die URL enthält eine Version (?v=…),
// daher darf der Browser das Bild dauerhaft cachen.
export async function GET(_req: Request, ctx: RouteContext<"/api/avatar/[userId]">) {
  const { userId } = await ctx.params;
  const avatar = await prisma.avatar.findUnique({ where: { userId } });
  if (!avatar) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(avatar.data), {
    headers: {
      "Content-Type": avatar.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
