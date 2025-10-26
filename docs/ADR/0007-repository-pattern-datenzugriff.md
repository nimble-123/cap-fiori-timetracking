# ADR 0007: Repository-Pattern für typsicheren Datenzugriff

## Status

Akzeptiert - Service-Refactoring (Iteration 3)

## Kontext und Problemstellung

Bei frühen Prototypen wurden Datenbank-Queries direkt in Commands, Validators oder Handler-Methoden ausgeführt. Dies führte zu mehreren Problemen:

1. **Code-Duplizierung**: Die gleiche Query (z.B. "Finde User by ID") wurde in mehreren Dateien wiederholt.
2. **Fehlende Typsicherheit**: CDS-Queries mit `SELECT.from('Users')` lieferten `any`-Typen, was zu Runtime-Fehlern führte.
3. **Schwierige Testbarkeit**: Mocking von Datenbank-Zugriffen erforderte komplexe Transaction-Mocks statt einfacher Repository-Interfaces.
4. **Inkonsistente Error-Handling**: Nicht gefundene Entities wurden unterschiedlich behandelt (teilweise `null`, teilweise `undefined`, teilweise Exceptions).
5. **Unklare Verantwortlichkeiten**: Commands mussten sich mit CQL-Details beschäftigen, statt sich auf Business-Logik zu konzentrieren.

Wir benötigten eine Abstraktionsschicht, die Datenzugriffe zentralisiert, typsicher macht und testbar hält.

## Entscheidungsfaktoren

- **Typsicherheit**: Repositories sollen typisierte Entities (`User`, `Project`, `TimeEntry`) zurückgeben, keine `any`-Typen.
- **Wiederverwendung**: Häufige Queries (z.B. "Finde by ID", "Prüfe Existenz") sollen einmalig implementiert und überall nutzbar sein.
- **Testbarkeit**: Repositories sollen einfach mockbar sein, um Commands und Validators isoliert zu testen.
- **Konsistentes Error-Handling**: Nicht gefundene Entities sollen einheitlich behandelt werden (z.B. `null` statt `undefined`).
- **Separation of Concerns**: Commands und Validators sollen sich auf Business-Logik konzentrieren, nicht auf CQL-Syntax.

## Betrachtete Optionen

### Option A - Direkte CQL-Queries in Commands/Validators

- Queries direkt in Business-Logik: `await SELECT.from('Users').where({ ID: userId })`.
- Vorteil: Keine zusätzliche Abstraktionsschicht, schnelle Entwicklung.
- Nachteil: Code-Duplizierung, fehlende Typsicherheit, schwierige Testbarkeit, unklare Verantwortlichkeiten.

### Option B - Utility-Funktionen für Datenzugriff

- Globale Utility-Funktionen wie `findUserById(tx, userId)`.
- Vorteil: Wiederverwendung, einfache Testbarkeit (Funktionen mocken).
- Nachteil: Fehlende Kapselung, keine klare Gruppierung nach Entity, schwierige Verwaltung bei vielen Entities.

### Option C - Repository-Pattern mit Klassen pro Entity

- Je ein Repository pro Entity: `UserRepository`, `ProjectRepository`, `ActivityTypeRepository`, `TimeEntryRepository`, `WorkLocationRepository`, `TravelTypeRepository`.
- Repositories kapseln alle Datenzugriffe für ihre Entity.
- Initialisierung über ServiceContainer mit Entity-Injection.
- Typisierte Rückgabewerte durch `@cap-js/cds-typer` Imports (`#cds-models/*`).
- Vorteil: Klare Verantwortlichkeiten, hohe Testbarkeit, konsistentes Error-Handling, Typsicherheit.
- Nachteil: Höhere Datei-Anzahl, Boilerplate für Repository-Klassen.

## Entscheidung

Wir wählen **Option C** - das Repository-Pattern mit Klassen pro Entity. Jede Entity erhält ein dediziertes Repository, das über den ServiceContainer instanziiert wird. Die Repositories sind unter `srv/track-service/handler/repositories/` organisiert:

```
srv/track-service/handler/repositories/
├── index.ts                        # Barrel Export
├── UserRepository.ts               # User-Datenzugriff
├── ProjectRepository.ts            # Project-Datenzugriff
├── ActivityTypeRepository.ts       # ActivityType-Datenzugriff
├── TimeEntryRepository.ts          # TimeEntry-Datenzugriff
├── WorkLocationRepository.ts       # WorkLocation-Datenzugriff
└── TravelTypeRepository.ts         # TravelType-Datenzugriff
```

### Repository-Struktur (Beispiel: `TimeEntryRepository`)

Jedes Repository folgt diesem Pattern:

1. **Entity-Injection im Konstruktor**: `constructor(entities) { this.entries = entities.TimeEntries; }`
2. **Typisierte CRUD-Methoden**: `async findById(tx: Transaction, id: string): Promise<TimeEntry | null>`
3. **Business-spezifische Queries**: `async existsByUserAndDate(tx, userId, workDate): Promise<boolean>`
4. **Konsistentes Logging**: `logger.repositoryQuery`, `logger.repositoryResult`, `logger.repositoryNotFound`

### Integration mit ServiceContainer

Repositories werden im ServiceContainer registriert (`buildRepositories()`):

```typescript
this.repositories.set('user', new UserRepository(entities));
this.repositories.set('project', new ProjectRepository(entities));
this.repositories.set('activityType', new ActivityTypeRepository(entities));
this.repositories.set('timeEntry', new TimeEntryRepository(entities));
// ...
```

Commands und Validators erhalten Repositories per Dependency Injection:

```typescript
class CreateTimeEntryCommand {
  constructor(
    private userService: UserService,
    private validator: TimeEntryValidator,
    private timeEntryRepository: TimeEntryRepository, // <- Repository injiziert
    private factory: TimeEntryFactory,
  ) {}

  async execute(tx: Transaction, data: Partial<TimeEntry>) {
    // Typsicherer Datenzugriff über Repository
    const existingEntry = await this.timeEntryRepository.findByUserAndDate(tx, data.user_ID!, data.workDate!);
    // ...
  }
}
```

## Konsequenzen

### Positiv

- **Typsicherheit**: Alle Repository-Methoden geben typisierte Entities zurück (`User`, `Project`, `TimeEntry`), keine `any`-Typen. Dies verhindert Runtime-Fehler durch fehlende Properties.
- **Wiederverwendung**: Häufige Queries wie `findById`, `findAll`, `exists` sind zentral implementiert und müssen nicht dupliziert werden.
- **Testbarkeit**: Commands und Validators können mit gemockten Repositories getestet werden, ohne eine echte Datenbank zu benötigen.
- **Konsistentes Error-Handling**: Nicht gefundene Entities geben immer `null` zurück (nicht `undefined`), was explizite Checks ermöglicht.
- **Separation of Concerns**: Commands fokussieren sich auf Business-Logik, Repositories auf Datenzugriff.
- **Klare Logging-Strategie**: Repositories nutzen `logger.repositoryQuery/Result/NotFound`, wodurch Datenbank-Zugriffe im Log nachvollziehbar sind.

### Negativ

- **Höhere Datei-Anzahl**: 6 Repository-Dateien statt direkte Queries in Business-Logik.
- **Boilerplate**: Jede CRUD-Operation erfordert eine Repository-Methode (z.B. `findById`, `create`, `update`, `delete`).
- **Indirektion**: Entwickler müssen Repository-Methoden aufrufen statt direkt CQL zu schreiben, was initiale Lernkurve erhöht.

### Trade-offs

Wir akzeptieren die höhere Datei-Anzahl und Boilerplate zugunsten von Typsicherheit, Testbarkeit und Wiederverwendung. Die Indirektion wird durch klare Repository-Interfaces und Barrel-Exports (`repositories/index.ts`) kompensiert.

## Beispiel-Code

### TimeEntryRepository (Auszug)

```typescript
import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { logger } from '../utils';

export class TimeEntryRepository {
  private entries: any;

  constructor(entities: any) {
    this.entries = entities.TimeEntries;
  }

  async findById(tx: Transaction, id: string): Promise<TimeEntry | null> {
    logger.repositoryQuery('TimeEntry', `Finding by ID: ${id}`, { id });
    const entry = await tx.read(this.entries).where({ ID: id }).one();

    if (!entry) {
      logger.repositoryNotFound('TimeEntry', `Entry not found for ID: ${id}`, { id });
      return null;
    }

    logger.repositoryResult('TimeEntry', `Found entry`, { id, entryType: entry.entryType_code });
    return entry;
  }

  async existsByUserAndDate(tx: Transaction, userId: string, workDate: string): Promise<boolean> {
    logger.repositoryQuery('TimeEntry', `Checking existence`, { userId, workDate });
    const count = await tx.read(this.entries).where({ user_ID: userId, workDate }).columns('ID');
    return count.length > 0;
  }
}
```

### Nutzung in Commands

```typescript
class CreateTimeEntryCommand {
  constructor(
    private userService: UserService,
    private validator: TimeEntryValidator,
    private timeEntryRepository: TimeEntryRepository,
    private factory: TimeEntryFactory,
  ) {}

  async execute(tx: Transaction, data: Partial<TimeEntry>) {
    // Validierung mit Repository
    await this.validator.validate(tx, data);

    // Business-Logik mit typsicherem Zugriff
    const existingEntry = await this.timeEntryRepository.findByUserAndDate(tx, data.user_ID!, data.workDate!);

    if (existingEntry) {
      throw new Error('Eintrag existiert bereits für diesen Tag');
    }

    // ... Factory nutzen für Berechnung
    const entryData = await this.factory.createWorkTimeData(/* ... */);

    return { ...data, ...entryData };
  }
}
```

## Verweise

- `srv/track-service/handler/repositories/TimeEntryRepository.ts` - Beispiel für Repository mit Business-Queries
- `srv/track-service/handler/repositories/UserRepository.ts` - Beispiel für einfaches CRUD-Repository
- `srv/track-service/handler/container/ServiceContainer.ts` - Repository-Registration in `buildRepositories()`
- `srv/track-service/handler/commands/time-entry/CreateTimeEntryCommand.ts` - Nutzung von Repositories in Commands
- `.github/copilot-instructions.md` - Repository-Pattern im AI-Development-Guide

## Hinweise für Entwickler

- **Neue Entity hinzufügen**: Repository-Klasse erstellen, in `repositories/index.ts` exportieren, in `ServiceContainer.buildRepositories()` registrieren.
- **Business-Query hinzufügen**: Neue Methode im entsprechenden Repository implementieren, mit Logging (`logger.repositoryQuery/Result`).
- **Repository mocken (Tests)**: Interface extrahieren oder Sinon/Jest-Mock für Repository-Instanzen nutzen.
- **Typsicherheit**: Immer `#cds-models/*` imports nutzen, nie direkte Zugriffe auf `gen/`-Folder.
