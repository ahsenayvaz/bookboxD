import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center motion-safe:animate-fade-up">
      <p className="font-hand text-3xl text-ember">Hoppla …</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold text-cream [font-variation-settings:'SOFT'_100]">
        Diese Seite ist wohl aus dem Buch gefallen.
      </h1>
      <p className="mt-4 text-sand">Vielleicht wurde sie verschoben – oder es hat sie nie gegeben.</p>
      <Link href="/" className="btn-primary mt-8">
        Zurück zur Leseecke
      </Link>
    </div>
  );
}
