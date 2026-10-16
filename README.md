# BookBoxD

Web-Anwendung zum Verwalten der eigenen Lektüre – im Stil von Letterboxd.
INF303 Software Engineering Projekt, Türkisch-Deutsche Universität (WiSe 2026).

**Stack:** Next.js 16 (App Router) · Tailwind CSS 4 · Prisma 7 · PostgreSQL (Supabase) · Open Library API

## Motivation

BookBoxD bündelt die Organisation der eigenen Buchsammlung („Will lesen“, „Lese ich gerade“, „Gelesen“), motivierende Lese-Routinen wie den täglichen Lese-Streak und den Austausch über Bewertungen sowie Rezensionen an einem zentralen Ort.

## Sprint-Übersicht

- **Sprint 1 (05.10 – 16.10.2026):** Projektplanung, Repository-Setup, Logo und Datenbank-Entwurf
- **Sprint 2 (02.11 – 13.11.2026):** Authentifizierung, Datenschutz/KVKK, Benutzerprofil, Buchsuche und Detailseite
- **Sprint 3 (16.11 – 01.12.2026):** Leselisten, Lesefortschritt, Streak, Bewertungen, Rezensionen und Challenge
- **Sprint 4 (02.12 – 17.12.2026):** Soziale Funktionen, Empfehlungen, KI-Assistent, Mehrsprachigkeit und Dark Mode

## Einrichtung

```bash
npm install
cp .env.example .env
npm run dev
```

## Zusammenarbeit

Entwicklung erfolgt über Feature-Branches (`feature/*`), Zusammenführung auf `develop` und Meilenstein-Releases auf `main`.
