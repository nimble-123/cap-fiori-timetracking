# 🤝 Contributing Guide

Vielen Dank, dass du zum **CAP Fiori Time Tracking** Projekt beitragen möchtest! 🎉

Diese Guidelines helfen dir, effektiv zum Projekt beizutragen und sicherzustellen, dass deine Änderungen schnell gemerged werden können.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Wie kann ich beitragen?](#-wie-kann-ich-beitragen)
- [Development Setup](#-development-setup)
- [Code Style Guidelines](#-code-style-guidelines)
- [Commit Conventions](#-commit-conventions)
- [Branch Strategy](#-branch-strategy)
- [Pull Request Process](#-pull-request-process)
- [Testing Guidelines](#-testing-guidelines)
- [Design Pattern Compliance](#-design-pattern-compliance)
- [Dokumentation](#-dokumentation)

---

## 📜 Code of Conduct

Dieses Projekt folgt einem **respektvollen und inklusiven** Miteinander:

- ✅ Sei freundlich und respektvoll
- ✅ Akzeptiere konstruktive Kritik
- ✅ Fokussiere auf das Beste für die Community
- ❌ Keine Beleidigungen, Diskriminierung oder Trolling

Bei Verstößen: Melde dich bei den Maintainern.

---

## 🎯 Wie kann ich beitragen?

### 1. 🐛 Bug Reports

Einen Bug gefunden? Hilf uns, ihn zu fixen!

**Bevor du einen Bug Report erstellst:**

- [ ] Prüfe [GitHub Issues](https://github.com/nimble-123/cap-fiori-timetracking/issues), ob der Bug schon gemeldet wurde
- [ ] Stelle sicher, dass du die neueste Version verwendest
- [ ] Prüfe [Known Issues](docs/ARCHITECTURE.md#bekannte-probleme) in der Dokumentation

**Ein guter Bug Report enthält:**

```markdown
**Beschreibung:**
Kurze Beschreibung des Problems

**Steps to Reproduce:**

1. Gehe zu...
2. Klicke auf...
3. Scrolle nach unten zu...
4. Siehe Fehler

**Erwartetes Verhalten:**
Was sollte passieren?

**Tatsächliches Verhalten:**
Was passiert stattdessen?

**Screenshots:**
(falls relevant)

**Umgebung:**

- OS: [z.B. Windows 11, macOS 14]
- Node.js Version: [z.B. 20.11.0]
- npm Version: [z.B. 10.2.4]
- Browser: [z.B. Chrome 120, Safari 17]

**Zusätzlicher Kontext:**
Logs, Error Messages, etc.
```

### 2. 💡 Feature Requests

Eine coole Idee für ein neues Feature?

**Ein guter Feature Request enthält:**

```markdown
**Problem/Use Case:**
Welches Problem löst dieses Feature?

**Vorgeschlagene Lösung:**
Wie stellst du dir das Feature vor?

**Alternativen:**
Hast du andere Lösungen in Betracht gezogen?

**Business Value:**
Welchen Nutzen bringt es?

**Zusätzlicher Kontext:**
Screenshots, Mockups, Links zu ähnlichen Features
```

### 3. 🔧 Code Contributions

Du willst selbst Hand anlegen? Perfekt!

**Gute erste Beiträge:**

- 🟢 **Easy**: Typo-Fixes, Dokumentation verbessern, i18n-Übersetzungen
- 🟡 **Medium**: Neue Validatoren, Tests schreiben, Bug Fixes
- 🔴 **Hard**: Neue Commands/Strategies, Architecture Changes

**Schau nach Issues mit diesen Labels:**

- `good-first-issue` - Perfekt für Einsteiger
- `help-wanted` - Wir brauchen Unterstützung
- `documentation` - Doku-Verbesserungen

---

## 🛠️ Development Setup

### Prerequisites

Stelle sicher, dass du Folgendes installiert hast:

- **Node.js** ≥20.x LTS
- **npm** ≥10.x
- **TypeScript** ≥5.0
- **Git**
- **VS Code** (empfohlen)

### Setup-Schritte

```bash
# 1. Fork das Repository auf GitHub
# (Klick auf "Fork" Button oben rechts)

# 2. Clone dein Fork
git clone https://github.com/YOUR_USERNAME/cap-fiori-timetracking.git
cd cap-fiori-timetracking

# 3. Füge Original-Repo als "upstream" hinzu
git remote add upstream https://github.com/nimble-123/cap-fiori-timetracking.git

# 4. Dependencies installieren
npm install

# 5. Development Server starten
npm run watch
```

### Verify Setup

```bash
# Öffne Browser auf http://localhost:4004
# Login mit Test-User: max.mustermann@test.de / max
```

Wenn alles läuft: **Du bist ready! 🚀**

---

## 🎨 Code Style Guidelines

### TypeScript Best Practices

**✅ DO:**

```typescript
// Explizite Typen für Parameter und Return Values
function calculateOvertime(netHours: number, expectedHours: number): number {
  return Math.max(0, netHours - expectedHours);
}

// Interfaces für komplexe Strukturen
interface TimeEntryData {
  entryDate: string;
  startTime: string;
  endTime: string;
  breakMin: number;
}

// Sprechende Variablennamen
const expectedDailyHours = 7.2;
const overtimeThreshold = 0.5;
```

**❌ DON'T:**

```typescript
// Keine any-Types (außer absolut unvermeidbar)
function process(data: any): any { ... }  // ❌

// Keine ungetypten Parameter
function calculate(x, y) { ... }  // ❌

// Keine Abkürzungen/Kryptische Namen
const x = 7.2;  // ❌
const tmp = calcOT(n, e);  // ❌
```

### Naming Conventions

| Element             | Konvention                           | Beispiel                                       |
| ------------------- | ------------------------------------ | ---------------------------------------------- |
| **Klassen**         | PascalCase                           | `TimeEntryValidator`, `CreateTimeEntryCommand` |
| **Interfaces**      | PascalCase mit `I` Prefix (optional) | `IServiceContainer`, `TimeEntryData`           |
| **Funktionen**      | camelCase, Verb + Noun               | `calculateOvertime()`, `validateTimeEntry()`   |
| **Variablen**       | camelCase                            | `durationHoursNet`, `expectedDailyHours`       |
| **Konstanten**      | UPPER_SNAKE_CASE                     | `DEFAULT_BREAK_MIN`, `MAX_OVERTIME_HOURS`      |
| **Private Members** | `_` Prefix (optional)                | `_container`, `_validator`                     |
| **CDS Files**       | kebab-case                           | `data-model.cds`, `field-controls.cds`         |
| **Directories**     | kebab-case                           | `track-service/`, `handlers/`                  |

### File Structure

**Pattern-Klassen:**

```typescript
// srv/track-service/handler/commands/CreateTimeEntryCommand.ts

import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';

/**
 * Command zum Erstellen eines neuen TimeEntry.
 *
 * @description Validiert Eingaben, berechnet Zeitwerte und erstellt Entry.
 * @see ADR-0002-command-pattern-business-logik.md
 */
export class CreateTimeEntryCommand {
  constructor(
    private userService: UserService,
    private validator: TimeEntryValidator,
    private repository: TimeEntryRepository,
    private factory: TimeEntryFactory,
  ) {}

  /**
   * Führt Command aus.
   *
   * @param tx - CDS Transaction
   * @param entryData - Eingabedaten für TimeEntry
   * @returns Vorbereitete Daten für Insert (nicht gespeichert)
   * @throws Error wenn Validierung fehlschlägt
   */
  async execute(tx: Transaction, entryData: Partial<TimeEntry>): Promise<any> {
    // Implementation
  }
}
```

**Barrel Exports (index.ts):**

```typescript
// srv/track-service/handler/commands/index.ts

export * from './CreateTimeEntryCommand';
export * from './UpdateTimeEntryCommand';
export * from './GenerateMonthlyCommand';
// ... alle Commands
```

### Code Formatting

**Automatisches Formatting mit Prettier:**

```bash
# Vor jedem Commit (PFLICHT!)
npm run format
```

**Prettier Config (bereits in `.prettierrc`):**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**VS Code Settings (empfohlen):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Linting

**ESLint Checks:**

```bash
# Manuell prüfen
npm run lint

# Auto-Fix
npm run lint -- --fix
```

---

## 📝 Commit Conventions

Wir folgen [Conventional Commits](https://www.conventionalcommits.org/) 1.0.0.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | Beschreibung       | Beispiel                                  |
| ---------- | ------------------ | ----------------------------------------- |
| `feat`     | Neues Feature      | `feat: add PDF export for reports`        |
| `fix`      | Bug Fix            | `fix: correct overtime calculation`       |
| `docs`     | Dokumentation      | `docs: update README with new patterns`   |
| `refactor` | Code-Verbesserung  | `refactor: extract validation logic`      |
| `test`     | Tests              | `test: add unit tests for BalanceService` |
| `chore`    | Build/Dependencies | `chore: update @sap/cds to v9.3.0`        |
| `style`    | Formatting         | `style: apply prettier to handler files`  |
| `perf`     | Performance        | `perf: optimize database queries`         |
| `ci`       | CI/CD              | `ci: add GitHub Actions workflow`         |

### Scope (optional)

Betroffene Komponente:

- `handler`, `command`, `validator`, `repository`, `service`
- `ui`, `frontend`, `backend`
- `db`, `model`, `annotations`

### Subject

- Nutze **Imperativ** ("add", nicht "added" oder "adds")
- Kleinbuchstaben (kein Capital Letter)
- Kein Punkt am Ende
- Max. 50 Zeichen

### Body (optional)

- Erkläre **WAS** und **WARUM** (nicht WIE - das sieht man im Code)
- Wrapping bei 72 Zeichen

### Footer (optional)

- `BREAKING CHANGE:` für Breaking Changes
- `Closes #123` für Issue-Referenzen

### Beispiele

**Einfacher Commit:**

```bash
git commit -m "feat: add monthly report generation"
```

**Detaillierter Commit:**

```bash
git commit -m "feat(command): add GenerateMonthlyReportCommand

Implements monthly PDF report generation with overview statistics.
Uses new ReportService to aggregate time entries by project.

Closes #42"
```

**Breaking Change:**

```bash
git commit -m "refactor(container)!: change ServiceContainer API

BREAKING CHANGE: ServiceContainer.get() now requires category parameter.
Migration: Replace container.get('user') with container.get('service', 'user')"
```

---

## 🌿 Branch Strategy

### Branch-Namen

```
<type>/<short-description>
```

**Beispiele:**

```bash
feat/pdf-export
fix/overtime-calculation
docs/update-readme
refactor/extract-validator
test/balance-service
```

### Workflow

```bash
# 1. Sync mit upstream
git fetch upstream
git checkout main
git merge upstream/main

# 2. Neuen Branch erstellen
git checkout -b feat/my-awesome-feature

# 3. Arbeite an deinem Feature
# ... edit files ...

# 4. Commits erstellen
git add .
git commit -m "feat: add awesome feature"

# 5. Pushe zu deinem Fork
git push origin feat/my-awesome-feature

# 6. Erstelle Pull Request auf GitHub
```

### Merge Strategy

- **Main Branch**: Nur stable, getestete Features
- **Feature Branches**: Werden via Squash Merge gemerged
- **Hotfixes**: Direkt in main, dann back-merge zu feature branches

---

## 🔀 Pull Request Process

### Vor dem PR

**Checklist:**

- [ ] `npm run format` ausgeführt (Prettier)
- [ ] `npm run build` erfolgreich (TypeScript-Check)
- [ ] `npm run lint` ohne Errors (ESLint)
- [ ] Tests laufen durch (falls vorhanden)
- [ ] Commit Messages folgen Conventional Commits
- [ ] Branch ist aktuell mit `main`

### PR Template

```markdown
## 📝 Beschreibung

Kurze Beschreibung der Änderungen

## 🎯 Motivation

Warum ist diese Änderung nötig? Welches Problem löst sie?

## 🔧 Änderungen

- Bullet-Liste der Änderungen
- Was wurde hinzugefügt/geändert/gelöscht

## 🧪 Testing

Wie wurde getestet?

- [ ] Manuell getestet (Steps: ...)
- [ ] Unit Tests hinzugefügt
- [ ] Integration Tests laufen durch

## 📸 Screenshots (falls UI-Änderung)

| Vorher       | Nachher      |
| ------------ | ------------ |
| Screenshot 1 | Screenshot 2 |

## 📋 Checklist

- [ ] Code folgt Style Guidelines
- [ ] Commits folgen Conventional Commits
- [ ] Dokumentation aktualisiert (falls nötig)
- [ ] Tests hinzugefügt/aktualisiert
- [ ] Keine Breaking Changes (oder explizit dokumentiert)

## 🔗 Related Issues

Closes #123
Relates to #456
```

### Review Process

1. **Automated Checks**: CI/CD läuft (Build, Lint, Tests)
2. **Code Review**: Mindestens 1 Maintainer reviewed
3. **Changes Requested**: Implementiere Feedback
4. **Approval**: Maintainer approved
5. **Merge**: Squash & Merge in `main`

### Nach dem Merge

```bash
# Update dein Fork
git checkout main
git pull upstream main
git push origin main

# Lösche Feature Branch
git branch -d feat/my-awesome-feature
git push origin --delete feat/my-awesome-feature
```

---

## 🧪 Testing Guidelines

### Test-Strategie

**Siehe:** [ADR-0011-test-strategie-jest-rest-client.md](docs/ADR/0011-test-strategie-jest-rest-client.md)

### Jest Unit Tests

**Location:** `test/track-service.test.ts`

```typescript
import cds from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';

describe('TrackService - TimeEntry Operations', () => {
  let srv: any;

  beforeAll(async () => {
    srv = await cds.connect.to('TrackService');
  });

  it('should create a valid time entry', async () => {
    const entry = {
      entryDate: '2025-10-16',
      entryType_code: 'W',
      startTime: '08:00',
      endTime: '16:30',
      breakMin: 30,
    };

    const result = await srv.create(TimeEntry).entries(entry);
    expect(result).toBeDefined();
    expect(result.durationHoursNet).toBe(8);
  });
});
```

**Run Tests:**

```bash
npm test              # Alle Tests
npm run test:watch   # Watch Mode
npm run test:coverage # Coverage Report
```

### REST Client Tests

**Location:** `test/track-service.http`

Vorteil: Manuelles Testen während Development

```http
### Create TimeEntry
POST http://localhost:4004/odata/v4/track/TimeEntries
Content-Type: application/json

{
  "entryDate": "2025-10-16",
  "entryType_code": "W",
  "startTime": "08:00",
  "endTime": "16:30",
  "breakMin": 30
}
```

---

## 🏗️ Design Pattern Compliance

### Neue Commands hinzufügen

**Use Case:** Du willst einen `DeleteTimeEntryCommand` hinzufügen

#### 1. Command-Klasse erstellen

```typescript
// srv/track-service/handler/commands/DeleteTimeEntryCommand.ts

import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';

export class DeleteTimeEntryCommand {
  constructor(
    private repository: TimeEntryRepository,
    private validator: TimeEntryValidator,
  ) {}

  async execute(tx: Transaction, entryID: string): Promise<void> {
    // 1. Validierung
    const entry = await this.repository.getByID(tx, entryID);
    if (!entry) throw new Error(`TimeEntry ${entryID} not found`);

    // 2. Business Rules prüfen
    await this.validator.validateDeletion(entry);

    // 3. Löschen
    await this.repository.delete(tx, entryID);
  }
}
```

#### 2. Command im Container registrieren

```typescript
// srv/track-service/handler/container/ServiceContainer.ts

private buildCommands(): void {
  this.commands.set('deleteTimeEntry', new DeleteTimeEntryCommand(
    this.getRepository('timeEntry'),
    this.getValidator('timeEntry')
  ));
}
```

#### 3. Handler hinzufügen

```typescript
// srv/track-service/handler/handlers/TimeEntryHandlers.ts

async handleDelete(req: any): Promise<void> {
  const command = this.container.getCommand<DeleteTimeEntryCommand>('deleteTimeEntry');
  await command.execute(req.transaction, req.data.ID);
}
```

#### 4. Handler registrieren

```typescript
// srv/track-service/handler/setup/HandlerSetup.ts

registry.register({
  type: 'before',
  event: 'DELETE',
  entity: TimeEntry,
  handler: handlers.handleDelete.bind(handlers),
  description: 'Delete TimeEntry with validation',
});
```

#### 5. Barrel Export aktualisieren

```typescript
// srv/track-service/handler/commands/index.ts

export * from './DeleteTimeEntryCommand';
```

### Pattern-Compliance Checklist

- [ ] **Command Pattern**: Jede Operation ist ein Command
- [ ] **DI via Container**: Alle Dependencies über ServiceContainer
- [ ] **Validator**: Fachliche Validierung separiert
- [ ] **Repository**: Datenzugriff gekapselt
- [ ] **Factory**: Objekterzeugung mit Business Rules
- [ ] **Handler**: Nur Orchestrierung, keine Business Logic
- [ ] **Barrel Exports**: `index.ts` aktualisiert

---

## 📚 Dokumentation

### Was muss dokumentiert werden?

**Code-Dokumentation:**

```typescript
/**
 * Berechnet Überstunden basierend auf Netto-Zeit und Sollzeit.
 *
 * @param netHours - Tatsächlich gearbeitete Stunden (nach Pause)
 * @param expectedHours - Erwartete Arbeitszeit pro Tag
 * @returns Überstunden (0 wenn keine)
 *
 * @example
 * calculateOvertime(8.5, 7.2) // => 1.3
 * calculateOvertime(6.0, 7.2) // => 0 (Unterstunden werden ignoriert)
 */
function calculateOvertime(netHours: number, expectedHours: number): number {
  return Math.max(0, netHours - expectedHours);
}
```

**Architektur-Entscheidungen:**

Wenn du eine wichtige Design-Entscheidung triffst, erstelle ein **ADR (Architecture Decision Record)**:

```markdown
<!-- docs/ADR/0012-my-decision.md -->

# ADR-0012: Entscheidungstitel

**Datum:** 16.10.2025  
**Status:** Accepted  
**Kontext:** Warum war diese Entscheidung nötig?  
**Entscheidung:** Was wurde entschieden?  
**Konsequenzen:** Was sind die Auswirkungen?  
**Alternativen:** Was wurde nicht gewählt und warum?
```

**README Updates:**

Bei neuen Features: Update der Feature-Liste im README.md

---

## ❓ FAQ

### Wie finde ich einen guten ersten Issue?

Schau nach Labels:

- `good-first-issue`
- `documentation`
- `help-wanted`

### Mein PR wurde abgelehnt - warum?

Häufige Gründe:

- Code folgt nicht den Style Guidelines
- Breaking Changes ohne Dokumentation
- Fehlende Tests
- Merge-Konflikte mit `main`

Lösung: Implementiere das Feedback und pushe Updates!

### Wie kann ich ein Feature diskutieren?

Öffne ein **Discussion Issue** BEVOR du Code schreibst:

```markdown
**Feature:** XYZ
**Problem:** ABC
**Vorschlag:** 123

Was haltet ihr davon?
```

### Wie lange dauert ein Review?

Normalerweise 1-3 Tage. Bei größeren Changes kann es länger dauern.

---

## 🎓 Lern-Ressourcen

### CAP Framework

- [SAP CAP Documentation](https://cap.cloud.sap)
- [CAP TypeScript Support](https://cap.cloud.sap/docs/node.js/typescript)

### SAPUI5 / Fiori

- [SAPUI5 SDK](https://ui5.sap.com)
- [Fiori Design Guidelines](https://experience.sap.com/fiori-design)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

### Design Patterns

- [Refactoring Guru](https://refactoring.guru/design-patterns)
- Unser Projekt: [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🆘 Hilfe bekommen

**Stuck? Frag nach Hilfe!**

1. **GitHub Discussions** - Für allgemeine Fragen
2. **GitHub Issues** - Für spezifische Probleme
3. **SAP Community** - [SAP Community CAP Forum](https://community.sap.com)

---

## 🙏 Danke!

Jeder Beitrag macht dieses Projekt besser - egal wie klein! 🌟

**Happy Contributing!** 🚀

---

_Letzte Aktualisierung: 16.10.2025_
