"use server";

import bcrypt from "bcryptjs";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import sharp from "sharp";
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

// FA-02: nur JPG/PNG, Dateigröße begrenzt
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export async function uploadAvatar(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) return { error: "Bitte wähle ein Bild aus." };
  if (file.size > MAX_AVATAR_BYTES) return { error: "Das Bild darf höchstens 2 MB groß sein." };

  let data: Uint8Array<ArrayBuffer>;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    // Format am Dateiinhalt prüfen, nicht nur an Endung/MIME-Typ
    const { format } = await sharp(input).metadata();
    if (format !== "jpeg" && format !== "png") {
      return { error: "Nur JPG- oder PNG-Dateien sind erlaubt." };
    }
    // Einheitlich 400×400 JPEG – Metadaten wie GPS-Daten werden dabei entfernt
    const output = await sharp(input)
      .rotate()
      .resize(400, 400, { fit: "cover" })
      .flatten({ background: "#14181c" })
      .jpeg({ quality: 85 })
      .toBuffer();
    data = new Uint8Array(output);
  } catch {
    return { error: "Die Datei konnte nicht als Bild gelesen werden." };
  }

  await prisma.$transaction([
    prisma.avatar.upsert({
      where: { userId: user.id },
      create: { userId: user.id, data, mimeType: "image/jpeg" },
      update: { data, mimeType: "image/jpeg" },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl: `/api/avatar/${user.id}?v=${Date.now()}` },
    }),
  ]);

  refresh();
  return { success: "Profilbild gespeichert." };
}

export async function deleteAvatar() {
  const user = await requireUser();
  await prisma.$transaction([
    prisma.avatar.deleteMany({ where: { userId: user.id } }),
    prisma.user.update({ where: { id: user.id }, data: { avatarUrl: null } }),
  ]);
  refresh();
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

  // Alle zugehörigen Daten werden per ON DELETE CASCADE mitgelöscht
  await prisma.user.delete({ where: { id: user.id } });
  await deleteSession();
  redirect("/");
}
