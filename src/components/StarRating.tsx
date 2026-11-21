"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setRating } from "@/actions/library";

const LABELS = ["", "Hat mir nicht gefallen", "Ging so", "Ganz gut", "Sehr gut", "Ein Lieblingsbuch!"];

// ID-14: Sternebewertung 1–5; erneuter Klick auf den aktiven Stern entfernt die Bewertung
export function StarRating({ olid, rating }: { olid: string; rating: number | null }) {
  const [current, setCurrent] = useOptimistic(rating);
  const [hover, setHover] = useState<number | null>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const shown = hover ?? current ?? 0;

  function rate(value: number) {
    const next = current === value ? null : value;
    startTransition(async () => {
      setCurrent(next);
      const result = await setRating(olid, next);
      setError(result.error);
    });
  }

  return (
    <div>
      <div
        role="radiogroup"
        aria-label="Deine Bewertung"
        aria-busy={pending}
        className="flex items-center gap-0.5"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const filled = value <= shown;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={current === value}
              aria-label={`${value} ${value === 1 ? "Stern" : "Sterne"}`}
              title={LABELS[value]}
              onMouseEnter={() => setHover(value)}
              onFocus={() => setHover(value)}
              onBlur={() => setHover(null)}
              onClick={() => rate(value)}
              className={`cursor-pointer px-0.5 text-[28px] leading-none transition-all duration-200 hover:scale-115 ${
                filled ? "text-honey drop-shadow-[0_0_6px_rgb(230_180_90/0.55)]" : "text-ink/20"
              }`}
            >
              {/* Animation nur bei gespeicherter Bewertung, nicht beim Hover – sonst würde das Element
                  zwischen mousedown und mouseup ersetzt und der Klick ginge verloren */}
              <span
                key={current !== null && value <= current ? "on" : "off"}
                className={`pointer-events-none inline-block ${current !== null && value <= current ? "motion-safe:animate-pop" : ""}`}
              >
                ★
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 min-h-5 text-xs text-ink-soft" aria-live="polite">
        {error ? (
          <span className="field-error">{error}</span>
        ) : shown ? (
          <span className="font-hand text-base text-terracotta-deep">{LABELS[shown]}</span>
        ) : (
          "Noch nicht bewertet"
        )}
      </p>
    </div>
  );
}
