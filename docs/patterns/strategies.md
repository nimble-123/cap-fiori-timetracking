# 📋 Strategy Pattern

**Dateien:** `srv/handler/strategies/*.ts`

Das **Strategy Pattern** ermöglicht austauschbare Algorithmen für unterschiedliche Generierungsszenarien. Jede Strategy kapselt einen spezifischen Algorithmus und ist unabhängig austauschbar:

```typescript
/**
 * MonthlyGenerationStrategy - Generiert alle Arbeitstage eines Monats
 */
export class MonthlyGenerationStrategy {
  constructor(
    private timeEntryFactory: TimeEntryFactory,
    private customizingService: CustomizingService,
  ) {}

  generateMissingEntries(userID: string, user: User, existingDates: Set<string>): TimeEntry[] {
    const monthData = DateUtils.getCurrentMonthData();

    const userDefaults = this.customizingService.getUserDefaults();
    const workingDaysPerWeek = user.workingDaysPerWeek ?? userDefaults.fallbackWorkingDays;
    const newEntries: TimeEntry[] = [];

    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const currentDate = new Date(monthData.year, monthData.month, day);

      // Skip Wochenenden & existierende Einträge
      if (!DateUtils.isWorkingDay(currentDate, workingDaysPerWeek)) {
        continue;
      }

      const dateString = DateUtils.toLocalDateString(currentDate);
      if (existingDates.has(dateString)) continue;

      // Factory erstellt perfekt berechnete Entries
      const entry = this.timeEntryFactory.createDefaultEntry(userID, currentDate, user);
      newEntries.push(entry);
    }

    return newEntries;
  }
}
```

**Features:**

- 🔄 Austauschbare Algorithmen ohne Code-Änderung
- 🎯 Jede Strategy kennt ihre spezifische Business-Logik
- 🏭 Nutzt Factory für konsistente Entry-Erstellung
- 📅 Weekend-Detection und Date-Utilities
- ⚡ Performance-optimiert mit Sets für Lookup
