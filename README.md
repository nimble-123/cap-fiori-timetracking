# 🕐 CAP Fiori Time Tracking Application

Eine moderne Zeiterfassungsanwendung basierend auf SAP CAP (Cloud Application Programming Model) mit Fiori UI5 Frontend. Das Projekt demonstriert Clean Code Prinzipien, moderne Design Patterns, TypeScript-Integration und eine saubere Architektur.

## 🏗️ Solution Architecture

Diese Anwendung folgt einer klassischen 3-Tier-Architektur mit modernen Design Patterns:

```mermaid
graph TB
    subgraph "🖥️ Presentation Layer"
        UI1[Fiori Elements App<br/>Timetable List]
        UI2[Custom UI5 App<br/>Timetracking Dashboard]
    end

    subgraph "⚙️ Business Logic Layer"
        SRV[CAP Service Layer<br/>track-service.ts]

        subgraph "Design Patterns (TypeScript)"
            CMD[Commands]
            FAC[Factory]
            STR[Strategy]
            REP[Repository]
            VAL[Validator]
            SVC[Services]
        end
    end

    subgraph "💾 Data Layer"
        DB[(SQLite/HANA<br/>Time Entries, Users, Projects)]
    end

    UI1 --> SRV
    UI2 --> SRV
    SRV --> CMD
    SRV --> FAC
    SRV --> STR
    CMD --> REP
    CMD --> VAL
    CMD --> SVC
    REP --> DB
```

## 📁 Project Structure

```
cap-fiori-timetracking/
├── 📱 app/                 # Frontend Applications
│ ├── timetable/            # Fiori Elements List/Detail App
│ └── timetracking/         # Custom UI5 Dashboard App
├── 💾 db/                  # Data Model & Test Data
│ ├── data-model.cds        # Domain Entities
│ └── data/                 # CSV Test Data
├── ⚙️ srv/                 # Backend Services (TypeScript)
│ ├── track-service.cds     # OData Service Definition
│ ├── track-service.ts      # Service Implementation (Orchestrator)
│ ├── services/             # 🔧 Business Logic Services
│ │ ├── TimeCalculationService.ts
│ │ └── UserService.ts
│ ├── repositories/         # 💾 Data Access Layer
│ │ └── TimeEntryRepository.ts
│ ├── validators/           # ✅ Validation Logic
│ │ └── TimeEntryValidator.ts
│ ├── factories/            # 🏭 Object Creation
│ │ └── TimeEntryFactory.ts
│ ├── strategies/           # 📋 Algorithm Strategies
│ │ └── MonthlyGenerationStrategy.ts
│ ├── commands/             # 🎯 Command Pattern
│ │ └── TimeEntryCommands.ts
│ └── annotations/          # 📝 UI Annotations
└── package.json
```

## 🎯 Design Patterns Implementation

Das Backend folgt konsequent bewährten Design Patterns für maximale Wartbarkeit und Testbarkeit:

```mermaid
classDiagram
    class Orchestrator {
        +TrackService
        +setupDependencies()
        +handleCRUD()
    }

    class CommandPattern {
        +CreateTimeEntryCommand
        +UpdateTimeEntryCommand
        +execute(tx, data)
    }

    class RepositoryPattern {
        +TimeEntryRepository
        +getById(id)
        +validateUnique()
        +insertBatch()
    }

    class FactoryPattern {
        +TimeEntryFactory
        +createWorkTimeData()
        +createNonWorkTimeData()
    }

    class StrategyPattern {
        +MonthlyGenerationStrategy
        +generateMissingEntries()
    }

    class ServiceLayer {
        +UserService
        +TimeCalculationService
        +getExpectedDailyHours()
    }

    class ValidatorPattern {
        +TimeEntryValidator
        +validateReferences()
        +requiresRecalculation()
    }

    Orchestrator --> CommandPattern
    CommandPattern --> RepositoryPattern
    CommandPattern --> FactoryPattern
    CommandPattern --> ServiceLayer
    CommandPattern --> ValidatorPattern
    Orchestrator --> StrategyPattern
```

### 🔧 Service Layer

- **`TimeCalculationService`**: Statische Utility-Methoden für Zeitberechnungen
- **`UserService`**: User-Management und Expected Daily Hours Logic

### 💾 Repository Pattern

- **`TimeEntryRepository`**: Komplette Abstraktion des Datenzugriffs
- Einfach austauschbar für verschiedene Datenquellen
- Perfekt für Unit Testing mit Mocks

### 🏭 Factory Pattern

- **`TimeEntryFactory`**: Zentrale Objekterstellung für verschiedene Entry-Typen
- Work-Time vs. Non-Work-Time (Urlaub/Krankheit)
- Standard-Entries für automatische Generierung

### 🎯 Command Pattern

- **`CreateTimeEntryCommand`**: Kapselt komplette CREATE-Operation
- **`UpdateTimeEntryCommand`**: Kapselt komplette UPDATE-Operation
- Jede Operation als eigenständiges, testbares Objekt

### 📋 Strategy Pattern

- **`MonthlyGenerationStrategy`**: Austauschbare Generierungsalgorithmen
- Einfach erweiterbar für andere Zeiträume (wöchentlich, jährlich)

### ✅ Validator Pattern

- **`TimeEntryValidator`**: Zentrale Validierungslogik
- Trennt Validierung sauber von Business Logic

## 💾 Data Model

Das Datenmodell ist bewusst einfach gehalten, aber dennoch mächtig:

```mermaid
erDiagram
    User {
        String ID PK
        String name
        Boolean active
        Decimal weeklyHoursDec
        Integer workingDaysPerWeek
        Decimal expectedDailyHoursDec
    }

    TimeEntry {
        UUID ID PK
        String user_ID FK
        Date workDate
        Time startTime
        Time endTime
        Integer breakMin
        String entryType_code FK
        String project_ID FK
        String activity_code FK
        Decimal durationHoursGross
        Decimal durationHoursNet
        Decimal overtimeHours
        Decimal undertimeHours
        String source
        String note
    }

    Project {
        UUID ID PK
        String number
        String name
        Boolean active
        Boolean billable
    }

    EntryTypes {
        String code PK
        String name
    }

    ActivityTypes {
        String code PK
        String name
    }

    User ||--o{ TimeEntry : creates
    Project ||--o{ TimeEntry : assigned_to
    EntryTypes ||--o{ TimeEntry : has_type
    ActivityTypes ||--o{ TimeEntry : has_activity
```

### 🔑 Key Features

- **Automatische Berechnung**: Brutto-/Nettozeiten, Über-/Unterstunden
- **Eindeutigkeit**: Nur ein Entry pro User/Tag
- **Flexible Entry Types**: Work, Vacation, Sick Leave
- **Project Assignment**: Optional, nur aktive Projekte
- **Activity Tracking**: Kategorisierung der Tätigkeiten

## 🖥️ Frontend Applications

### 📋 Timetable App (Fiori Elements)

- **List & Detail Pages** für TimeEntries
- **Draft-enabled** für komfortable Bearbeitung
- **Smart Controls** mit Validierung
- **Responsive Design** für Desktop/Mobile

### 📊 Timetracking Dashboard (Custom UI5)

- **Übersichtsdashboard** mit KPIs
- **Custom Controls** für spezielle UX
- **Chart Integration** für Visualisierungen
- **TypeScript** für Frontend Type Safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- SAP CAP CLI: `npm i -g @sap/cds-dk`
- Optional: SAP Business Application Studio

### Development Setup

```bash
# Clone & Install
git clone <repository>
cd cap-fiori-timetracking
npm install

# Generate CDS Types (für TypeScript)
cds-typer "*" --outputDirectory @cds-models

# Start Development Server
cds watch
# or via VS Code Task: Terminal > Run Task > cds watch

# Access Applications
# Fiori Launchpad: http://localhost:4004
# Service Endpoints: http://localhost:4004/$metadata
```

### 🧪 Testing & Development

```bash
# Run all tests
npm test

# TypeScript Compilation Check
npm run build
# or: tsc --noEmit

# Linting & Formatting
npm run lint
npm run format

# Update CDS Types after model changes
cds-typer "*" --outputDirectory @cds-models
```

## 🔧 Technical Highlights

### Moderne TypeScript-Implementierung

- **Vollständige TypeScript-Migration**: Komplettes Backend in TypeScript
- **CDS-Typer Integration**: `@cds-models` für Compile-Time Type Safety
- **ES6+ Features**: Classes, Destructuring, Async/Await
- **Clean Code**: Single Responsibility, DRY, SOLID Prinzipien
- **Type Safety**: End-to-End TypeScript (Backend + Frontend)
- **JSDoc**: Umfassende API-Dokumentation

### TypeScript & CDS Integration

- **@cds-models/**: Auto-generierte TypeScript-Typen aus CDS-Modellen
- **Type-safe Queries**: Vollständiges IntelliSense für CDS-Entitäten
- **Compile-time Validierung**: Fehler vor Laufzeit abfangen
- **Verbesserte Developer Experience**: Besseres Refactoring und Code-Navigation
- **Design Pattern Types**: Alle Patterns vollständig typisiert mit Interfaces

### CAP Best Practices

- **Service-oriented Architecture**
- **Draft-enabled Entities** für UX
- **Localization Support** (i18n)
- **Annotation-driven UI**
- **Unbound Actions** für Complex Operations

### Performance & Scalability

- **Lazy Loading** in Repository Pattern
- **Batch Operations** für Mass Data
- **Efficient Queries** mit CDS QL
- **Caching Strategy** für User Data

## 🎨 UI5 & Fiori Features

- **Responsive Design** mit sap.m Controls
- **Smart Forms** mit Validation
- **Value Help** für Lookups
- **Flexible Column Layout**
- **Device Adaptation**
- **Accessibility (a11y) Compliant**

## 🔒 Security & Authorization

- **Field-level Security** via Annotations
- **Role-based Access Control**
- **Input Validation** auf allen Layern
- **SQL Injection Prevention** durch CDS
- **CSRF Protection** out-of-the-box

## 📈 Monitoring & Observability

- **Structured Logging** mit Console Emojis 😎
- **Error Handling** mit aussagekräftigen Messages
- **Performance Tracking** möglich
- **Health Checks** über CAP

---

**Happy Coding!** 🚀 Bei Fragen einfach ein Issue erstellen oder den Code direkt anschauen - er ist selbstdokumentierend geschrieben.
