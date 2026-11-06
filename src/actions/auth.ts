"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { createSession, deleteSession } from "@/lib/session";
import { type FormState, passwordSchema, usernameSchema } from "@/lib/validation";

// NFA-01: Passwörter werden ausschließlich als bcrypt-Hash gespeichert
const BCRYPT_ROUNDS = 12;
// Wird verglichen, wenn der Nutzer nicht existiert – damit dauert jeder Login gleich lang
const DUMMY_HASH = "$2b$12$cp7Z5/vLcnsA9X3YBrdzQ.1LTv3w9QQXR2JgQCf7KB3XuqlldKqQC";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Bitte gib eine gültige E-Mail-Adresse ein.")),
  username: usernameSchema,
  password: passwordSchema,
  privacy: z.literal("on", { error: "Bitte bestätige die Datenschutzerklärung." }),
});

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    email: String(formData.get("email") ?? ""),
    username: String(formData.get("username") ?? ""),
  };
  const parsed = registerSchema.safeParse({
    ...values,
    password: formData.get("password"),
    privacy: formData.get("privacy"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { email, username, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  let userId: string;
  try {
    const user = await prisma.user.create({ data: { email, username, passwordHash } });
    userId = user.id;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      return {
        fieldErrors: taken
          ? { email: ["Für diese E-Mail-Adresse gibt es bereits ein Konto."] }
          : { username: ["Dieser Benutzername ist bereits vergeben."] },
        values,
      };
    }
    throw e;
  }

  await createSession(userId);
  redirect(`/u/${username}`);
}

const loginSchema = z.object({
  identifier: z.string().trim().toLowerCase().min(1, "Bitte gib deine E-Mail-Adresse oder deinen Benutzernamen ein."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { identifier: String(formData.get("identifier") ?? "") };
  const parsed = loginSchema.safeParse({ ...values, password: formData.get("password") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors, values };
  }

  const { identifier, password } = parsed.data;
  const user = await prisma.user.findUnique({
    where: identifier.includes("@") ? { email: identifier } : { username: identifier },
    select: { id: true, passwordHash: true },
  });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !valid) {
    return { error: "Die Anmeldedaten sind ungültig.", values };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
