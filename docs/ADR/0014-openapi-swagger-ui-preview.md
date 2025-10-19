# ADR 0014: Swagger UI Preview für TrackService

## Status
Akzeptiert – Iteration 10 (Developer Experience Improvements)

## Kontext und Problemstellung
Die OData-APIs des TrackService werden sowohl vom Fiori Frontend als auch von Integrationspartnern genutzt. Bisher fehlte eine leicht zugängliche, stets aktuelle API-Dokumentation. Testdaten konnten nur über REST Client Dateien oder manuelle Requests nachvollzogen werden, was die Onboarding-Zeit für neue Teammitglieder verlängerte und in der Qualitätsdokumentation als technische Schuld (TD-3) markiert war.

## Entscheidungsfaktoren
- **Aktualität:** API-Beschreibung muss automatisch aus den CDS-Modellen generiert werden (kein manueller Pflegeaufwand).
- **Entwickler-Produktivität:** Neue Teammitglieder sollen die Endpunkte schnell explorieren können.
- **Wartbarkeit:** Lösung soll ohne zusätzlichen Custom-Code in den CAP-Server integrierbar sein.
- **Scope-Kontrolle:** Bereitstellung nur im Development, damit keine unauthentifizierten API-Dokumente in produktiven Umgebungen veröffentlicht werden.

## Betrachtete Optionen

### Option A – `cds-swagger-ui-express` Plugin **(gewählt)**
- **Vorteile:**
  - Nahtlose Integration in den CAP-Server über den `serving`-Hook.
  - Generiert OpenAPI-Spezifikationen on-the-fly via `@cap-js/openapi`.
  - Stellt eine interaktive Swagger UI inklusive Diagramm bereit (`/$api-docs/...`).
  - Zero-Config: Default-Einstellungen reichen für lokale Entwicklung.
- **Nachteile:**
  - Läuft ausschließlich zur Entwicklungszeit; produktive Bereitstellung müsste separat abgesichert werden.

### Option B – Manuelle OpenAPI-Generierung via `cds compile`
- **Vorteile:**
  - Liefert ein statisches OpenAPI-JSON, das versioniert werden kann.
  - Keine zusätzlichen Runtime-Abhängigkeiten.
- **Nachteile:**
  - Kein UI; zusätzliche Tools notwendig (Postman, Stoplight, etc.).
  - Erfordert Skripte/Automation, um Spezifikationen aktuell zu halten.
  - Kein schneller Zugang für Nicht-Entwickler.

### Option C – Postman/REST Client Collections pflegen
- **Vorteile:**
  - Niedrigschwelliger Einstieg für gezielte Testfälle.
- **Nachteile:**
  - Kein vollwertiges API-Directory; hoher manueller Pflegeaufwand.
  - Nicht selbstdokumentierend, keine automatische Modell-Synchronisation.

## Entscheidung
Wir integrieren Option A (`cds-swagger-ui-express`) als Dev Dependency. Beim Start über `npm run watch` registriert sich das Plugin automatisch und stellt die Swagger UI unter `http://localhost:4004/$api-docs/odata/v4/track/` bereit. Die zugrundeliegende OpenAPI-Spezifikation ist zusätzlich als JSON unter `/$api-docs/odata/v4/track/openapi.json` verfügbar. Damit erfüllen wir die dokumentierte technische Schuld TD-3 und verbessern das Onboarding neuer Entwickler sowie die Zusammenarbeit mit Integrationspartnern.

## Konsequenzen

**Positiv**
- Interaktive API-Dokumentation ohne zusätzlichen Pflegeaufwand.
- Konsistenz zwischen CDS-Modell und bereitgestellter Spezifikation.
- Schnellere Abstimmung mit UI- und Integrations-Teams dank Swagger UI.

**Negativ**
- Bisher keine produktive Bereitstellung; für externe Konsumenten wäre ein abgesichertes Swagger-Hosting notwendig.
- Zusätzliche Dev Dependency, die lokal installiert werden muss.

## Verweise
- `package.json` – Dev Dependency `cds-swagger-ui-express`
- `README.md` – Abschnitt „Highlights“ & Quick Start (Swagger UI Hinweis)
- `GETTING_STARTED.md` – Kapitel „Swagger UI & OpenAPI (nur Entwicklung)“
- `docs/ARCHITECTURE.md` – Abschnitt [8.9 OpenAPI & Swagger UI](../ARCHITECTURE.md#89-openapi--swagger-ui) & aktualisierte technische Schuld TD-3
