"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/actions/auth";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { SubmitButton } from "@/components/SubmitButton";

export function RegisterForm() {
  const [state, formAction] = useActionState(register, undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert error={state?.error} />

      <div>
        <label htmlFor="email" className="field-label">
          E-Mail-Adresse
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.values?.email}
          aria-invalid={!!errors?.email}
          aria-describedby="email-error"
          className="field"
        />
        <FieldError id="email-error" errors={errors?.email} />
      </div>

      <div>
        <label htmlFor="username" className="field-label">
          Benutzername
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          defaultValue={state?.values?.username}
          aria-invalid={!!errors?.username}
          aria-describedby="username-error"
          className="field"
        />
        <FieldError id="username-error" errors={errors?.username} />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Passwort <span className="font-normal text-ink-soft/70 not-italic">(mind. 8 Zeichen)</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          aria-invalid={!!errors?.password}
          aria-describedby="password-error"
          className="field"
        />
        <FieldError id="password-error" errors={errors?.password} />
      </div>

      <div>
        <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-soft">
          <input
            name="privacy"
            type="checkbox"
            required
            aria-describedby="privacy-error"
            className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta"
          />
          <span>
            Ich habe die{" "}
            <Link href="/datenschutz" target="_blank" className="font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta">
              Datenschutzerklärung
            </Link>{" "}
            und das{" "}
            <Link href="/kvkk" target="_blank" className="font-medium text-terracotta-deep underline decoration-terracotta/40 underline-offset-2 hover:decoration-terracotta">
              KVKK-Aydınlatma Metni
            </Link>{" "}
            gelesen.
          </span>
        </label>
        <FieldError id="privacy-error" errors={errors?.privacy} />
      </div>

      <SubmitButton pendingText="Konto wird erstellt…" className="btn-primary mt-2 w-full py-3">
        Registrieren
      </SubmitButton>
    </form>
  );
}
