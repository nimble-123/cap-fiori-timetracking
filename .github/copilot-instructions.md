# CAPture Time - AI Development Guide

## Architecture Overview

This is a **100% TypeScript SAP CAP application** with Clean Architecture principles. The codebase follows a strict **3-tier architecture** with clear separation of concerns:

- **Presentation Layer**: TypeScript UI5 (Fiori Elements + Custom UI5)
- **Application Layer**: CAP TrackService (Orchestrator)
- **Business Logic Layer**: Commands, Validators, Services, Strategies, Factories
- **Data Access Layer**: Repositories + SQLite

## Critical Setup & Workflow

### Essential Commands

- `npm run watch` - Development with auto-reload (uses `cds-tsx w`)
- `npm run build` - TypeScript compilation check
- `npm run format` - Prettier formatting (mandatory before commits)
- `npm run generate-entry-point` - Generate entry points with dev-cap-tools

### Type Generation

The project uses **@cap-js/cds-typer** for auto-generated TypeScript types. Import from `#cds-models/*`:

```typescript
import { TimeEntry, User } from '#cds-models/TrackService';
import { Transaction } from '@sap/cds';
```

### Mock Users

Two test users configured in `package.json` → `cds.requires.auth.users`:

- `max.mustermann@test.de` / password: `max`
- `erika.musterfrau@test.de` / password: `erika`

## Core Design Patterns (MANDATORY)

### 1. ServiceContainer (Dependency Injection)

**Location**: `srv/track-service/handler/container/ServiceContainer.ts`

All dependencies are resolved through the container with **6 categories**:

- `repository`: Data access (TimeEntry, User, Project, ActivityType)
- `service`: Domain services (UserService, HolidayService, TimeBalanceService)
- `validator`: Business validation (TimeEntry, Generation, Balance)
- `strategy`: Generation strategies (Monthly, Yearly)
- `command`: Business operations (7 commands for CRUD/Generation/Balance)
- `factory`: Object creation (TimeEntry, Handler)

```typescript
// Resolution pattern
const userService = container.get<UserService>('service', 'user');
const createCommand = container.get<CreateTimeEntryCommand>('command', 'createTimeEntry');
```

### 2. Command Pattern (7 Commands)

**Location**: `srv/track-service/handler/commands/**/*`

Commands encapsulate ALL business logic for operations:

- `CreateTimeEntryCommand` / `UpdateTimeEntryCommand` - CRUD
- `GenerateMonthlyCommand` / `GenerateYearlyCommand` - Bulk generation
- `GetMonthlyBalanceCommand` / `GetCurrentBalanceCommand` / `GetRecentBalancesCommand` - Balance queries

**Command Structure**:

```typescript
class CreateTimeEntryCommand {
  constructor(dependencies: { userService; validator; repository; factory }) {}
  async execute(tx: Transaction, entryData: Partial<TimeEntry>): Promise<any> {
    // 1. Validate
    // 2. Fetch dependencies
    // 3. Calculate
    // 4. Return data (not saved - done by handler)
  }
}
```

### 3. Handler Setup (Builder + Registry + Registrar)

**Location**: `srv/track-service/handler/setup/HandlerSetup.ts`

Fluent API for handler initialization:

```typescript
HandlerSetup.create(container, registry)
  .withAllHandlers() // or selective: .withTimeEntryHandlers().withGenerationHandlers()
  .apply(service);
```

**Flow**: HandlerFactory creates handlers → HandlerRegistrar registers to registry → Registry applies to service

### 4. Factories (Object Creation)

- **TimeEntryFactory**: Creates domain objects with business rules
  - `createWorkTimeData()` - Calculates gross/net/overtime/undertime
  - `createNonWorkTimeData()` - Vacation/sick leave data
  - `createDefaultEntry()` / `createWeekendEntry()` / `createHolidayEntry()` - Generation entries
- **HandlerFactory**: Creates handler instances with resolved dependencies

## Domain-Specific Knowledge

### Time Calculations

**Service**: `TimeCalculationService` (static utility methods)

Time handling uses **decimal hours** (e.g., 7.5h = 7h 30min):

- `durationHoursGross` = endTime - startTime
- `durationHoursNet` = gross - breakMin
- `overtimeHours` = net - expectedDailyHoursDec (if positive)
- `undertimeHours` = expectedDailyHoursDec - net (if positive)

**Calculated fields** are `@readonly` in CDS (see `srv/track-service/annotations/common/field-controls.cds`)

### Entry Types (EntryTypes CodeList)

- `W` = Work (Arbeit)
- `B` = Business Trip (Dienstreise)
- `V` = Vacation (Urlaub)
- `S` = Sick (Krankheit)
- `H` = Holiday (Feiertag)
- `O` = Off/Weekend (Frei)
- `F` = Flextime Reduction (Flexzeitabbau)
- `G` = Gleitzeit Reduction (Gleitzeitabbau)

### Holiday Integration

**Service**: `HolidayService` (uses feiertage-api.de)

Fetches German public holidays with **state-specific** support (e.g., "BY" = Bavaria). Results are **cached** per year/state. Called by `YearlyGenerationStrategy`.

### Data Source Field

TimeEntries have a `source` field indicating origin:

- `UI` = Created via UI
- `GENERATED` = Created via bulk generation
- Used for distinguishing manually entered vs auto-generated entries

## CDS Annotations Structure

Annotations are **modular** in `srv/track-service/annotations/`:

- `common/` - Cross-cutting: authorization, capabilities, field-controls, labels, value-helps
- `ui/` - Entity-specific UI annotations: timeentries-ui, users-ui, projects-ui, etc.

Use `@readonly` for calculated fields, `@mandatory` for required fields.

## Frontend Apps

### Fiori Elements App: `app/timetable/`

List Report with annotations-driven UI, TypeScript Component

### Custom UI5 App: `app/timetracking/`

Custom dashboard with SinglePlanningCalendar, TypeScript controllers/models/views

Both use OData V4 service at `/odata/v4/track/`

## Logging Convention

**Logger**: `srv/track-service/handler/utils/logger.ts`

Standardized categories with prefixes:

```typescript
logger.commandStart('CreateTimeEntry', context);
logger.validationSuccess('TimeEntry', message, context);
logger.serviceCall('Holiday', message, context);
logger.error('Error message', error, context);
```

Log levels configured in `package.json` → `cds.log.levels['track-service']`

## File Naming & Structure

- **Commands**: Verb + noun (e.g., `CreateTimeEntryCommand.ts`)
- **Handlers**: Plural entity name (e.g., `TimeEntryHandlers.ts`)
- **Barrel exports**: Each directory has `index.ts` exporting all members
- **CDS files**: kebab-case (e.g., `field-controls.cds`, `timeentries-ui.cds`)

## Testing & Validation

Before ANY database operation:

1. **Validate references** (user, project, activity exist)
2. **Check uniqueness** (one entry per user per day)
3. **Validate business rules** (entryType-specific validations)

Validators are injected via ServiceContainer and used in Commands.

## Common Pitfalls

❌ **DON'T** import from `gen/` folder - use `#cds-models/*` imports
❌ **DON'T** calculate time fields in handlers - use TimeEntryFactory
❌ **DON'T** bypass validators - always validate before operations
❌ **DON'T** hardcode user IDs - use UserService.getCurrentUserID()
❌ **DON'T** register handlers manually - use HandlerSetup builder

✅ **DO** resolve dependencies from ServiceContainer
✅ **DO** use Commands for business operations
✅ **DO** leverage Factories for object creation
✅ **DO** follow the established patterns (no shortcuts!)

## Documentation & Knowledge Sources

**MCP Servers** (configured in `.vscode/mcp.json`):

- `sap-docs` - Aggregated SAP documentation via HTTP (ABAP, CAP, UI5, Community)
- `cds-mcp` - CAP documentation and API references
- `@sap-ux/fiori-mcp-server` - Fiori Elements patterns and UX guidelines
- `@ui5/mcp-server` - UI5 control APIs and framework references

**Prompts** (in `.github/prompts/`, YAML format for GitHub Models):

- Discovery: `product-owner-feature-brief`, `product-owner-story-outline`
- Reviews: `review-coach`, `test-strategy-designer`
- Architecture: `architecture-deep-dive`, `adr-drafting-assistant`
- Support: `bug-triage-investigator`, `release-notes-curator`

❌ **DON'T** guess or assume API signatures - query MCP servers first
❌ **DON'T** modify code without checking relevant documentation
❌ **DON'T** skip ADR updates when making architectural decisions

✅ **DO** use MCP servers to verify CAP/Fiori/UI5 APIs before coding
✅ **DO** consult ARCHITECTURE.md for design patterns and layer structure
✅ **DO** update README, ARCHITECTURE, ADRs when changing behavior or structure
