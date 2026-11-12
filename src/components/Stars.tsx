// Sterneanzeige 0–5 mit anteiliger Füllung (z. B. für Durchschnittsbewertungen)
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const percent = Math.max(0, Math.min(5, value)) * 20;
  return (
    <span
      className={`relative inline-block leading-none tracking-[0.12em] text-line ${className}`}
      role="img"
      aria-label={`${value.toLocaleString("de-DE", { maximumFractionDigits: 1 })} von 5 Sternen`}
    >
      ★★★★★
      <span
        className="absolute inset-0 overflow-hidden text-honey drop-shadow-[0_0_6px_rgb(230_180_90/0.45)]"
        style={{ width: `${percent}%` }}
        aria-hidden
      >
        ★★★★★
      </span>
    </span>
  );
}
