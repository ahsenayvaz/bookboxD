import { z } from "zod";

// Gemeinsamer Rückgabetyp der Formular-Actions (für useActionState)
export type FormState =
  | {
      error?: string;
      success?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      values?: Record<string, string>;
    }
  | undefined;

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9_]{3,20}$/, "3–20 Zeichen: Buchstaben, Zahlen und Unterstriche.");

export const passwordSchema = z
  .string()
  .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein.")
  .max(72, "Das Passwort darf höchstens 72 Zeichen lang sein.");

export const bioSchema = z.string().trim().max(300, "Höchstens 300 Zeichen.");
