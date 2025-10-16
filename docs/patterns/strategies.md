# 📋 Strategy Pattern

**Dateien:** `srv/handler/strategies/*.ts`

Das **Strategy Pattern** ermöglicht austauschbare Algorithmen für unterschiedliche Generierungsszenarien. Jede Strategy kapselt einen spezifischen Algorithmus und ist unabhängig austauschbar:

```typescript
/**
 * MonthlyGenerationStrategy - Generiert alle Arbeitstage eines Monats
 */
export class MonthlyGenerationStrategy {
  generateMissingEntries(userID: string, user: User, existingDates: Set<string>): TimeEntry[] {
    const monthData = DateUtils.getCurrentMonthData();
    const newEntries: TimeEntry[] = [];

    for (let day = 1; day <= monthData.daysInMonth; day++) {
      const currentDate = new Date(monthData.year, monthData.month, day);

      // Skip Wochenenden & existierende Einträge
      if (!DateUtils.isWorkingDay(currentDate, user.workingDaysPerWeek)) {
        continue;
      }

      const dateStr = DateUtils.formatDate(currentDate);
      if (existingDates.has(dateStr)) continue;

      // Factory erstellt perfekt berechnete Entries
      newEntries.push(TimeEntryFactory.createDefaultEntry(userID, dateStr, user));
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
