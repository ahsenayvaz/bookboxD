"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { requireUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { deleteSession } from "@/lib/session";
import { bioSchema, type FormState, usernameSchema } from "@/lib/validation";

const profileSchema = z.object({ username: usernameSchema, bio: bioSchema });

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const values = {
    username: String(formData.get("username") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  };
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { username: parsed.data.username, bio: parsed.data.bio || null },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { fieldErrors: { username: ["Dieser Benutzername ist bereits vergeben."] }, values };
    }
    throw e;
  }

  refresh();
  return { success: "Profil gespeichert.", values: parsed.data };
}

export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const { passwordHash } = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!(await bcrypt.compare(String(formData.get("password") ?? ""), passwordHash))) {
    return { error: "Das Passwort ist falsch." };
  }

  await prisma.user.delete({ where: { id: user.id } });
  await deleteSession();
  redirect("/");
}
