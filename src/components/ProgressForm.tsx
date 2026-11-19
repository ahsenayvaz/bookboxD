"use client";

import { useActionState } from "react";
import { updateProgress } from "@/actions/library";
import { FieldError, FormAlert } from "./FormMessages";
import { ProgressBar } from "./ProgressBar";
import { SubmitButton } from "./SubmitButton";

type Props = { olid: string; currentPage: number; pageCount: number | null };

// ID-13: Lesefortschritt (aktuelle Seite) eintragen
export function ProgressForm({ olid, currentPage, pageCount }: Props) {
  const [state, formAction] = useActionState(updateProgress.bind(null, olid), undefined);
  const errors = state?.fieldErrors;

  return (
    <form action={formAction} className="space-y-3">
      {pageCount ? (
        <div>
          <ProgressBar value={currentPage} max={pageCount} label="Lesefortschritt" />
          <p className="mt-1.5 flex justify-between text-xs text-ink-soft tabular-nums">
            <span>
              Seite {currentPage.toLocaleString("de-DE")} von {pageCount.toLocaleString("de-DE")}
            </span>
            <span className="font-semibold text-ink">{Math.round((currentPage / pageCount) * 100)} %</span>
          </p>
        </div>
      ) : (
        <p className="text-xs text-ink-soft">
          Aktuell auf Seite <span className="font-semibold text-ink">{currentPage.toLocaleString("de-DE")}</span>
        </p>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="progress-page" className="field-label">
            Aktuelle Seite
          </label>
          <input
            // neuer Wert vom Server → Feld zurücksetzen
            key={currentPage}
            id="progress-page"
            name="page"
            type="number"
            inputMode="numeric"
            min={0}
            max={pageCount ?? undefined}
            required
            defaultValue={errors ? state?.values?.page : currentPage}
            aria-invalid={!!errors?.page}
            aria-describedby="progress-page-error"
            className="field tabular-nums"
          />
        </div>
        <SubmitButton pendingText="…" className="btn-primary shrink-0 px-4 py-2">
          Speichern
        </SubmitButton>
      </div>
      <FieldError id="progress-page-error" errors={errors?.page} />
      <FormAlert error={state?.error} success={state?.success} />
    </form>
  );
}
