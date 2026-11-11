"use client";

import { useActionState, useState } from "react";
import { deleteAccount, deleteAvatar, updateProfile, uploadAvatar } from "@/actions/profile";
import { Avatar } from "@/components/Avatar";
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
        {/* liniertes Papier */}
        <textarea
          id="bio"
          name="bio"
          rows={4}
          maxLength={300}
          defaultValue={state?.values?.bio ?? bio}
          aria-invalid={!!errors?.bio}
          aria-describedby="bio-error"
          placeholder="Was liest du am liebsten?"
          className="field resize-y border-solid border-ink/15 bg-[repeating-linear-gradient(transparent_0,transparent_27px,rgb(58_38_24/0.12)_27px,rgb(58_38_24/0.12)_28px)] leading-7"
        />
        <FieldError id="bio-error" errors={errors?.bio} />
      </div>

      <SubmitButton pendingText="Wird gespeichert …">Änderungen speichern</SubmitButton>
    </form>
  );
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function AvatarForm({ avatarUrl }: { avatarUrl: string | null }) {
  const [state, formAction] = useActionState(uploadAvatar, undefined);
  const [clientError, setClientError] = useState<string>();
  const [fileName, setFileName] = useState<string>();

  // Früh im Browser prüfen – zu große Dateien würden sonst am Upload-Limit scheitern
  function checkFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_AVATAR_BYTES) {
      setClientError("Das Bild darf höchstens 2 MB groß sein.");
      e.target.value = "";
    } else if (file && !["image/jpeg", "image/png"].includes(file.type)) {
      setClientError("Nur JPG- oder PNG-Dateien sind erlaubt.");
      e.target.value = "";
    } else {
      setClientError(undefined);
    }
    setFileName(e.target.value ? file?.name : undefined);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <Avatar src={avatarUrl} size={128} alt="Aktuelles Profilbild" />
      </div>

      <form action={formAction} className="space-y-3">
        <FormAlert error={clientError ?? state?.error} success={clientError ? undefined : state?.success} />
        <label
          htmlFor="avatar"
          className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border-2 border-dashed border-ink/20 px-4 py-5 text-center transition-colors hover:border-terracotta/60 hover:bg-parchment-deep/50"
        >
          <span className="font-serif text-sm font-semibold text-ink italic">
            {fileName ?? "Bild auswählen"}
          </span>
          <span className="text-xs text-ink-soft">JPG oder PNG, max. 2 MB</span>
        </label>
        <input
          id="avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png"
          required
          onChange={checkFile}
          className="sr-only"
        />
        <SubmitButton pendingText="Wird hochgeladen …" className="btn-primary w-full">
          {avatarUrl ? "Bild ersetzen" : "Hochladen"}
        </SubmitButton>
      </form>

      {avatarUrl && (
        <form action={deleteAvatar}>
          <SubmitButton pendingText="Wird entfernt …" className="btn-ghost-ink w-full">
            Bild entfernen
          </SubmitButton>
        </form>
      )}
    </div>
  );
}

export function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccount, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <p className="leading-relaxed text-ink-soft">
        Dein Konto und alle zugehörigen Daten (Profil, Profilbild, Bibliothek, Bewertungen und Rezensionen) werden
        dauerhaft gelöscht. Dieser Schritt kann nicht rückgängig gemacht werden.
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
