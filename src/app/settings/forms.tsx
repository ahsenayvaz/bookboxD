"use client";

import { useActionState } from "react";
import { deleteAccount, updateProfile } from "@/actions/profile";
import { FieldError, FormAlert } from "@/components/FormMessages";
import { SubmitButton } from "@/components/SubmitButton";

export function ProfileForm({ username, email, bio }: { username: string; email: string; bio: string }) {
  const [state, formAction] = useActionState(updateProfile, undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="space-y-5">
      <FormAlert error={state?.error} success={state?.success} />

      <div>
        <label htmlFor="username" className="field-label">
          Benutzername
        </label>
        <input
          id="username"
          name="username"
          required
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9_]+"
          defaultValue={state?.values?.username ?? username}
          aria-invalid={!!errors?.username}
          aria-describedby="username-error"
          className="field"
        />
        <FieldError id="username-error" errors={errors?.username} />
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          E-Mail-Adresse <span className="font-normal text-ink-soft/70 not-italic">(nur für dich sichtbar)</span>
        </label>
        <input id="email" value={email} readOnly disabled className="field cursor-not-allowed opacity-60" />
      </div>

      <div>
        <label htmlFor="bio" className="field-label">
          Über mich <span className="font-normal text-ink-soft/70 not-italic">(optional, max. 300 Zeichen)</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={300}
          defaultValue={state?.values?.bio ?? bio}
          aria-invalid={!!errors?.bio}
          aria-describedby="bio-error"
          placeholder="Was liest du am liebsten?"
          className="field resize-y"
        />
        <FieldError id="bio-error" errors={errors?.bio} />
      </div>

      <SubmitButton pendingText="Wird gespeichert …">Änderungen speichern</SubmitButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccount, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Möchtest du dein Konto wirklich unwiderruflich löschen?")) e.preventDefault();
      }}
      className="space-y-4"
    >
      <p className="leading-relaxed text-ink-soft">
        Dein Konto und alle zugehörigen Daten werden dauerhaft gelöscht.
      </p>
      <FormAlert error={state?.error} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="delete-password" className="field-label">
            Zur Bestätigung dein Passwort
          </label>
          <input
            id="delete-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="field"
          />
        </div>
        <SubmitButton pendingText="Wird gelöscht …" className="btn-danger shrink-0">
          Konto endgültig löschen
        </SubmitButton>
      </div>
    </form>
  );
}
