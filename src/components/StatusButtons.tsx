"use client";

import { useOptimistic, useTransition } from "react";
import { setReadingStatus } from "@/actions/library";
import type { ReadingStatus } from "@/generated/prisma/enums";

type Option = {
  value: ReadingStatus;
  label: string;
  active: string;
  animation: string;
  icon: React.ReactNode;
};

const OPTIONS: Option[] = [
  {
    value: "READ",
    label: "Gelesen",
    active: "bg-moss/15 text-[#56652a]",
    // Haken zeichnet sich selbst
    animation: "[stroke-dasharray:24] motion-safe:animate-[draw_0.5s_ease-out_both]",
    icon: <path d="M4 12.5 9.5 18 20 6.5" />,
  },
  {
    value: "READING",
    label: "Lese ich",
    active: "bg-ember/15 text-[#a85a12]",
    animation: "motion-safe:animate-pop",
    icon: <path d="M12 6.5C10 5 7 4.5 3 5v13c4-.5 7 0 9 1.5m0-13c2-1.5 5-2 9-1.5v13c-4-.5-7 0-9 1.5m0-13v13" />,
  },
  {
    value: "WANT_TO_READ",
    label: "Will lesen",
    active: "bg-terracotta/12 text-terracotta-deep",
    // Lesezeichen fällt ins Buch
    animation: "motion-safe:animate-ribbon",
    icon: <path d="M6 3.5h12v17l-6-4.5-6 4.5z" />,
  },
];

export function StatusButtons({ olid, status }: { olid: string; status: ReadingStatus | null }) {
  const [current, setCurrent] = useOptimistic(status);
  const [pending, startTransition] = useTransition();

  function select(value: ReadingStatus) {
    // Erneuter Klick auf die aktive Liste entfernt das Buch aus der Bibliothek
    const next = current === value ? null : value;
    startTransition(async () => {
      setCurrent(next);
      await setReadingStatus(olid, next);
    });
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 p-2" aria-busy={pending}>
      {OPTIONS.map((o) => {
        const isActive = current === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => select(o.value)}
            className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg py-3 text-xs font-semibold transition-colors duration-300 ${
              isActive ? o.active : "text-ink-soft hover:bg-parchment-deep/70 hover:text-ink"
            }`}
          >
            <svg
              // neuer key → Animation startet beim Aktivieren erneut
              key={isActive ? "on" : "off"}
              viewBox="0 0 24 24"
              className={`h-7 w-7 ${isActive ? o.animation : ""}`}
              fill={isActive && o.value === "WANT_TO_READ" ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {o.icon}
            </svg>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
