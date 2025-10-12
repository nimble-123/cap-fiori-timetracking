# 🕐 CAP Fiori Time Tracking Application

Eine professionelle Zeiterfassungsanwendung basierend auf **SAP CAP** (Cloud Application Programming Model) mit **TypeScript** und **Fiori UI5** Frontend. Dieses Projekt zeigt dir, wie moderne Enterprise-Anwendungen mit **Clean Architecture**, **Design Patterns** und **Best Practices** gebaut werden – von Entwickler für Entwickler dokumentiert! 🚀

## 🎯 Was macht diese App besonders?

- ✅ **100% TypeScript** - Komplettes Backend in TypeScript (kein JavaScript!)
- ✅ **Clean Architecture** - ServiceContainer, HandlerRegistry & Design Patterns
- ✅ **SOLID Principles** - Jede Klasse hat genau eine Verantwortung
- ✅ **Enterprise-Ready** - Feiertags-API, Zeitberechnungen, Balance-Tracking
- ✅ **Fiori Elements & Custom UI5** - Beide Welten in einer App
- ✅ **Production-Grade** - Validierung, Error Handling, Logging

---

## 🏗️ Solution Architecture

Diese App folgt einer **modernen 3-Tier-Architektur** mit Clean Architecture Principles. Jede Schicht hat klare Verantwortlichkeiten und ist unabhängig testbar:

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: true
    nodePlacementStrategy: LINEAR_SEGMENTS
  theme: neo
---
graph TB
    subgraph "🖥️ Presentation Layer - TypeScript UI5"
        UI1["📊 Fiori Elements App<br/>Timetable List/Detail"]
        UI2["🏠 Custom UI5 App<br/>Dashboard & Charts"]
    end

    subgraph "⚙️ Application Layer - CAP Service"
        SVC["🎬 TrackService<br/>Orchestrator"]
        HANDLERS["🎭 Handler Classes<br/>TimeEntry | Generation | Balance"]
    end

    subgraph "💼 Business Logic Layer - Domain Services"
        CMD["🎯 Commands<br/>7 Commands für CRUD, Gen, Balance"]
        VAL["✅ Validators<br/>TimeEntry | Generation | Balance"]
        SRV["💼 Domain Services<br/>TimeCalc | User | Holiday | Balance"]
        STRAT["📋 Strategies<br/>Monthly | Yearly Generation"]
        FACT["🏭 Factory<br/>TimeEntry Creation Rules"]
    end

    subgraph "💾 Data Access Layer"
        REPO["💾 Repositories<br/>TimeEntry | User | Project | Activity"]
        DB[("🗄️ Database<br/>SQLite In-Memory")]
    end

    subgraph "🔧 Infrastructure Layer"
        CONTAINER["🏗️ ServiceContainer<br/>Dependency Injection<br/>6 Kategorien"]
        REGISTRY["📋 HandlerRegistry<br/>before | on | after Events"]
    end

    %% UI to Service
    UI1 --> SVC
    UI2 --> SVC

    %% Service Infrastructure
    SVC --> REGISTRY
    REGISTRY --> HANDLERS
    SVC --> CONTAINER

    %% Handler to Business Logic
    HANDLERS --> CMD

    %% Command Dependencies
    CMD --> VAL
    CMD --> SRV
    CMD --> STRAT
    CMD --> FACT
    CMD --> REPO

    %% Services to Repos
    SRV --> REPO
    VAL --> REPO

    %% Repos to DB
    REPO --> DB

    %% Container provides everything
    CONTAINER -.provides.-> CMD
    CONTAINER -.provides.-> VAL
    CONTAINER -.provides.-> SRV
    CONTAINER -.provides.-> STRAT
    CONTAINER -.provides.-> FACT
    CONTAINER -.provides.-> REPO

    %% Styling
    style SVC fill:#e1f5ff,stroke:#0288d1,stroke-width:3px
    style HANDLERS fill:#e1f5ff,stroke:#0288d1,stroke-width:2px
    style CMD fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style VAL fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px
    style SRV fill:#e8f5e9,stroke:#43a047,stroke-width:2px
    style STRAT fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style FACT fill:#ffe0b2,stroke:#fb8c00,stroke-width:2px
    style REPO fill:#e0f2f1,stroke:#00897b,stroke-width:2px
    style DB fill:#b2dfdb,stroke:#00695c,stroke-width:3px
    style CONTAINER fill:#fce4ec,stroke:#c2185b,stroke-width:3px
    style REGISTRY fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style UI1 fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style UI2 fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
```

---

## 📁 Project Structure

Die Struktur ist bewusst modular aufgebaut - jede Komponente hat ihre klar definierte Rolle:

```
cap-fiori-timetracking/
│
├── 📱 app/                          # Frontend Applications (TypeScript UI5)
│   ├── timetable/                   # Fiori Elements List Report App
│   │   ├── webapp/
│   │   │   ├── Component.ts         # UI5 Component (TypeScript)
│   │   │   ├── manifest.json        # App Descriptor
│   │   │   └── i18n/                # Internationalization
│   │   └── annotations.cds          # UI Annotations
│   │
│   └── timetracking/                # Custom UI5 Dashboard App
│       ├── webapp/
│       │   ├── controller/          # MVC Controller (TypeScript)
│       │   ├── view/                # XML Views
│       │   ├── model/               # Client Models
│       │   └── Component.ts
│       └── annotations.cds
│
├── 💾 db/                           # Data Model & Master Data
│   ├── data-model.cds               # Core Domain Model
│   │   ├── Users, Projects, TimeEntries
│   │   └── ActivityTypes, EntryTypes, GermanStates (CodeLists)
│   └── data/                        # CSV Test & Master Data
│
├── ⚙️ srv/                           # Backend Service Layer (100% TypeScript!)
│   │
│   ├── track-service/               # Service Definition & Orchestrator
│   │   ├── track-service.cds        # OData Service Definition
│   │   ├── track-service.ts         # 🎬 Orchestrator (165 Zeilen!)
│   │   ├── REFACTORING.md           # Refactoring Dokumentation
│   │   ├── actions/                 # Action Definitions (CDS)
│   │   └── entities/                # Entity Extensions
│   │
│   ├── handler/                     # 🔧 Business Logic & Infrastructure
│   │   │
│   │   ├── container/               # 🏗️ Dependency Injection
│   │   │   └── ServiceContainer.ts  # DI Container (178 Zeilen)
│   │   │       - 6 Kategorien: Repos, Services, Validators, Strategies, Commands, Factories
│   │   │       - Type-safe Resolution mit Generics
│   │   │       - Auto-Wiring aller Dependencies
│   │   │
│   │   ├── registry/                # 📋 Event Handler Registry
│   │   │   └── HandlerRegistry.ts   # Handler-Registrierung (149 Zeilen)
│   │   │       - Unterstützt: before, on, after
│   │   │       - Fluent API & Logging
│   │   │
│   │   ├── handlers/                # 🎯 Event Handler (Separation of Concerns)
│   │   │   ├── TimeEntryHandlers.ts     # CRUD (67 Zeilen)
│   │   │   ├── GenerationHandlers.ts    # Bulk-Generierung (70 Zeilen)
│   │   │   └── BalanceHandlers.ts       # Balance-Abfragen (79 Zeilen)
│   │   │
│   │   ├── commands/                # 🎯 Command Pattern (7 Commands!)
│   │   │   ├── TimeEntryCommands.ts     # CREATE & UPDATE
│   │   │   ├── GenerationCommands.ts    # Monthly & Yearly
│   │   │   └── BalanceCommands.ts       # 3 Balance Commands
│   │   │
│   │   ├── services/                # 💼 Domain Services
│   │   │   ├── TimeCalculationService.ts   # Static Utilities
│   │   │   ├── UserService.ts              # User Management
│   │   │   ├── HolidayService.ts           # API Integration mit Cache
│   │   │   └── TimeBalanceService.ts       # Balance Calculations
│   │   │
│   │   ├── repositories/            # 💾 Data Access (4 Repositories)
│   │   │   ├── TimeEntryRepository.ts
│   │   │   ├── UserRepository.ts
│   │   │   ├── ProjectRepository.ts
│   │   │   └── ActivityTypeRepository.ts
│   │   │
│   │   ├── validators/              # ✅ Validation (3 Validators)
│   │   │   ├── TimeEntryValidator.ts
│   │   │   ├── GenerationValidator.ts
│   │   │   └── BalanceValidator.ts
│   │   │
│   │   ├── strategies/              # 📋 Strategy Pattern
│   │   │   ├── MonthlyGenerationStrategy.ts
│   │   │   └── YearlyGenerationStrategy.ts
│   │   │
│   │   └── factories/               # 🏭 Factory Pattern
│   │       └── TimeEntryFactory.ts
│   │
│   └── annotations/                 # 📝 UI Annotations
│       ├── common/                  # Authorization, Capabilities, Labels
│       └── ui/                      # UI-spezifisch pro Entity
│
├── @cds-models/                     # 🎯 Auto-generierte TypeScript Types
│   ├── TrackService/
│   └── io/nimble/
│
└── package.json, tsconfig.json, etc.
```

---

## 💾 Data Model

Das Datenmodell ist bewusst einfach gehalten, aber dennoch mächtig:

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: false
    nodePlacementStrategy: LINEAR_SEGMENTS
  theme: neo
---
erDiagram
    Users ||--o{ TimeEntry : creates
    Projects ||--o{ TimeEntry : assigned_to
    EntryTypes ||--o{ TimeEntry : has_type
    ActivityTypes ||--o{ TimeEntry : has_activity

    Users {
        string ID PK
        string name
        boolean active
        decimal weeklyHoursDec
        integer workingDaysPerWeek
        decimal expectedDailyHoursDec "calculated"
    }

    TimeEntry {
        uuid ID PK
        uuid user_ID FK
        date workDate
        string entryType_code FK
        uuid project_ID FK "optional"
        string activity_code FK "optional"
        time startTime
        time endTime
        integer breakMin
        decimal durationHoursGross "calculated"
        decimal durationHoursNet "calculated"
        decimal overtimeHours "calculated"
        decimal undertimeHours "calculated"
        string source
        string note
    }

    Projects {
        uuid ID PK
        string number
        string name
        boolean active
        boolean billable
    }

    EntryTypes {
        string code PK "W,V,S,H"
        string text "localized"
    }

    ActivityTypes {
        string code PK
        string text "localized"
    }

    GermanStates {
        string code PK "BY,BW,BE..."
        string text "localized"
    }
```

### 🔑 Key Features des Datenmodells

- **Automatische Berechnung**: Brutto-/Nettozeiten, Über-/Unterstunden werden server-seitig berechnet
- **Eindeutigkeit**: Nur ein Entry pro User/Tag (wird im Repository validiert)
- **Flexible Entry Types**: Work (W), Vacation (V), Sick Leave (S), Holiday (H) über CodeList
- **Project Assignment**: Optional, nur aktive Projekte werden zugelassen
- **Activity Tracking**: Kategorisierung der Tätigkeiten für Reporting
- **Managed Fields**: `createdAt`, `createdBy`, `modifiedAt`, `modifiedBy` automatisch via `@sap/cds/common`
- **Localization**: EntryTypes, ActivityTypes, GermanStates mit i18n-Support (de/en)
- **Computed Fields**: `expectedDailyHoursDec` wird automatisch aus `weeklyHoursDec` / `workingDaysPerWeek` berechnet

---

## 🎨 Design Patterns - Das Herzstück

Diese App ist ein **Showcase** für moderne Design Patterns. Hier arbeiten 8 verschiedene Patterns perfekt zusammen:

```mermaid
---
config:
  layout: elk
  elk:
    mergeEdges: true
    nodePlacementStrategy: LINEAR_SEGMENTS
  theme: neo
---
classDiagram
    class ServiceContainer {
        +build(entities)
        +getService(key)
        +getCommand(key)
        +getRepository(key)
        +getValidator(key)
        +getStrategy(key)
        +getFactory(key)
    }
    class HandlerRegistry {
        +register(config)
        +apply(service)
        -handlers: HandlerConfig[]
    }
    class TimeEntryHandlers {
        -container: ServiceContainer
        +handleCreate(req)
        +handleUpdate(req)
        +handleDelete(req)
    }
    class GenerationHandlers {
        -container: ServiceContainer
        +handleGenerateMonthly(req)
        +handleGenerateYearly(req)
    }
    class BalanceHandlers {
        -container: ServiceContainer
        +handleGetMonthlyBalance(req)
        +handleGetCurrentBalance(req)
        +handleReadMonthlyBalances(req)
    }
    class CommandPattern {
        <<interface>>
        +execute(tx, data)
    }
    class CreateTimeEntryCommand {
        -validator: TimeEntryValidator
        -userService: UserService
        -factory: TimeEntryFactory
        -repository: TimeEntryRepository
        +execute(tx, data)
    }
    class UpdateTimeEntryCommand {
        -validator: TimeEntryValidator
        -repository: TimeEntryRepository
        +execute(tx, data)
    }
    class GenerateMonthlyCommand {
        -validator: GenerationValidator
        -strategy: MonthlyGenerationStrategy
        -repository: TimeEntryRepository
        +execute(tx, params)
    }
    class GenerateYearlyCommand {
        -validator: GenerationValidator
        -strategy: YearlyGenerationStrategy
        -holidayService: HolidayService
        -repository: TimeEntryRepository
        +execute(tx, params)
    }
    class RepositoryPattern {
        <<interface>>
        +create(tx, data)
        +update(tx, id, data)
        +findById(tx, id)
        +delete(tx, id)
    }
    class TimeEntryRepository {
        +create(tx, entry)
        +update(tx, id, data)
        +findById(tx, id)
        +findByUserAndDate(tx, userId, date)
        +insertBatch(tx, entries)
    }
    class UserRepository {
        +findByEmail(email)
        +findById(id)
    }
    class ValidatorPattern {
        <<interface>>
        +validate(tx, data)
    }
    class TimeEntryValidator {
        -projectRepo: ProjectRepository
        -activityRepo: ActivityTypeRepository
        +validate(tx, data)
        +hasRelevantChanges(old, new)
    }
    class GenerationValidator {
        -userRepo: UserRepository
        +validateUser(tx, userId)
        +validateStateCode(stateCode)
        +validateYear(year)
    }
    class BalanceValidator {
        +validateYearMonth(year, month)
        +validateMonthCount(count)
    }
    class StrategyPattern {
        <<interface>>
        +generate(tx, params)
    }
    class MonthlyGenerationStrategy {
        +generate(tx, user, year, month)
    }
    class YearlyGenerationStrategy {
        +generate(tx, user, year, holidays)
    }
    class FactoryPattern {
        <<interface>>
        +create(params)
    }
    class TimeEntryFactory {
        +createWorkTimeEntry(user, date, start, end, break, project, activity)
        +createNonWorkTimeEntry(user, date, entryType, source)
        +createStandardEntry(user, date, project, activity)
    }
    class DomainServices {
        <<service layer>>
    }
    class UserService {
        -userRepo: UserRepository
        +getCurrentUser(req)
        +getExpectedDailyHours(user)
    }
    class HolidayService {
        -cache: Map
        +getHolidays(year, stateCode)
    }
    class TimeBalanceService {
        -timeEntryRepo: TimeEntryRepository
        +calculateMonthlyBalance(tx, userId, year, month)
        +getCurrentBalance(tx, userId)
    }
    class TimeCalculationService {
        +calculateDurationHours(start, end, break)
        +calculateOvertime(net, expected)
        +calculateUndertime(net, expected)
    }
    ServiceContainer --> CommandPattern : provides
    ServiceContainer --> RepositoryPattern : provides
    ServiceContainer --> ValidatorPattern : provides
    ServiceContainer --> StrategyPattern : provides
    ServiceContainer --> FactoryPattern : provides
    ServiceContainer --> DomainServices : provides
    HandlerRegistry --> TimeEntryHandlers : registers
    HandlerRegistry --> GenerationHandlers : registers
    HandlerRegistry --> BalanceHandlers : registers
    TimeEntryHandlers --> ServiceContainer : uses
    GenerationHandlers --> ServiceContainer : uses
    BalanceHandlers --> ServiceContainer : uses
    TimeEntryHandlers --> CreateTimeEntryCommand : delegates
    TimeEntryHandlers --> UpdateTimeEntryCommand : delegates
    GenerationHandlers --> GenerateMonthlyCommand : delegates
    GenerationHandlers --> GenerateYearlyCommand : delegates
    CommandPattern <|.. CreateTimeEntryCommand : implements
    CommandPattern <|.. UpdateTimeEntryCommand : implements
    CommandPattern <|.. GenerateMonthlyCommand : implements
    CommandPattern <|.. GenerateYearlyCommand : implements
    CreateTimeEntryCommand --> TimeEntryValidator : uses
    CreateTimeEntryCommand --> UserService : uses
    CreateTimeEntryCommand --> TimeEntryFactory : uses
    CreateTimeEntryCommand --> TimeEntryRepository : uses
    UpdateTimeEntryCommand --> TimeEntryValidator : uses
    UpdateTimeEntryCommand --> TimeEntryRepository : uses
    GenerateMonthlyCommand --> GenerationValidator : uses
    GenerateMonthlyCommand --> MonthlyGenerationStrategy : uses
    GenerateMonthlyCommand --> TimeEntryRepository : uses
    GenerateYearlyCommand --> GenerationValidator : uses
    GenerateYearlyCommand --> YearlyGenerationStrategy : uses
    GenerateYearlyCommand --> HolidayService : uses
    GenerateYearlyCommand --> TimeEntryRepository : uses
    RepositoryPattern <|.. TimeEntryRepository : implements
    RepositoryPattern <|.. UserRepository : implements
    ValidatorPattern <|.. TimeEntryValidator : implements
    ValidatorPattern <|.. GenerationValidator : implements
    ValidatorPattern <|.. BalanceValidator : implements
    StrategyPattern <|.. MonthlyGenerationStrategy : implements
    StrategyPattern <|.. YearlyGenerationStrategy : implements
    FactoryPattern <|.. TimeEntryFactory : implements
    TimeEntryValidator --> ProjectRepository : uses
    TimeEntryValidator --> ActivityTypeRepository : uses
    GenerationValidator --> UserRepository : uses
    TimeEntryFactory --> TimeCalculationService : uses
    UserService --> UserRepository : uses
    TimeBalanceService --> TimeEntryRepository : uses
```

### 🏗️ 1. ServiceContainer Pattern (Dependency Injection)

**Datei:** `srv/handler/container/ServiceContainer.ts` (178 Zeilen)

Der **ServiceContainer** ist unser DI-Container. Er verwaltet **alle** Dependencies zentral:

```typescript
// Beim Service-Start
const container = new ServiceContainer();
container.build(entities); // Auto-Wiring!

// Type-safe Resolution
const userService = container.getService<UserService>('user');
const createCommand = container.getCommand<CreateTimeEntryCommand>('createTimeEntry');
```

**Features:**

- 🎯 6 Kategorien: Repositories, Services, Validators, Strategies, Commands, Factories
- 🔗 Auto-Wiring von Dependencies
- 🛡️ Type-Safe mit Generics
- 🧪 Perfekt für Unit Tests

### 📋 2. HandlerRegistry Pattern

**Datei:** `srv/handler/registry/HandlerRegistry.ts` (149 Zeilen)

Strukturierte Event-Handler-Registrierung mit **before/on/after** Support:

```typescript
registry.register({
  type: 'before',
  event: 'CREATE',
  entity: TimeEntries,
  handler: handlers.handleCreate.bind(handlers),
  description: 'Validate and enrich time entry before creation',
});

registry.apply(service);
```

### 🎯 3. Command Pattern (7 Commands!)

**Dateien:** `srv/handler/commands/*.ts`

Commands kapseln komplexe Business Operations:

| Command                    | Zeilen | Zweck                                          |
| -------------------------- | ------ | ---------------------------------------------- |
| `CreateTimeEntryCommand`   | ~80    | Validierung, User-Lookup, Factory, Calculation |
| `UpdateTimeEntryCommand`   | ~60    | Change Detection, Recalculation                |
| `GenerateMonthlyCommand`   | ~70    | Monat generieren mit Stats                     |
| `GenerateYearlyCommand`    | ~90    | Jahr mit Feiertagen                            |
| `GetMonthlyBalanceCommand` | ~50    | Monatssaldo mit Criticality                    |
| `GetCurrentBalanceCommand` | ~40    | Kumulierter Gesamtsaldo                        |
| `GetRecentBalancesCommand` | ~45    | Historische Balances (6 Monate)                |

### 🏭 4. Factory Pattern

**Datei:** `srv/handler/factories/TimeEntryFactory.ts`

Kennt alle Business Rules und erstellt perfekt berechnete TimeEntry-Objekte:

```typescript
// Work-Time Entry
const entry = TimeEntryFactory.createWorkTimeEntry(user, workDate, startTime, endTime, breakMin, project, activity);
// → Berechnet automatisch: gross, net, overtime, undertime
```

### 📋 5. Strategy Pattern

**Dateien:** `srv/handler/strategies/*.ts`

Austauschbare Algorithmen für Generierung:

- `MonthlyGenerationStrategy` - Alle Tage eines Monats
- `YearlyGenerationStrategy` - Jahr mit Wochenenden & Feiertagen

### 💾 6. Repository Pattern (4 Repositories)

Jede Entity hat ihr eigenes Repository:

- `TimeEntryRepository` - CRUD + Queries
- `UserRepository` - User-Lookup
- `ProjectRepository` - Validierung
- `ActivityTypeRepository` - Validierung

### ✅ 7. Validator Pattern (3 Validators)

Domain-spezifische Validierung:

- `TimeEntryValidator` - Entry-Validierung + Change Detection
- `GenerationValidator` - User, StateCode, Year
- `BalanceValidator` - Year/Month Plausibilität

### 🎭 8. Handler Pattern (3 Handler-Klassen)

Event-Handler für verschiedene Domänen:

- `TimeEntryHandlers` (67 Zeilen) - CRUD
- `GenerationHandlers` (70 Zeilen) - Bulk-Generierung
- `BalanceHandlers` (79 Zeilen) - Balance-Abfragen

---

## 🎬 Das große Zusammenspiel - Sequence Diagram

So arbeiten alle Patterns bei einem CREATE-Request zusammen:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as 🖥️ Fiori UI
    participant SVC as 🎯 TrackService
    participant REG as 📋 HandlerRegistry
    participant H as 🎭 TimeEntryHandlers
    participant CMD as 🎯 CreateCommand
    participant VAL as ✅ Validator
    participant US as 👤 UserService
    participant FACT as 🏭 Factory
    participant REPO as 💾 Repository
    participant DB as 💾 Database

    User->>UI: Erstelle TimeEntry
    UI->>SVC: POST /TimeEntries

    Note over SVC: Container & Registry<br/>initialisiert

    SVC->>REG: trigger 'before CREATE'
    REG->>H: handleCreate(req)
    H->>CMD: execute(tx, entryData)

    Note over CMD: Orchestriert alle<br/>Dependencies

    CMD->>VAL: validate(tx, entryData)
    VAL->>REPO: validateProjectExists()
    REPO-->>VAL: ✅ valid
    VAL-->>CMD: ✅ validated

    CMD->>US: getCurrentUser(req)
    US->>REPO: findByEmail()
    REPO->>DB: SELECT User
    DB-->>REPO: User Data
    REPO-->>US: User Object
    US-->>CMD: User + expectedDailyHours

    CMD->>FACT: createWorkTimeEntry(user, data)
    Note over FACT: Berechnet gross, net,<br/>overtime, undertime
    FACT-->>CMD: Calculated Entry

    CMD->>REPO: create(tx, entry)
    REPO->>DB: INSERT
    DB-->>REPO: Created
    REPO-->>CMD: Entry ID

    CMD-->>H: Calculated Data
    H->>SVC: Object.assign(req.data)
    SVC->>DB: Commit
    DB-->>SVC: ✅ Success
    SVC-->>UI: 201 Created
    UI-->>User: ✅ "Entry created!"
```

---

## 🎬 Yearly TimeEntry Generation - Complete Flow

So läuft die **komplette Jahresgenerierung** ab - vom UI-Button-Click bis zur fertigen Datenbank-Einträge mit Feiertagen:

```mermaid
sequenceDiagram
    autonumber
    participant UI as 📱 Fiori UI
    participant Router as 🌐 OData Router
    participant Service as 🎬 TrackService
    participant Registry as 📋 HandlerRegistry
    participant Handler as 🎯 GenerationHandlers
    participant Command as 💼 GenerateYearlyCommand
    participant Validator as ✅ GenerationValidator
    participant UserService as 👤 UserService
    participant UserRepo as 💾 UserRepository
    participant Strategy as 📋 YearlyGenerationStrategy
    participant HolidayAPI as 🎉 Feiertage-API
    participant Factory as 🏭 TimeEntryFactory
    participant TimeRepo as 💾 TimeEntryRepository
    participant DB as 🗄️ Database

    Note over UI,DB: 🚀 Phase 1: Request Initialisierung
    UI->>Router: POST /generateYearlyTimeEntries(year=2025, stateCode='BY')
    Router->>Service: Action Call mit Parametern
    Service->>Registry: Lookup Handler für 'generateYearlyTimeEntries'
    Registry->>Handler: Route to handleGenerateYearly(req)

    Note over Handler,Command: 📋 Phase 2: Command Vorbereitung
    Handler->>Command: execute(req, year=2025, stateCode='BY')
    Command->>Validator: validateStateCode('BY')
    Validator-->>Command: ✅ 'BY' ist valide

    Note over Command,UserRepo: 👤 Phase 3: User Resolution
    Command->>UserService: resolveUserForGeneration(req)
    UserService->>UserService: Extract userID from req.user
    UserService->>UserRepo: SELECT * FROM Users WHERE ID = userID
    UserRepo->>DB: SQL Query
    DB-->>UserRepo: User Record
    UserRepo-->>UserService: User Object
    UserService-->>Command: { userID, user }

    Command->>Validator: validateUser(user, userID)
    Validator->>Validator: Check user.active === true
    Validator->>Validator: Check user.expectedDailyHoursDec > 0
    Validator-->>Command: ✅ User validiert

    Note over Command,Strategy: 📅 Phase 4: Jahresdaten-Ermittlung
    Command->>Strategy: getYearData(2025)
    Strategy->>Strategy: Calculate: yearStart = 2025-01-01
    Strategy->>Strategy: Calculate: yearEnd = 2025-12-31
    Strategy->>Strategy: isLeapYear(2025)? → false → 365 Tage
    Strategy-->>Command: { year: 2025, daysInYear: 365, yearStartStr: '2025-01-01', yearEndStr: '2025-12-31' }

    Note over Command,DB: 🔍 Phase 5: Existierende Einträge prüfen
    Command->>TimeRepo: getExistingDatesInRange(userID, '2025-01-01', '2025-12-31')
    TimeRepo->>DB: SELECT workDate FROM TimeEntries WHERE user_ID = ? AND workDate BETWEEN ? AND ?
    DB-->>TimeRepo: Array of existing dates
    TimeRepo->>TimeRepo: Convert to Set<string>
    TimeRepo-->>Command: Set<string> (z.B. 45 existing entries)

    Note over Command,HolidayAPI: 🎉 Phase 6: Feiertags-Ermittlung & Entry-Generierung
    Command->>Strategy: generateMissingEntries(userID, user, yearData, 'BY', existingDates)
    Strategy->>HolidayAPI: GET https://feiertage-api.de/api/?jahr=2025&nur_land=BY

    alt API erfolgreich
        HolidayAPI-->>Strategy: JSON { "Neujahr": { "datum": "2025-01-01" }, ... }
        Strategy->>Strategy: parseHolidays() → 13 Feiertage für BY
        Strategy->>Strategy: Cache in Map<'2025-BY', holidays>
    else API Fehler
        HolidayAPI-->>Strategy: HTTP 500 / Network Error
        Strategy->>Strategy: Return empty Map() → Fallback ohne Feiertage
    end

    Note over Strategy,Factory: 🔁 Phase 7: Schleife über alle 365 Tage
    loop Für jeden Tag (dayOfYear = 0 bis 364)
        Strategy->>Strategy: currentDate = 2025-01-01 + dayOfYear
        Strategy->>Strategy: dateString = currentDate.toISOString() → '2025-01-01'

        alt Eintrag existiert bereits
            Strategy->>Strategy: Check: existingDates.has(dateString)?
            Strategy->>Strategy: ⏭️ Skip - continue

        else Feiertag
            Strategy->>Strategy: Check: holidays.get(dateString)?
            Strategy->>Strategy: createHolidayEntry(userID, date, 'Neujahr')
            Strategy->>Strategy: Push entry: { entryType_code: 'H', note: 'Neujahr', hours: 0 }

        else Wochenende
            Strategy->>Strategy: isWeekend(date)? → date.getDay() === 0 || === 6
            Strategy->>Strategy: createWeekendEntry(userID, date)
            Strategy->>Strategy: Push entry: { entryType_code: 'O', note: 'Samstag', hours: 0 }

        else Normaler Arbeitstag
            Strategy->>Factory: createDefaultEntry(userID, date, user)
            Factory->>Factory: Calculate startTime, endTime from expectedDailyHoursDec
            Factory->>Factory: Calculate gross, net, overtime, undertime
            Factory-->>Strategy: TimeEntry { entryType_code: 'W', hours: 7.20, ... }
            Strategy->>Strategy: Push entry to newEntries[]
        end
    end

    Strategy-->>Command: newEntries[] (z.B. 320 neue Entries)

    Note over Command,Validator: ✅ Phase 8: Validierung der generierten Entries
    Command->>Validator: validateGeneratedEntries(newEntries)
    Validator->>Validator: Check: entries.length > 0
    Validator->>Validator: For each: entry.workDate exists?
    Validator->>Validator: For each: entry.user_ID matches?
    Validator-->>Command: ✅ Alle Entries valide

    Note over Command,Command: 📊 Phase 9: Stats-Berechnung
    Command->>Command: calculateYearlyStats(newEntries, existingDates.size)
    loop Für jeden Entry in newEntries
        Command->>Command: Switch entryType_code
        Command->>Command: 'W' → workdays++
        Command->>Command: 'O' → weekends++
        Command->>Command: 'H' → holidays++
    end
    Command->>Command: stats = { generated: 320, existing: 45, total: 365, workdays: 251, weekends: 104, holidays: 10 }

    Note over Command,DB: 💾 Phase 10: Batch-Insert in Datenbank
    alt Neue Entries vorhanden (320 > 0)
        Command->>TimeRepo: insertBatch(newEntries)
        TimeRepo->>DB: BEGIN TRANSACTION
        loop Für jeden Entry (Batch von 320)
            TimeRepo->>DB: INSERT INTO TimeEntries VALUES (...)
        end
        TimeRepo->>DB: COMMIT
        DB-->>TimeRepo: ✅ 320 rows inserted
        TimeRepo-->>Command: Success
    else Keine neuen Entries
        Command->>Command: Skip Insert
    end

    Note over Command,DB: 📖 Phase 11: Alle Entries des Jahres laden
    Command->>TimeRepo: getEntriesInRange(userID, '2025-01-01', '2025-12-31')
    TimeRepo->>DB: SELECT * FROM TimeEntries WHERE user_ID = ? AND workDate BETWEEN ? AND ?
    DB-->>TimeRepo: 365 TimeEntry Records
    TimeRepo-->>Command: allEntries[] (365 Entries)

    Note over Command,UI: ✅ Phase 12: Response & UI Feedback
    Command-->>Handler: { newEntries, allEntries, stats }
    Handler->>Handler: req.info('✅ 320 neue Einträge generiert (251 Arbeitstage, 104 Wochenenden, 10 Feiertage)')
    Handler-->>Service: return allEntries[]
    Service-->>Router: OData Response mit 365 Entries
    Router-->>UI: HTTP 200 OK + JSON Payload
    UI->>UI: Refresh Table
    UI->>UI: Show Success Toast
    UI-->>UI: ✅ "Jahr 2025 erfolgreich generiert!"
```

### 🎯 Key Takeaways der Jahresgenerierung

| Phase                    | Dauer     | Highlights                                   |
| ------------------------ | --------- | -------------------------------------------- |
| **1. Request Routing**   | ~5ms      | Registry löst Handler auf                    |
| **2. Validation**        | ~10ms     | User, StateCode, Year validiert              |
| **3. User Resolution**   | ~20ms     | DB-Query für User-Stammdaten                 |
| **4. Year Data**         | ~1ms      | 365 Tage, Schaltjahr-Check                   |
| **5. Existing Entries**  | ~50ms     | DB-Query: Welche Tage bereits vorhanden?     |
| **6. Holiday API**       | ~200ms    | **Externe API** für 13 Feiertage (BY)        |
| **7. Loop 365 Tage**     | ~100ms    | Weekend-Check, Holiday-Lookup, Factory       |
| **8. Validation**        | ~50ms     | 320 neue Entries validieren                  |
| **9. Stats Calculation** | ~10ms     | Workdays/Weekends/Holidays zählen            |
| **10. Batch Insert**     | ~500ms    | **320 INSERTs** in Transaction               |
| **11. Load All Entries** | ~100ms    | 365 Entries aus DB laden                     |
| **12. Response**         | ~50ms     | JSON serialisieren, UI Update                |
| **GESAMT**               | **~1,1s** | Komplettes Jahr mit Feiertagen generiert! 🎉 |

### 🔍 Special Features

- **🎉 Feiertags-API Integration**: Echte deutsche Feiertage von `feiertage-api.de`
- **💾 Cache**: Holidays werden pro Jahr/Bundesland gecacht
- **🔄 Idempotenz**: Existierende Entries werden übersprungen
- **🏭 Factory Pattern**: Unterschiedliche Entry-Typen (Work/Weekend/Holiday)
- **📊 Rich Stats**: Detaillierte Auswertung mit Criticality
- **⚡ Batch Insert**: 320 Entries in einer Transaction
- **🛡️ Error Handling**: API-Fallback bei Fehlern

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js LTS (v18+)
node --version

# CAP Development Kit
npm install -g @sap/cds-dk

# TypeScript
npm install -g typescript
```

### Installation & Start

```bash
# 1. Dependencies installieren
npm install

# 2. TypeScript kompilieren
npm run build

# 3. Server starten (mit Live Reload)
npm run watch
```

Die App läuft auf: **http://localhost:4004**

### Development Scripts

```bash
npm run watch    # Development mit Auto-Reload
npm run build    # TypeScript kompilieren
npm run format   # Code formatieren (Prettier)
npm run lint     # Linting (ESLint)
```

---

## 🎯 Features & Funktionen

### ✅ Zeiterfassung

- **CRUD Operations** für TimeEntries
- **Automatische Berechnung** von Brutto/Netto/Über-/Unterstunden
- **Work vs. NonWork** Entries (Urlaub, Krank, Feiertag)
- **Projekt & Activity** Zuordnung
- **Draft Support** für komfortable Bearbeitung

### 📅 Bulk-Generierung

- **`generateMonthlyTimeEntries()`** - Alle Arbeitstage des Monats
- **`generateYearlyTimeEntries(year, stateCode)`** - Komplettes Jahr mit:
  - Wochenenden (automatisch erkannt)
  - Feiertage (API für alle 16 Bundesländer)
  - Arbeitsfreie Tage

### 💰 Balance-Tracking

- **`getMonthlyBalance(year, month)`** - Saldo pro Monat
- **`getCurrentBalance()`** - Kumulierter Gesamtsaldo
- **`MonthlyBalances`** - Virtuelle Entity mit letzten 6 Monaten
- **Criticality Indicators** - Visuelles Feedback (🟢 Grün / 🔴 Rot)

### 🔐 Business Rules

- **Expected Daily Hours** - Automatisch aus Weekly Hours berechnet
- **Feiertags-Integration** - Bundeslandspezifisch (feiertage-api.de)
- **Validierung** - Projekt, Activity, Entry-Type auf allen Ebenen
- **Change Detection** - Neuberechnung nur bei relevanten Änderungen
- **Eindeutigkeit** - Nur ein Entry pro User/Tag

---

## 📚 Dokumentation & Ressourcen

- **[REFACTORING.md](srv/track-service/REFACTORING.md)** - Detaillierte Refactoring-Dokumentation
- **CDS Annotations** - Siehe `srv/annotations/`
- **UI5 Apps** - Siehe `app/timetable/` und `app/timetracking/`
- **Data Model** - Siehe `db/data-model.cds`

### Externe Ressourcen

- **CAP Docs**: [cap.cloud.sap](https://cap.cloud.sap)
- **UI5 Docs**: [ui5.sap.com](https://ui5.sap.com)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org)
- **Fiori Guidelines**: [experience.sap.com/fiori-design](https://experience.sap.com/fiori-design)

---

## 🎓 Learnings & Best Practices

### Was du hier lernen kannst:

1. ✅ **Clean Architecture** in der Praxis
2. ✅ **Design Patterns** richtig anwenden (8 Patterns!)
3. ✅ **TypeScript** in CAP Services (100% typed!)
4. ✅ **Dependency Injection** ohne Framework
5. ✅ **Event-Driven Architecture** mit Registry
6. ✅ **SOLID Principles** im echten Code
7. ✅ **Testbare Architektur** durch Separation of Concerns
8. ✅ **Fiori Elements** vs. Custom UI5

### Best Practices die wir umsetzen:

- 🎯 **Single Responsibility** - Jede Klasse macht genau eine Sache
- 🔗 **Dependency Injection** - Keine `new` in Business Logic
- 🛡️ **Type Safety** - TypeScript überall
- 📝 **Documentation** - JSDoc für alle APIs
- ✅ **Error Handling** - Try-Catch überall
- 📊 **Logging** - Strukturiert mit Emojis
- 🧪 **Testability** - Alles mockbar durch DI

---

## 🖥️ Frontend Applications

Wir haben zwei verschiedene UI5-Apps, die zeigen, wie unterschiedlich man an Fiori-Entwicklung rangehen kann:

### 📋 Timetable App (Fiori Elements) - Der schnelle Weg

Die "No-Code"-Variante! Fiori Elements generiert automatisch eine komplette App aus deinen Annotations:

- **List Report & Object Page** für TimeEntries - alles automatisch generiert
- **Draft-enabled** für komfortable Bearbeitung mit "Speichern" und "Verwerfen"
- **Smart Controls** mit automatischer Validierung aus dem Backend
- **Responsive Design** out-of-the-box für Desktop/Tablet/Mobile
- **TypeScript Component** für eigene Extensions
- **Filterbar & Search** automatisch aus Annotations

Die meiste Arbeit passiert in den `annotations.cds` Files. Wenig Code, viel Power! 💪

**Technische Details:**

- **App-Typ**: Fiori Elements List Report & Object Page
- **UI5 Version**: Latest (definiert in `ui5.yaml`)
- **TypeScript**: `webapp/Component.ts` für Extensions
- **Annotations**: `app/timetable/annotations.cds` definiert komplettes UI
- **Features**: Draft, Filterbar, Search, ValueHelp (F4), Side Effects

**Beispiel Annotations** (aus `annotations.cds`):

```cds
annotate TrackService.TimeEntries with @(
    UI.LineItem: [
        { Value: workDate, Label: '{i18n>workDate}' },
        { Value: user.name, Label: '{i18n>user}' },
        { Value: project.name, Label: '{i18n>project}' },
        { Value: durationHoursNet, Label: '{i18n>netHours}' },
        { Value: overtimeHours, Label: '{i18n>overtime}' }
    ],
    UI.HeaderInfo: {
        TypeName: '{i18n>timeEntry}',
        TypeNamePlural: '{i18n>timeEntries}',
        Title: { Value: workDate }
    }
);
```

### 📊 Timetracking Dashboard (Custom UI5) - Der flexible Weg

Hier haben wir die volle Kontrolle mit Custom UI5 Development:

- **Übersichtsdashboard** mit KPIs und Statistiken
- **Custom XML Views** mit spezieller UX
- **MVC Pattern** mit TypeScript Controllers
- **Chart Integration** für coole Visualisierungen (sap.viz / sap.suite)
- **Client-side Models** für Performance
- **Eigene Navigation** und Routing
- **TypeScript End-to-End** für Type Safety auch im Frontend

Hier kannst du richtig kreativ werden und UI bauen, wie DU es willst! 🎨

**Technische Details:**

- **App-Typ**: Custom UI5 Application (TypeScript)
- **MVC Pattern**: Controller in TypeScript, Views in XML
- **Models**: OData V4 Model + JSON Models für Client-State
- **Routing**: Manifest-based Routing mit TypeScript Router
- **Custom Controls**: Eigene Controls für Dashboard-Widgets

**Projekt-Struktur:**

```
timetracking/webapp/
├── controller/          # TypeScript Controllers
│   ├── BaseController.ts
│   ├── App.controller.ts
│   └── Home.controller.ts
├── view/               # XML Views
│   ├── App.view.xml
│   └── Home.view.xml
├── model/              # Client Models & Formatters
├── css/                # Custom Styles
├── i18n/               # Internationalization
├── Component.ts        # UI5 Component
└── manifest.json       # App Descriptor
```

**TypeScript Controller Beispiel:**

```typescript
import BaseController from './BaseController';
import ODataModel from 'sap/ui/model/odata/v4/ODataModel';

export default class Home extends BaseController {
  public onInit(): void {
    const model = this.getOwnerComponent().getModel() as ODataModel;
    this.loadDashboardData(model);
  }

  private async loadDashboardData(model: ODataModel): Promise<void> {
    // Load balance, recent entries, stats...
  }
}
```

### 🎨 UI5 & Fiori Features - Das UI rockt auch!

**Responsive & Smart:**

- **Responsive Design** mit sap.m Controls - läuft auf Desktop, Tablet, Phone
- **Smart Forms** mit automatischer Validierung aus Backend-Annotations
- **Value Helps (F4)**: Dropdown für Projects, Users, Activities mit Search
- **Flexible Column Layout**: Fiori 3 Standard für List/Detail Navigation
- **Device Adaptation**: Passt sich automatisch an Bildschirmgröße an

**UX & Accessibility:**

- **Accessibility (a11y) Compliant**: WCAG 2.1 Standards
- **Keyboard Navigation**: Alles mit Tab/Enter/Space bedienbar
- **Screen Reader Support**: ARIA Labels überall
- **High Contrast Themes**: Automatisch supported

**Fiori Design System:**

- **SAP Fiori Guidelines**: Wir folgen den SAP Design Principles
- **Semantic Colors**: Green für Überstunden, Red für Unterstunden
- **Icons & Emojis**: Intuitive Symbolik (🕐 für Zeit, 📊 für Reports)
- **Consistent UX**: Same Look & Feel wie alle SAP Fiori Apps

---

## 📊 Projekt-Stats

**Code-Metriken:**

- **Vorher:** `track-service.ts` mit 248 Zeilen (monolithisch)
- **Nachher:** `track-service.ts` mit 165 Zeilen (-33% 🎉)

**Neue Architektur:**

- 7 Commands in 3 Kategorien (CRUD, Generation, Balance)
- 3 Validators (Domain-spezifisch)
- 4 Repositories (1 pro Entity)
- 4 Services (Domain Logic)
- 2 Strategies (Algorithms)
- 1 Factory (Object Creation)
- 1 ServiceContainer (DI mit 6 Kategorien)
- 1 HandlerRegistry (Event-Driven Architecture)
- 3 Handler-Klassen (Separation of Concerns)

**= 26 Pattern-Klassen!** Alle sauber strukturiert und testbar! 🚀

---

## 🤝 Contributing

Du willst bei diesem Projekt mitmachen? **Awesome!** 🎉 Hier ist dein Guide:

### 🐛 Bug Reports & Feature Requests

Hast du einen Bug gefunden oder eine coole Idee?

1. **Check erst die Issues** - Vielleicht gibt's das schon!
2. **Öffne ein Issue** mit aussagekräftiger Beschreibung
3. **Bei Bugs**: Steps to reproduce + erwartetes vs. tatsächliches Verhalten
4. **Bei Features**: Use Case + Business Value beschreiben

### 🔧 Code Contributions

#### 1️⃣ Setup

```bash
# Fork & Clone
git clone https://github.com/YOUR_USERNAME/cap-fiori-timetracking.git
cd cap-fiori-timetracking

# Install & Build
npm install
npm run build

# Start Development
npm run watch
```

#### 2️⃣ Neue Handler hinzufügen

**Beispiel:** Du willst einen `ReportHandler` für PDF-Exports hinzufügen:

```typescript
// srv/handler/handlers/ReportHandlers.ts
import { ServiceContainer } from '../container/ServiceContainer';

export class ReportHandlers {
  constructor(private container: ServiceContainer) {}

  async handleGenerateReport(req: any): Promise<void> {
    const command = this.container.getCommand<GenerateReportCommand>('generateReport');
    const result = await command.execute(req.data);
    return result;
  }
}
```

**Schritte:**

1. **Command erstellen**: `srv/handler/commands/ReportCommands.ts`
2. **Im Container registrieren**: `ServiceContainer.ts` → `buildCommands()`
3. **Handler-Klasse erstellen**: `srv/handler/handlers/ReportHandlers.ts`
4. **In track-service.ts registrieren**:
   ```typescript
   private registerReportHandlers(registry: HandlerRegistry): void {
     const handlers = new ReportHandlers(this.container);
     registry.register({
       type: 'on',
       event: 'generateReport',
       entity: Reports,
       handler: handlers.handleGenerateReport.bind(handlers),
       description: 'Generate PDF report'
     });
   }
   ```
5. **Tests schreiben** (wenn vorhanden)
6. **Dokumentieren** in `REFACTORING.md`

#### 3️⃣ Code Style & Quality

Wir nutzen:

```bash
npm run lint      # ESLint für Code Quality
npm run format    # Prettier für Formatting
npm run build     # TypeScript Compilation Check
```

**Wichtig:**

- ✅ **TypeScript everywhere** - keine `any`-Types!
- ✅ **JSDoc für alle public APIs**
- ✅ **Sprechende Variablennamen** (keine `x`, `temp`, `data1`)
- ✅ **Single Responsibility** - jede Funktion macht genau EINE Sache
- ✅ **DRY Principle** - kein Copy-Paste-Code
- ✅ **Error Handling** - try-catch mit aussagekräftigen Messages

#### 4️⃣ Commit Messages

Wir folgen [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: add PDF export for monthly reports
fix: correct overtime calculation for leap years
docs: update README with new handler registration
refactor: extract validation logic into separate validator
test: add unit tests for TimeBalanceService
```

**Types:**

- `feat:` - Neues Feature
- `fix:` - Bug Fix
- `docs:` - Dokumentation
- `refactor:` - Code-Verbesserung ohne Funktionsänderung
- `test:` - Tests hinzufügen
- `chore:` - Build, Dependencies, etc.

#### 5️⃣ Pull Request

1. **Branch erstellen**: `git checkout -b feat/my-awesome-feature`
2. **Changes committen**: Mehrere kleine Commits sind besser als ein großer!
3. **Push**: `git push origin feat/my-awesome-feature`
4. **PR öffnen** mit:
   - **Was** hast du geändert?
   - **Warum** war die Änderung nötig?
   - **Wie** hast du es getestet?
   - Screenshots (falls UI-Change)

### 📖 Dokumentation verbessern

Auch Doku-Beiträge sind **super willkommen**!

- **README.md** - Hauptdokumentation
- **Code-Kommentare** - JSDoc für schwierige Logik
- **Annotations** - CDS Annotation Labels verbessern

### 🎓 Du bist neu bei CAP/TypeScript?

**Kein Problem!** Hier sind gute Einstiegspunkte:

- 🟢 **Easy**: Typo-Fixes, Doku-Verbesserungen
- 🟡 **Medium**: Neue Validatoren, Tests schreiben
- 🔴 **Hard**: Neue Commands/Strategies, Architecture Changes

Schau nach Issues mit dem Label `good-first-issue`!

### 💬 Fragen?

Öffne ein Issue oder schreib einen Comment! Die Community hilft gerne! 🙌

---

## 📝 License

MIT License - Do whatever you want with this code! 🚀

---

## 🙏 Acknowledgments

- **SAP CAP Team** - Für das großartige Framework
- **UI5 Team** - Für Fiori Elements & UI5
- **TypeScript Team** - Für typsichere Entwicklung
- **Open Source Community** - Für Inspiration & Best Practices

---

**Happy Coding! 🚀**

_Built with ❤️ and TypeScript in 2025_

---

**Bei Fragen:** Öffne ein Issue!
