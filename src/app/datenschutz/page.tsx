import type { Metadata } from "next";
import Link from "next/link";
import { ADDRESS, CONTACT_EMAIL, DB_REGION, LEGAL_UPDATED, RESPONSIBLE } from "@/lib/site";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default function PrivacyPage() {
  return (
    <div className="px-4 pt-10">
    <article className="paper prose-paper mx-auto max-w-3xl p-7 text-[15px] motion-safe:animate-fade-up sm:p-12">
      <h1 className="font-serif text-4xl font-semibold text-ink [font-variation-settings:'SOFT'_100]">Datenschutzerklärung</h1>
      <p className="mt-3 text-xs text-ink-soft">
        Stand: {LEGAL_UPDATED} · Türkische Fassung:{" "}
        <Link href="/kvkk">KVKK-Aydınlatma Metni</Link>
      </p>

      <p className="mt-6">
        BookBoxD ist ein Studienprojekt im Modul INF303 Software Engineering. Wir verarbeiten personenbezogene Daten
        nur, soweit dies für den Betrieb der Anwendung erforderlich ist – nach der Datenschutz-Grundverordnung (DSGVO)
        und dem türkischen Datenschutzgesetz Nr. 6698 (KVKK).
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {RESPONSIBLE}
        <br />
        {ADDRESS}
        <br />
        E-Mail: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>2. Welche Daten wir verarbeiten</h2>
      <ul>
        <li>
          <strong>Kontodaten:</strong> E-Mail-Adresse, Benutzername und Passwort. Das Passwort speichern wir nie im
          Klartext, sondern ausschließlich als bcrypt-Hash.
        </li>
        <li>
          <strong>Profildaten (freiwillig):</strong> Kurzbeschreibung und Profilbild. Hochgeladene Bilder werden auf
          400 × 400 Pixel verkleinert; eingebettete Metadaten (z. B. Standortdaten) werden dabei entfernt.
        </li>
        <li>
          <strong>Lesedaten:</strong> Bücher in deiner Bibliothek, Leselisten, Lesefortschritt, Bewertungen und
          Rezensionen.
        </li>
        <li>
          <strong>Technische Daten:</strong> ein Session-Cookie sowie Verbindungsdaten (z. B. IP-Adresse), die beim
          Aufruf der Seite technisch anfallen.
        </li>
      </ul>

      <h2>3. Zwecke und Rechtsgrundlagen</h2>
      <p>
        Wir verarbeiten deine Daten, um dir ein Konto, deine persönliche Bibliothek und die Community-Funktionen
        bereitzustellen (Art. 6 Abs. 1 lit. b DSGVO; Art. 5 Abs. 2 lit. c KVKK) sowie um den sicheren Betrieb der
        Anwendung zu gewährleisten (Art. 6 Abs. 1 lit. f DSGVO; Art. 5 Abs. 2 lit. f KVKK).
      </p>

      <h2>4. Cookies</h2>
      <p>
        Wir verwenden ausschließlich ein technisch notwendiges Cookie (<code>bbd_session</code>), das dich nach der
        Anmeldung bis zu 30 Tage angemeldet hält. Es ist signiert, für Skripte nicht lesbar und wird beim Abmelden
        gelöscht. Tracking- oder Werbe-Cookies setzen wir nicht ein.
      </p>

      <h2>5. Öffentlich sichtbare Daten</h2>
      <p>
        Dein Benutzername, deine Kurzbeschreibung, dein Profilbild, deine Leselisten sowie veröffentlichte
        Bewertungen und Rezensionen sind auf deinem Profil für andere sichtbar. Deine E-Mail-Adresse ist niemals
        öffentlich.
      </p>

      <h2>6. Empfänger und Drittanbieter</h2>
      <ul>
        <li>
          <strong>Supabase</strong> (Datenbank-Hosting): Alle Kontodaten werden in einer PostgreSQL-Datenbank
          gespeichert. Serverstandort: {DB_REGION}.
        </li>
        <li>
          <strong>Open Library</strong> (Internet Archive, USA): Für Suche und Buchdetails sendet unser Server
          Suchbegriffe und Buch-IDs an Open Library. Dabei werden keine personenbezogenen Daten übermittelt.
          Buchcover werden über unseren Server geladen, sodass dein Browser keine direkte Verbindung zu Open Library
          aufbaut.
        </li>
        <li>
          <strong>Schriftarten</strong> werden lokal ausgeliefert; es findet keine Verbindung zu Google Fonts statt.
        </li>
      </ul>

      <h2>7. Speicherdauer</h2>
      <p>
        Wir speichern deine Daten, solange dein Konto besteht. Unter{" "}
        <Link href="/settings">Einstellungen → Konto löschen</Link> kannst du dein Konto jederzeit selbst löschen;
        dabei werden alle zugehörigen Daten sofort und vollständig entfernt.
      </p>

      <h2>8. Deine Rechte</h2>
      <p>Du hast nach der DSGVO insbesondere das Recht auf</p>
      <ul>
        <li>Auskunft über deine gespeicherten Daten (Art. 15),</li>
        <li>Berichtigung unrichtiger Daten (Art. 16) – die meisten Angaben kannst du selbst im Profil ändern,</li>
        <li>Löschung (Art. 17) und Einschränkung der Verarbeitung (Art. 18),</li>
        <li>Datenübertragbarkeit (Art. 20) und Widerspruch (Art. 21),</li>
        <li>Beschwerde bei einer Datenschutz-Aufsichtsbehörde (Art. 77).</li>
      </ul>
      <p>
        Die entsprechenden Rechte nach Art. 11 KVKK findest du im{" "}
        <Link href="/kvkk">KVKK-Aydınlatma Metni</Link>. Für Anfragen genügt eine E-Mail an{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </article>
    </div>
  );
}
