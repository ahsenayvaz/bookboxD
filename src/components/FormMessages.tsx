// Meldungen für Formulare auf Papierflächen
export function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="field-error motion-safe:animate-fade-in">
      {errors[0]}
    </p>
  );
}

export function FormAlert({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-[#9a3b20]/25 bg-[#9a3b20]/8 px-3.5 py-2.5 text-sm text-[#8a321a] motion-safe:animate-fade-up"
      >
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p
        role="status"
        className="flex items-center gap-2 rounded-lg border border-moss/35 bg-moss/12 px-3.5 py-2.5 text-sm text-[#4c5a26] motion-safe:animate-fade-up"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m3 8.5 3.2 3L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {success}
      </p>
    );
  }
  return null;
}
