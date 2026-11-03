import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import { getSession } from "./session";

// Data Access Layer: einzige Stelle, die aus der Session den aktuellen Nutzer ermittelt.
// `cache` sorgt dafür, dass pro Request nur einmal gelesen wird.
export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, username: true, bio: true, avatarUrl: true },
  });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
