import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Anmelden" };

export default function LoginPage() {
  return (
    <div className="motion-safe:animate-fade-in">
      <p className="font-hand text-2xl text-terracotta">Willkommen zurück!</p>
      <h1 className="mt-1 mb-7 font-serif text-3xl font-semibold text-ink [font-variation-settings:'SOFT'_100]">
        Schön, dass du wieder da bist.
      </h1>
      <LoginForm />
      <p className="mt-7 text-sm text-ink-soft">
        Noch kein Konto?{" "}
        <Link href="/register" className="font-semibold text-terracotta-deep underline-offset-2 hover:underline">
          Jetzt Platz nehmen
        </Link>
      </p>
    </div>
  );
}
