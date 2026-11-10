import Image from "next/image";

type Props = { src: string | null; size: number; alt?: string; className?: string };

// Profilbild mit goldenem Rahmen bzw. Standardavatar, wenn keines hochgeladen wurde (FA-02)
export function Avatar({ src, size, alt = "", className = "" }: Props) {
  const ring = "rounded-full shadow-[0_0_0_2px_var(--color-honey),0_4px_12px_-4px_rgb(0_0_0/0.6)]";

  if (!src) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={`inline-flex shrink-0 items-end justify-center overflow-hidden bg-gradient-to-b from-parchment to-parchment-deep ${ring} ${className}`}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 32 32" className="h-[86%] w-[86%] fill-tan" aria-hidden>
          <circle cx="16" cy="12" r="6.5" />
          <path d="M3 32c0-7.2 5.8-12 13-12s13 4.8 13 12z" />
        </svg>
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      unoptimized
      className={`shrink-0 object-cover ${ring} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
