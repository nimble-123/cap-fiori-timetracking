# ADR 0004: Durchgaengiges TypeScript-Tooling und Developer-Workflow

## Status

Akzeptiert - Migration auf vollstaendiges TypeScript

## Kontext und Problemstellung

Das Projekt startete mit Mischbetrieb aus CAP-JavaScript-Beispielen und neuem TypeScript-Code. Ohne verbindliche Toolchain kam es zu fehlenden Typinformationen, manuellen Anpassungen in `gen/` und fehlerhaften Importen. Wir brauchten einen Workflow, der Typsicherheit, Generierung und Formatierung automatisiert liefert und gleichzeitig UI5-Workspaces bedient.

## Entscheidungsfaktoren

- Automatische Typgenerierung aus CDS ohne direkte Abhaengigkeit auf `gen/`.
- Hot-Reload fuer Service-Entwicklung mit TypeScript-Transpile.
- Einheitliche Formatierung vor Commits.
- Kompatibilitaet mit UI5-Subprojekten (Workspaces in `app/*`).

## Betrachtete Optionen

### Option A - Minimal-Setup mit `cds watch` und manuellem Typing

- Direkt `cds watch` ohne Typer, Imports aus `gen/`.
- Keine zentralen Format- oder Build-Skripte.

### Option B - Script-basierter Workflow mit Typer und Tooling

- `npm run watch` startet `cds-tsx w` fuer TypeScript-Hot-Reload (`package.json`).
- `@cap-js/cds-typer` generiert Modelle unter `@cds-models` automatisch bei `.cds`-Aenderungen; Pfad-Alias in `tsconfig.json` und `package.json` (`imports` Sektion).
- `npm run format` laeuft Prettier ueber relevante Verzeichnisse.
- `npm run generate-entry-point` (dev-cap-tools) dient als optionales Hilfsskript, um Entry Points/CLI-Wrapper neu zu erzeugen.

## Entscheidung

Wir verfolgen Option B. Der Workspace setzt `@cap-js/cds-typer` als Dev-Dependency ein und importiert Typen via `import { TimeEntry } from '#cds-models/TrackService';`. `npm run watch` ist der Standardbefehl fuer lokale Entwicklung, da er Transpile und Service-Neustart kombiniert. UI5-Apps bleiben als Yarn/NPM Workspaces eingebunden und koennen parallel gestartet werden.

## Konsequenzen

- Positiv: Typsichere Handler, Commands und Services ohne direkte Nutzung von `gen/`.
- Positiv: Developer folgen klaren Skripten (`watch`, `build`, `format`, optional `generate-entry-point` fuer CLI-Wrapper).
- Positiv: Pfad-Alias `#cds-models/*` vermeidet fragile Relativpfade.
- Negativ: Dev-CAP-Tools setzen bei Nutzung von `generate-entry-point` einen aktuellen CLI-Stand voraus; ansonsten keine manuellen Schritte fuer Typen notwendig.
- Negativ: Neue Entwickler muessen Tooling (cds-tsx, dev-cap-tools) installieren, bevor sie starten koennen.

## Verweise

- `package.json`
- `tsconfig.json`
- `@cds-models/TrackService/index.ts`
- `.github/copilot-instructions.md`
