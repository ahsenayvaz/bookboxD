"use client";

import { useEffect } from "react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="font-hand text-3xl text-ember">Oh nein …</p>
      <h1 className="mt-1 font-serif text-4xl font-semibold text-cream">Da ist uns eine Seite verrutscht.</h1>
      <p className="mt-4 text-sand">Die Seite konnte nicht geladen werden. Versuch es einfach noch einmal.</p>
      <button type="button" onClick={() => retry()} className="btn-primary mt-8">
        Noch einmal versuchen
      </button>
    </div>
  );
}
