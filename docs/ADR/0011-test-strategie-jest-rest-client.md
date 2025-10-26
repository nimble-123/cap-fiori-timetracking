# ADR 0011: Test-Strategie für CAP Services mit Jest und REST Client

## Status

Akzeptiert - Test-Infrastruktur-Setup (Iteration 6)

## Kontext und Problemstellung

Das Projekt benötigte eine automatisierte Test-Strategie für die CAP Services, um folgende Anforderungen zu erfüllen:

1. **Automatisierte Tests**: Lokale Entwicklung und CI/CD-Pipeline sollen Tests automatisch ausführen.
2. **OData/HTTP API Testing**: TimeEntries CRUD, Actions (Generation, Recalculate), Functions (Balance-Berechnungen) müssen getestet werden.
3. **Business-Logik-Validierung**: Commands, Validators, Factories und Services benötigen Unit/Integration-Tests.
4. **Multi-User-Szenarien**: Tests mit verschiedenen Mock-Usern (Max, Erika) für User-spezifische Features.
5. **Schnelles Feedback**: Entwickler sollen sofort Feedback über kaputte Funktionalität erhalten.
6. **CI/CD-Integration**: Tests müssen in GitHub Actions laufen und bei Failures den Build abbrechen.
7. **Manuelle Ad-hoc-Tests**: Entwickler sollen einzelne HTTP-Requests schnell ausführen können während der Entwicklung.

Ohne Test-Strategie entstanden folgende Probleme:

- **Manuelle Regressions-Tests**: Jede Änderung musste manuell durch UI-Clicks oder Postman-Requests getestet werden.
- **Fehlende Coverage**: Keine Sichtbarkeit, welche Code-Bereiche getestet sind.
- **Langsame Fehleridentifikation**: Bugs wurden erst spät in Production oder durch User-Feedback entdeckt.
- **Schwierige Refactorings**: Änderungen an Business-Logik erforderten aufwändige manuelle Tests.

## Entscheidungsfaktoren

- **CAP-Native Integration**: Test-Framework soll CAP's `cds.test()` nutzen für nahtlose Integration.
- **TypeScript-Support**: Tests sollen in TypeScript geschrieben werden und typsichere APIs nutzen.
- **Test-Runner-Flexibilität**: Sowohl Jest als auch Mocha sollen unterstützt werden.
- **Authentication-Integration**: Mock-User aus `package.json` sollen in Tests wiederverwendbar sein.
- **HTTP + Service API Testing**: Beide Ebenen (HTTP OData und programmatic Service API) sollen testbar sein.
- **Einfacher Setup**: Minimaler Boilerplate, schneller Einstieg für neue Entwickler.
- **IDE-Integration**: VS Code REST Client für manuelle Tests ohne Postman.
- **CI/CD-Ready**: Tests sollen in GitHub Actions ohne zusätzliche Konfiguration laufen.

## Betrachtete Optionen

### Option A - Nur manuelle Tests mit Postman

- Manuelle HTTP-Requests in Postman Collections.
- Vorteil: Keine Test-Framework-Setup, sofort nutzbar.
- Nachteil: Keine Automatisierung, kein CI/CD, keine Coverage, schwierige Team-Collaboration (Postman-Collections müssen geteilt werden).

### Option B - Supertest ohne CAP-Integration

- HTTP-Tests mit Supertest direkt gegen Express-Server.
- Vorteil: Flexibel, viele Beispiele in der Community.
- Nachteil: Keine CAP-Native Integration, kein `cds.test()`, manuelle Mock-User-Verwaltung, aufwändigeres Setup.

### Option C - CAP Native Testing mit cds.test() + Jest

- Nutzung von CAP's `cds.test()` für HTTP und Service API Tests.
- Jest als Test-Runner (alternativ Mocha).
- Chai für Assertions (kompatibel mit Jest und Mocha).
- Mock-User aus `package.json` für Authentication.
- Vorteil: CAP-native, TypeScript-Support, einfaches Setup, CI/CD-ready, flexible Test-Runner-Wahl.
- Nachteil: Zusätzliche Dependencies (Jest, Chai, @types).

### Option D - REST Client für manuelle Tests + Jest für Automatisierung (Hybrid)

- **Automatisierte Tests**: Jest + `cds.test()` für CI/CD und Regression-Tests.
- **Manuelle Tests**: VS Code REST Client (`.http` Dateien) für Ad-hoc-Tests während Entwicklung.
- Vorteil: Beste aus beiden Welten - Automatisierung + schnelle manuelle Tests, keine Postman-Abhängigkeit.
- Nachteil: Zwei Test-Systeme zu pflegen (aber mit geringer Überlappung).

## Entscheidung

Wir wählen **Option D** - Hybrid-Ansatz mit Jest für automatisierte Tests und REST Client für manuelle Tests. Dies bietet optimale Balance zwischen Automatisierung und Developer-Experience.

### 1. Automatisierte Tests mit Jest + cds.test()

#### Test-Struktur

```
test/
├── track-service.test.ts    # Integration Tests für TrackService
├── commands/                # Unit Tests für Commands (optional)
├── validators/              # Unit Tests für Validators (optional)
└── services/                # Unit Tests für Services (optional)
```

#### Jest-Konfiguration (`jest.config.js`)

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: ['srv/**/*.ts', '!srv/**/*.d.ts', '!srv/**/index.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  moduleNameMapper: {
    '^#cds-models/(.*)$': '<rootDir>/@cds-models/$1',
  },
  testTimeout: 30000, // CAP Server-Start kann länger dauern
};
```

#### Beispiel-Test (`test/track-service.test.ts`)

```typescript
import cds from '@sap/cds';

describe('TrackService - TimeEntries CRUD', () => {
  const { GET, POST, PATCH, DELETE, expect } = cds.test('../', '--in-memory');
  const maxUser = { auth: { username: 'max.mustermann@test.de', password: 'max' } };

  it('should create a new work time entry', async () => {
    const { data, status } = await POST(
      '/odata/v4/track/TimeEntries',
      {
        user_ID: 'max.mustermann@test.de',
        workDate: '2025-10-14',
        entryType_code: 'W',
        startTime: '08:00:00',
        endTime: '16:30:00',
        breakMin: 30,
      },
      maxUser,
    );

    expect(status).to.equal(201);
    expect(data).to.have.property('ID');
    expect(data.durationHoursNet).to.equal(8.0);
  });
});
```

#### npm Scripts (`package.json`)

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### Dependencies (werden vom User installiert)

```bash
npm add -D jest ts-jest @types/jest chai@4 chai-as-promised@7 chai-subset
```

### 2. Manuelle Tests mit REST Client

#### REST Client Files

```
test/
└── track-service.http    # HTTP Requests für manuelle Tests
```

#### Beispiel-Request (`test/track-service.http`)

```http
@server = http://localhost:4004
@odata = {{server}}/odata/v4/track
@maxAuth = Authorization: Basic max.mustermann@test.de:max

### Get All TimeEntries
GET {{odata}}/TimeEntries
{{maxAuth}}

### Create Work Time Entry
POST {{odata}}/TimeEntries
Content-Type: application/json
{{maxAuth}}

{
  "user_ID": "max.mustermann@test.de",
  "workDate": "2025-10-14",
  "entryType_code": "W",
  "startTime": "08:00:00",
  "endTime": "16:30:00",
  "breakMin": 30
}
```

#### VS Code Extension

- **Name**: REST Client by Huachao Mao
- **Installation**: VS Code Extensions → "REST Client" suchen
- **Usage**: `Send Request` über jeder `###` Zeile klicken

### 3. CI/CD Integration mit GitHub Actions

#### Workflow (`.github/workflows/test.yml`)

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build TypeScript
        run: npm run build

      - name: Run Tests
        run: npm test

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        if: success()
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: cap-fiori-timetracking-coverage
```

## Konsequenzen

### Positiv

- **Automatisierte Regression-Tests**: Alle CRUD-Operationen, Actions und Functions werden bei jedem Commit getestet.
- **Schnelles Feedback**: Entwickler erhalten sofort Feedback über kaputte Funktionalität (lokal + CI/CD).
- **Code Coverage**: Jest generiert Coverage-Reports, die zeigen, welche Code-Bereiche getestet sind.
- **CAP-Native Integration**: `cds.test()` nutzt CAP's interne Test-Utilities, was nahtlose Integration ermöglicht.
- **TypeScript-Typsicherheit**: Tests nutzen typisierte APIs aus `#cds-models/*`, was Compile-Zeit-Fehler verhindert.
- **Mock-User-Wiederverwendung**: Existierende Mock-User aus `package.json` werden in Tests wiederverwendet.
- **Flexible Test-Runner-Wahl**: Jest oder Mocha können genutzt werden (portable Tests mit Chai).
- **Manuelle Tests ohne Postman**: REST Client in VS Code ermöglicht Ad-hoc-Tests ohne externe Tools.
- **CI/CD-Integration**: GitHub Actions führt Tests automatisch aus und bricht Build bei Failures ab.
- **Team-Collaboration**: `.http` Dateien können im Git-Repository geteilt werden (vs. Postman-Collections).

### Negativ

- **Zusätzliche Dependencies**: Jest, Chai, @types erhöhen `node_modules` Größe (ca. 50 MB).
- **Initiale Lernkurve**: Entwickler müssen `cds.test()` API und Chai-Assertions lernen.
- **Test-Wartung**: Tests müssen bei API-Änderungen aktualisiert werden (Trade-off für Automatisierung).
- **Längere CI/CD-Laufzeit**: Tests verlängern Build-Zeit um ca. 30-60 Sekunden.
- **Zwei Test-Systeme**: REST Client und Jest müssen parallel gepflegt werden (aber mit geringer Überlappung - manuelle vs. automatisierte Tests).

### Trade-offs

Wir akzeptieren die zusätzlichen Dependencies und Test-Wartung zugunsten von Automatisierung, schnellem Feedback und Code Coverage. Die initiale Lernkurve wird durch Beispiel-Tests und ADR-Dokumentation kompensiert.

## Test-Pyramide für das Projekt

Das Projekt folgt einer klassischen Test-Pyramide mit Fokus auf Integration-Tests:

### 1. Integration Tests (70%) - **Primär mit Jest**

- **Zweck**: Testen von OData HTTP APIs, Actions, Functions
- **Framework**: Jest + `cds.test()`
- **Location**: `test/track-service.test.ts`
- **Coverage**: TimeEntries CRUD, Generation, Balance-Berechnungen
- **Beispiel**: Create TimeEntry → Validierung → Berechnung → Speichern

### 2. Unit Tests (20%) - **Optional**

- **Zweck**: Testen isolierter Business-Logik (Commands, Validators, Factories)
- **Framework**: Jest mit Mocks
- **Location**: `test/commands/*.test.ts`, `test/validators/*.test.ts`
- **Coverage**: Zeitberechnungen, Validierungsregeln
- **Beispiel**: TimeCalculationService.calculateWorkingHours()

### 3. E2E Tests (10%) - **OPA5 (bereits vorhanden)**

- **Zweck**: Testen der UI-Flows
- **Framework**: OPA5 (Fiori Elements)
- **Location**: `app/timetable/webapp/test/integration/`
- **Coverage**: UI-Navigation, Create-Flow, Filter
- **Beispiel**: User öffnet App → Erstellt Entry → Speichert → Sieht Entry in Liste

## Workflow für Entwickler

### Lokale Entwicklung

1. **Tests schreiben**: Neue Tests in `test/` anlegen
2. **Tests ausführen**: `npm test` (alle Tests) oder `npm run test:watch` (Watch-Mode)
3. **Coverage prüfen**: `npm run test:coverage` → öffne `coverage/index.html`
4. **Manuelle Tests**: Öffne `test/track-service.http` → klicke "Send Request"

### CI/CD

1. **Push zu GitHub**: Tests laufen automatisch in GitHub Actions
2. **Pull Request**: Tests müssen grün sein, bevor PR gemerged werden kann
3. **Coverage-Report**: Codecov zeigt Coverage-Änderungen im PR-Comment

## Beispiel-Tests im Projekt

Das Projekt enthält umfassende Beispiel-Tests in `test/track-service.test.ts`:

### CRUD-Tests

- ✅ Create Work Time Entry
- ✅ Create Vacation Entry
- ✅ Reject Duplicate Entry (Validation)
- ✅ Reject Invalid Time Range (Validation)
- ✅ Read TimeEntries with Filters
- ✅ Update TimeEntry und Recalculate
- ✅ Delete TimeEntry

### Action-Tests

- ✅ Generate Monthly Entries
- ✅ Generate Yearly Entries
- ✅ Get Default Parameters
- ✅ Recalculate TimeEntry (Bound Action)

### Function-Tests

- ✅ Get Monthly Balance
- ✅ Get Current Balance
- ✅ Get Recent Balances
- ✅ Get Vacation Balance
- ✅ Get Sick Leave Balance

### CodeList-Tests

- ✅ Read Users, Projects, ActivityTypes, EntryTypes

## Manuelle Test-Szenarien (REST Client)

Die `test/track-service.http` Datei enthält über 50 vordefinierte HTTP-Requests:

### CRUD Operations

- Get All TimeEntries (mit Expand, Filter, OrderBy)
- Create TimeEntry (Work, Vacation, Sick, Business Trip)
- Update TimeEntry
- Delete TimeEntry

### Generation & Balance

- Generate Monthly/Yearly Entries
- Get Balances (Monthly, Current, Recent, Vacation, Sick)

### OData Query Options

- $select, $filter, $orderby, $top, $count, $expand
- Error Scenarios (Duplicate, Invalid Time Range)

## Verweise

- `test/track-service.test.ts` - Beispiel-Tests mit Jest + cds.test()
- `test/track-service.http` - REST Client Requests für manuelle Tests
- `jest.config.js` - Jest-Konfiguration
- `.github/workflows/test.yml` - CI/CD-Pipeline
- `package.json` - npm Scripts und Dependencies

## Hinweise für Entwickler

### Test-Driven Development (TDD)

1. **Red**: Test schreiben, der fehlschlägt (neue Feature noch nicht implementiert)
2. **Green**: Feature implementieren, bis Test grün ist
3. **Refactor**: Code verbessern, Tests bleiben grün

### Test schreiben

```typescript
it('should calculate overtime correctly', async () => {
  const { data } = await POST(
    '/odata/v4/track/TimeEntries',
    {
      user_ID: 'max.mustermann@test.de',
      workDate: '2025-10-14',
      entryType_code: 'W',
      startTime: '08:00:00',
      endTime: '18:00:00', // 10h - 2h Überstunden
      breakMin: 60,
    },
    maxUser,
  );

  expect(data.overtimeHours).to.equal(2.0);
  expect(data.undertimeHours).to.equal(0);
});
```

### REST Client nutzen

1. VS Code Extension "REST Client" installieren
2. `test/track-service.http` öffnen
3. CAP Server starten: `npm run watch`
4. Klicke "Send Request" über jeder `###` Zeile
5. Variablen anpassen (z.B. `@server`, `@maxAuth`)

### CI/CD debuggen

- Lokaler Test-Run: `npm test` (sollte exakt gleich wie CI/CD laufen)
- Coverage lokal: `npm run test:coverage`
- GitHub Actions Logs: `Actions` Tab → fehlgeschlagener Workflow → Logs anzeigen

### Neue Dependencies

```bash
# Dependencies aktualisieren (User macht dies selbst)
npm install -D jest ts-jest @types/jest chai@4 chai-as-promised@7 chai-subset
```
