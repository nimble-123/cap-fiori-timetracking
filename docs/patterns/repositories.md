# 💾 Repository Pattern (6 Repositories)

**Dateien:** `srv/handler/repositories/*.ts`

Das **Repository Pattern** abstrahiert den Datenzugriff und kapselt alle SQL-Operationen. Jede Entity hat ihr eigenes Repository mit domain-spezifischer Logik:

```typescript
/**
 * TimeEntryRepository - Datenzugriff für TimeEntries
 */
export class TimeEntryRepository {
  private TimeEntries: any;

  constructor(entities: any) {
    this.TimeEntries = entities.TimeEntries;
  }

  /**
   * Lädt Eintrag nach User/Datum
   */
  async getEntryByUserAndDate(
    tx: Transaction,
    userId: string,
    workDate: string,
    excludeId?: string,
  ): Promise<TimeEntry | null> {
    const whereClause: any = { user_ID: userId, workDate };
    if (excludeId) whereClause.ID = { '!=': excludeId };

    const entry = await tx.run(SELECT.one.from(this.TimeEntries).where(whereClause));
    return entry || null; // 🎯 Kein throw! Pure Datenabfrage
  }

  /**
   * Batch-Insert für Performance
   */
  async insertBatch(tx: Transaction, entries: TimeEntry[]): Promise<void> {
    await tx.run(INSERT.into(this.TimeEntries).entries(entries));
  }
}
```

**Features:**

- 💾 Komplette Abstraktion der Datenschicht
- 🔍 Domain-spezifische Queries (z.B. `getEntryByUserAndDate`)
- ⚡ Performance-Optimierung mit Batch-Operations
- 🎯 Reiner Datenzugriff ohne Business Logic (Separation of Concerns!)
- 🧪 Perfekt mockbar für Unit Tests

**Unsere 6 Repositories:**

- `TimeEntryRepository` - CRUD + Queries + Batch Insert
- `UserRepository` - User-Lookup by Email/ID
- `ProjectRepository` - Validierung aktiver Projekte
- `ActivityTypeRepository` - Validierung von Activity Codes
- `WorkLocationRepository` - Validierung von Arbeitsorten
- `TravelTypeRepository` - Validierung von Reisearten
