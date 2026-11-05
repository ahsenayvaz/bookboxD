import type { Metadata } from "next";
// Schriften werden lokal ausgeliefert (keine Verbindung zu Google Fonts)
import "@fontsource-variable/caveat";
import "@fontsource-variable/figtree";
import "@fontsource-variable/figtree/wght-italic.css";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BookBoxD – Dein gemütlicher Ort für Bücher",
    template: "%s • BookBoxD",
  },
  description:
    "Halte fest, was du gelesen hast, merke dir, was du lesen willst, und teile deine Lieblingsseiten mit anderen Lesebegeisterten.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans text-[15px]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
