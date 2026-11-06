import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Konto erstellen" };

export default function RegisterPage() {
  return (
    <div className="motion-safe:animate-fade-in">
      <p className="font-hand text-2xl text-terracotta">Komm rein, wärm dich auf.</p>
      <h1 className="mt-1 mb-7 font-serif text-3xl font-semibold text-ink [font-variation-settings:'SOFT'_100]">
        Dein eigenes Lesetagebuch
      </h1>
      <RegisterForm />
      <p className="mt-7 text-sm text-ink-soft">
        Schon dabei?{" "}
        <Link href="/login" className="font-semibold text-terracotta-deep underline-offset-2 hover:underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
