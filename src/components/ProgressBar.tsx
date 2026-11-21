// Fortschrittsbalken für den Lesefortschritt eines Buches
type Props = {
  value: number;
  max: number;
  label: string;
  /** Markierung, wo man „nach Plan“ stehen sollte (gleiche Einheit wie value) */
  marker?: number;
  size?: "sm" | "md";
  tone?: "paper" | "dark";
  className?: string;
};

export function ProgressBar({ value, max, label, marker, size = "md", tone = "paper", className = "" }: Props) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const markerPercent = marker !== undefined && max > 0 ? Math.min(100, (marker / max) * 100) : undefined;
  const done = max > 0 && value >= max;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
      aria-valuetext={`${Math.round(percent)} %`}
      className={`relative overflow-hidden rounded-full ${size === "sm" ? "h-1.5" : "h-3"} ${
        tone === "paper" ? "bg-ink/12 shadow-[inset_0_1px_2px_rgb(58_38_24/0.25)]" : "bg-cocoa/80 ring-1 ring-line"
      } ${className}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          done
            ? "bg-gradient-to-r from-moss to-[#a9b86d]"
            : "bg-gradient-to-r from-terracotta to-ember shadow-[0_0_10px_rgb(240_160_75/0.45)]"
        }`}
        style={{ width: `${percent}%` }}
      />
      {markerPercent !== undefined && markerPercent > 0 && markerPercent < 100 && (
        <span
          aria-hidden
          className={`absolute inset-y-0 w-0.5 ${tone === "paper" ? "bg-ink/40" : "bg-cream/50"}`}
          style={{ left: `${markerPercent}%` }}
        />
      )}
    </div>
  );
}
