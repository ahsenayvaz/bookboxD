"use client";

import { useTransition } from "react";
import { setReadingStatus } from "@/actions/library";
import type { ReadingStatus } from "@/generated/prisma/enums";

const STATUS_OPTIONS: { value: ReadingStatus; label: string }[] = [
  { value: "READING", label: "Lese ich gerade" },
  { value: "READ", label: "Gelesen" },
  { value: "WANT_TO_READ", label: "Will lesen" },
];

// ID-29: Buch in der eigenen Bibliothek in eine andere Liste verschieben oder entfernen
export function LibraryControls({ olid, title, status }: { olid: string; title: string; status: ReadingStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2" aria-busy={pending}>
      <label className="sr-only" htmlFor={`status-${olid}`}>
        Liste für „{title}“
      </label>
      <select
        id={`status-${olid}`}
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ReadingStatus;
          startTransition(() => setReadingStatus(olid, next));
        }}
        className="cursor-pointer rounded-full border border-ink/25 bg-parchment px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-terracotta focus:border-terracotta disabled:opacity-60"
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`„${title}“ aus deiner Bibliothek entfernen? Bewertung und Fortschritt gehen dabei verloren.`)) return;
          startTransition(() => setReadingStatus(olid, null));
        }}
        className="cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:bg-[#8f2f1c]/10 hover:text-[#8f2f1c] disabled:opacity-60"
      >
        Entfernen
      </button>
      {pending && (
        <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-terracotta border-r-transparent" />
      )}
    </div>
  );
}
