# ADR 0017: Release-Automatisierung mit `release-please`

## Status
Akzeptiert – Umsetzung in der aktuellen Iteration abgeschlossen

## Kontext und Problemstellung
- Bisher erfolgte die Versionierung und Changelog-Pflege manuell, obwohl Commits bereits das Conventional-Commits-Schema nutzen.
- Das Repository enthält mehrere `package.json`-Dateien (Root + UI5-Apps unter `app/*`), die synchron versioniert werden müssen.
- Für spätere SAP-BTP-Deployments (Cloud Foundry) soll ein nachvollziehbarer Release-Prozess etabliert sein, der sich einfach in CI/CD integrieren lässt.
- GitHub wird als Quellcode- und Automatisierungsplattform eingesetzt; Branch-Strategie ist aktuell „main-only“ mit optionalen Feature-Branches.

## Entscheidungsfaktoren
- **Nachvollziehbarkeit & Reviewbarkeit** – Release-Schritte sollen über PRs überprüfbar bleiben.
- **Mehrpaket-Fähigkeit** – konsistente Versionierung über Root- und App-Packages hinweg.
- **Stabilität & Wartbarkeit** – etablierte, aktiv gepflegte Lösung ohne proprietäre Erweiterungen.
- **CI/CD-Integration** – unkomplizierte Anbindung an GitHub Actions und spätere Erweiterbarkeit (Deployments, Artefakte).
- **Onboarding & Dokumentation** – der Prozess muss leicht verständlich und dokumentierbar sein.

## Betrachtete Optionen
### Option A – `semantic-release`
- **Kernelemente**: CLI-Tool, Plugins für Changelog, Git Tags, optionale npm-Publikation.
- **Vorteile**: Sehr verbreitet, große Plugin-Landschaft, vollautomatische Releases.
- **Nachteile**: Weniger Fokus auf PR-basierte Freigabe, mehr Eigenkonfiguration für Monorepos, schreibt direkt auf `main`.

### Option B – `release-please` (Google)
- **Kernelemente**: Release-PRs, Manifest-/Monorepo-Support, GitHub Action.
- **Vorteile**: PR-Zentrierter Workflow, `node-workspace`-Plugin synchronisiert mehrere Packages, native GitHub-Integration.
- **Nachteile**: Fokus auf GitHub-Ökosystem, kein direktes npm-Publishing (hier jedoch nicht erforderlich).

### Option C – Manueller Prozess
- **Kernelemente**: Manuelle Versionserhöhungen + Changelog-Einträge.
- **Vorteile**: Keine zusätzliche Tooling-Abhängigkeit.
- **Nachteile**: Fehleranfällig, unskalierbar, fehlende Automatisierung für geplante CI/CD-Erweiterungen.

## Entscheidung
- Wir entscheiden uns für **Option B – `release-please` mit Manifest-Workflow**.
- Konfiguration über `release-please-config.json` + `.release-please-manifest.json`, inklusive `node-workspace`-Plugin für `app/timetable` und `app/timetracking`.
- GitHub Action (`.github/workflows/release-please.yaml`) triggert auf `main` und erzeugt/aktualisiert Release-PRs mit Changelog, Version Bumps und Tags nach Merge.
- Lokaler Dry-Run über `npx release-please release-pr --dry-run` bleibt vor dem ersten echten Lauf verpflichtend.

## Konsequenzen
- **Positiv**: Automatisierte, überprüfbare Releases; konsistente Versionen in allen Packages; Changelog wird kontinuierlich gepflegt.
- **Negativ/Risiken**: Abhängigkeit vom Release-Please-Projekt; Conventional-Commit-Disziplin erforderlich; Tokens/Permissions müssen gepflegt werden.
- **Follow-ups**: Integration des Release-Schritts in zukünftige BTP-Deployments; regelmäßige Prüfung der Action-Version; Ergänzung von Release-Notes-Vorlagen, sobald Deployments live gehen.

## Verweise
- Konfiguration: `release-please-config.json`, `.release-please-manifest.json`
- GitHub Action: `.github/workflows/release-please.yaml`
- Dokumentation: `README.md` (Release-Prozess), `docs/ARCHITECTURE.md` Abschnitt „Transport & Lifecycle Governance“
