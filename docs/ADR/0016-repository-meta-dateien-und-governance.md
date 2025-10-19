# ADR 0016: Repository-Meta-Dateien und Governance-Struktur

## Status
Akzeptiert – Grundlegende Meta-Dateien eingeführt

## Kontext und Problemstellung
Das Projekt wuchs von einer Prototyp-Implementierung zu einer umfassend dokumentierten Referenzanwendung. Bisher fehlten jedoch standardisierte Meta-Dateien (Code of Conduct, Security-Prozess, Issue- und PR-Vorlagen, `.env`-Beispiele usw.), die für Kollaboration, Compliance und Wartbarkeit essenziell sind. Ohne diese Leitplanken mussten Richtlinien ad hoc erklärt werden, Sicherheitsmeldungen liefen unstrukturiert auf und neue Contributors hatten keinen roten Faden.

## Entscheidungsfaktoren
- Klare Community- und Sicherheitsrichtlinien (Open Source Best Practices)
- Reproduzierbare lokale Setups (Node-Version, .env-Beispiele, Editor-Einstellungen)
- Automatisierte Dependency-Sicherheit (Dependabot)
- Einheitliche Beiträge (Issue-/PR-Vorlagen, CODEOWNERS)
- Geringer Overhead in Pflege und Dokumentation

## Betrachtete Optionen
### Option A – Minimal-Setup ohne zusätzliche Meta-Dateien
- Konzentration auf Quellcode und Architektur-Dokumente
- Kommunikation über individuelle Issues/PRs
- Vorteil: Kein zusätzlicher Pflegeaufwand
- Nachteil: Hohe Einarbeitungshürde, inkonsistente Prozesse, keine proaktive Security- oder Dependency-Strategie

### Option B – Kuratiertes Set an Meta-Dateien (Best Practices)
- `.env.example`, `.editorconfig`, `.nvmrc`, `.npmrc`
- Community-Richtlinien (`CODE_OF_CONDUCT.md`, `SECURITY.md`, `.github/CODEOWNERS`)
- Automatisierte Pflege (`.github/dependabot.yml`)
- Beitragstemplates (`.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`)
- Vorteil: Definierte Prozesse, geringere Einstiegshürden, automatische Benachrichtigung relevanter Reviewer
- Nachteil: Zusätzlicher Initial- und Pflegeaufwand, Dateien müssen aktuell gehalten werden

## Entscheidung
Wir entscheiden uns für Option B und führen ein vollständiges Paket an Meta-Dateien ein. Dadurch wird das Repository produktionsreif, Contributors verstehen Erwartungen sofort und Sicherheits- bzw. Wartungsvorfälle können strukturiert abgewickelt werden. CODEOWNERS weist vorerst alle Änderungen `@nimble-123` zu, was spätere Erweiterungen (Teams/Module) vereinfacht.

## Konsequenzen
- Positiv: Vereinheitlichte Arbeitsweise, klarer Verantwortlichkeiten, reproduzierbare lokale Umgebung
- Positiv: Dependabot informiert proaktiv über Updates in CAP-, UI5- und GitHub-Actions-Abhängigkeiten
- Positiv: Sicherheitslücken können vertraulich gemeldet und koordiniert geschlossen werden
- Negativ: Meta-Dateien müssen mit Produktentwicklungen synchron gehalten werden (z. B. neue Umgebungsvariablen, geänderte Build-Skripte)
- Negativ: Zusätzliche Reviewer-Benachrichtigungen können zunächst den Review-Backlog erhöhen

## Verweise
- `.env.example`
- `.editorconfig`
- `.nvmrc`
- `.npmrc`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `.github/CODEOWNERS`
- `.github/ISSUE_TEMPLATE/`
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/dependabot.yml`
- `docs/ADR/template.md`
