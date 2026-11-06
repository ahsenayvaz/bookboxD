// Sichtbare Ladeanzeige (NFA-05): ein Buch, dessen Seiten umgeblättert werden
export function Loading({ label = "Seiten werden umgeblättert …" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="loader-book" aria-hidden>
        <span className="loader-page" />
        <span className="loader-page" />
        <span className="loader-page" />
      </div>
      <span className="font-hand text-xl text-tan">{label}</span>
    </div>
  );
}
