# BookBoxD

Web-Anwendung zum Verwalten der eigenen Lektüre – im Stil von Letterboxd.
INF303 Software Engineering Projekt, Türkisch-Deutsche Universität (WiSe 2026).

**Stack:** Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Prisma 7 · PostgreSQL (Supabase) · Open Library API

## Einrichtung

```bash
npm install                 # erzeugt auch den Prisma Client (postinstall)
cp .env.example .env        # Werte eintragen, siehe unten
npm run db:deploy           # Migrationen auf die Datenbank anwenden
npm run dev                 # http://localhost:3000
```

### Umgebungsvariablen

| Variable         | Woher                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`   | Supabase → _Connect_ → **Transaction pooler** (Port 6543) – wird von der App zur Laufzeit genutzt       |
| `DIRECT_URL`     | Supabase → _Connect_ → **Session pooler** (Port 5432) – wird von Prisma für Migrationen genutzt          |
| `SESSION_SECRET` | Zufallswert ≥ 32 Zeichen: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

### Datenbank

- Schema: `prisma/schema.prisma`, Migrationen: `prisma/migrations/`
- Schema ändern → `npm run db:migrate -- --name <beschreibung>` (erstellt und wendet eine neue Migration an)
- Daten ansehen → `npm run db:studio`
- Die Init-Migration aktiviert **Row Level Security** auf allen Tabellen. Ohne RLS wären die Tabellen über die
  öffentliche Supabase-REST-API lesbar (inkl. Passwort-Hashes). Prisma verbindet sich als Owner und ist davon nicht
  betroffen. Neue Tabellen in späteren Migrationen ebenfalls mit `ALTER TABLE "…" ENABLE ROW LEVEL SECURITY;` sperren.

## Sprint 2 – Umsetzung

| Backlog | Inhalt                                    | Umsetzung                                                                                        |
| ------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| ID-33   | Sichere Authentifizierung                 | bcrypt-Hashes (12 Runden), signiertes httpOnly-Session-Cookie (`src/lib/session.ts`, `dal.ts`)    |
| ID-18   | Passwortgeschützte Anmeldung              | `/register`, `/login` (E-Mail oder Benutzername), Abmelden; `src/actions/auth.ts`                |
| ID-34   | Datenschutzerklärung & KVKK               | `/datenschutz` (DSGVO, Deutsch), `/kvkk` (Aydınlatma Metni, Türkisch), Zustimmung bei Registrierung |
| ID-5    | Benutzerprofil erstellen und bearbeiten   | `/u/[username]` mit Statistik & Streak, `/settings` (Benutzername, Bio, Konto löschen)            |
| ID-6    | Profilbild hochladen                      | JPG/PNG, max. 2 MB, Formatprüfung am Inhalt, auf 400×400 verkleinert, Standardavatar             |
| ID-7    | Suche nach Buch oder Autor                | `/search` mit Filter Alles/Titel/Autor, Seitenumschaltung                                        |
| ID-19   | Bücher mit Covern anzeigen                | Cover in Suche, Listen und Detailseite (über `next/image`)                                       |
| ID-12   | Buchdetailseite                           | `/book/[id]`: Cover, Titel, Autor, Beschreibung, Seitenzahl, Ø-Bewertung, Rezensionen            |
| ID-32   | Datenbank-Architektur (Rest aus Sprint 1) | User, Avatar, Book, LibraryEntry, Review, ReadingLog                                             |

**Zusätzlich:** Auf der Detailseite kann ein Buch bereits den Listen _Gelesen / Lese ich / Will lesen_ zugeordnet
werden (Vorgriff auf ID-17), damit Profil-Statistik und Regale mit echten Daten funktionieren.

### Hinweise

- **Buchdaten kommen von Open Library** statt Google Books: Die Google Books API beantwortet Anfragen ohne API-Key
  nicht mehr. Open Library ist kostenlos und braucht keinen Key (`src/lib/openlibrary.ts`).
- **Design:** warme Leseecken-Optik (Terrakotta, Pergament, Walnuss) mit Animationen (Buch öffnet sich beim Anmelden, Teyze im Schaukelstuhl, Bücherregale). Bei „Bewegung reduzieren“ im Betriebssystem bleiben alle Animationen aus.
- **Schriften** (Fraunces, Figtree, Caveat) werden über Fontsource lokal ausgeliefert – keine Verbindung zu Google Fonts.
- **Vor dem Livegang** Kontaktadresse und Datenbank-Region in `src/lib/site.ts` anpassen (erscheinen in
  Datenschutzerklärung und KVKK-Seite).

## Projektstruktur

```
prisma/                 Schema + Migrationen
src/actions/            Server Actions (auth, profile, library)
src/app/                Routen (App Router)
src/components/         UI-Komponenten
src/lib/                DB-Client, Session, Data Access Layer, Open Library, Statistik
src/proxy.ts            Weiterleitungen für geschützte Seiten (früher middleware.ts)
```
