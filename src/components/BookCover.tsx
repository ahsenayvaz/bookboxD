import Image from "next/image";

type Props = {
  coverId: number | null;
  title: string;
  /** Open-Library-Größe: M ≈ 180 px, L ≈ 500 px Breite */
  size?: "M" | "L";
  sizes: string;
  priority?: boolean;
  className?: string;
};

export function BookCover({ coverId, title, size = "L", sizes, priority, className = "" }: Props) {
  return (
    <div className={`book aspect-[2/3] ${className}`}>
      {coverId ? (
        <Image
          src={`https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`}
          alt={`Cover von „${title}“`}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        // Ohne Cover: schlichter Leineneinband mit geprägtem Titel
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-terracotta-deep to-[#5e2a17] p-3 text-center">
          <span className="h-px w-8 bg-honey/50" />
          <span className="font-serif text-[13px] leading-snug font-semibold text-honey/90 italic">{title}</span>
          <span className="h-px w-8 bg-honey/50" />
        </div>
      )}
    </div>
  );
}
