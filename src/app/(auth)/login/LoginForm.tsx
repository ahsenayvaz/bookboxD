"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="space-y-4">
      <FormAlert error={state?.error} />

      <div>
        <label htmlFor="identifier" className="field-label">
          E-Mail oder Benutzername
        </label>
        <input
          id="identifier"
          name="identifier"
          autoComplete="username"
          required
          defaultValue={state?.values?.identifier}
          aria-invalid={!!errors?.identifier}
          aria-describedby="identifier-error"
          className="field"
        />
        <FieldError id="identifier-error" errors={errors?.identifier} />
      </div>

      <div>
        <label htmlFor="password" className="field-label">
          Passwort
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={!!errors?.password}
          aria-describedby="password-error"
          className="field"
        />
        <FieldError id="password-error" errors={errors?.password} />
      </div>

      <SubmitButton pendingText="Anmelden…" className="btn-primary mt-2 w-full py-3">
        Anmelden
      </SubmitButton>
    </form>
  );
}
