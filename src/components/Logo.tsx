import Link from "next/link";

// Schriftzug aus public/logo.png – als Maske, damit die Farbe per bg-* steuerbar ist
export function LogoMark({ className = "h-7 bg-cream" }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label="BookBoxD"
      className={`inline-block aspect-[869/156] [mask:url(/logo.png)_center/contain_no-repeat] ${className}`}
    />
  );
}

export function Logo() {
  return (
    <Link href="/" className="group flex items-center" aria-label="BookBoxD – Startseite">
      <LogoMark className="h-7 bg-cream transition-colors duration-300 group-hover:bg-ember" />
    </Link>
  );
}
