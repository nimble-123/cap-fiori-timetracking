# ✅ Validator Pattern (7 Validators)

**Dateien:** `srv/handler/validators/*.ts`

Das **Validator Pattern** kapselt komplexe Validierungslogik in wiederverwendbare Klassen. Jeder Validator fokussiert sich auf eine spezifische Domäne und folgt dem **Single Responsibility Principle**:

```typescript
/**
 * ProjectValidator - Validiert Project-Referenzen
 */
export class ProjectValidator {
  constructor(private projectRepository: ProjectRepository) {}

  async validateActive(tx: Transaction, projectId: string): Promise<void> {
    const project = await this.projectRepository.findByIdActive(tx, projectId);
    if (!project) {
      throw new Error('Projekt ist ungültig oder inaktiv.');
    }
  }
}

/**
 * ActivityTypeValidator - Validiert Activity-Codes
 */
export class ActivityTypeValidator {
  constructor(private activityTypeRepository: ActivityTypeRepository) {}

  async validateExists(tx: Transaction, code: string): Promise<void> {
    const activity = await this.activityTypeRepository.findByCode(tx, code);
    if (!activity) {
      throw new Error('Ungültiger Activity Code.');
    }
  }
}

/**
 * TimeEntryValidator - Orchestriert Entry-Validierung
 */
export class TimeEntryValidator {
  constructor(
    private projectValidator: ProjectValidator,
    private activityTypeValidator: ActivityTypeValidator,
    private timeEntryRepository: TimeEntryRepository,
  ) {}

  async validateReferences(tx: Transaction, entryData: Partial<TimeEntry>): Promise<void> {
    // Delegiert an spezialisierte Validators
    if (entryData.project_ID) {
      await this.projectValidator.validateActive(tx, entryData.project_ID);
    }
    if (entryData.activity_code) {
      await this.activityTypeValidator.validateExists(tx, entryData.activity_code);
    }
  }
}
```

**Features:**

- ✅ **Separation of Concerns** - Jeder Validator eine Verantwortung
- 🎯 **Domain-spezifische Rules** - TimeEntry, Project, ActivityType, Generation, Balance
- 🔗 **Validator Composition** - TimeEntryValidator nutzt Project & ActivityType Validators
- 🛡️ **Konsistente Error Messages** mit Logging
- 🧪 **Isoliert testbar** - Reine Business Logic ohne CAP Dependencies

**Unsere 7 Validators:**

- `ProjectValidator` - Project-Aktivitäts-Validierung
- `ActivityTypeValidator` - Activity-Code-Validierung
- `WorkLocationValidator` - Arbeitsort-Validierung
- `TravelTypeValidator` - Reiseart-Validierung
- `TimeEntryValidator` - Entry-Validierung + Change Detection (nutzt Project, ActivityType, WorkLocation, TravelType)
- `GenerationValidator` - User, StateCode, Year Validierung
- `BalanceValidator` - Year/Month Plausibilitätsprüfung
