# 🎭 Handler Pattern (3 Handler-Klassen)

**Dateien:** `srv/handler/handlers/*.ts`

Das **Handler Pattern** trennt Event-Handling von Business-Logik. Handler sind die "Orchestratoren" die auf CAP-Events reagieren und die eigentliche Arbeit an Commands delegieren:

```typescript
/**
 * TimeEntryHandlers - Handler für TimeEntry CRUD-Operationen
 */
export class TimeEntryHandlers {
  constructor(
    private createCommand: CreateTimeEntryCommand,
    private updateCommand: UpdateTimeEntryCommand,
  ) {}

  /**
   * Handler: TimeEntry erstellen (before CREATE)
   * Delegiert Business Logic an Command
   */
  async handleCreate(req: any): Promise<void> {
    try {
      const tx = cds.transaction(req) as any;
      const calculatedData = await this.createCommand.execute(tx, req.data);

      // Berechnete Daten in Request übernehmen
      // CAP Framework macht dann automatisch den INSERT
      Object.assign(req.data, calculatedData);
    } catch (error: any) {
      req.reject(error.code || 400, error.message);
    }
  }

  /**
   * Handler: TimeEntry aktualisieren (before UPDATE)
   */
  async handleUpdate(req: any): Promise<void> {
    try {
      const tx = cds.transaction(req) as any;
      const calculatedData = await this.updateCommand.execute(tx, req.data);
      Object.assign(req.data, calculatedData);
    } catch (error: any) {
      req.reject(error.code || 400, error.message);
    }
  }
}
```

**Features:**

- 🎭 Klare Trennung: Handler = Orchestration, Command = Business Logic
- 🔗 Dependency Injection der Commands
- 🛡️ Zentrales Error Handling
- 📋 Gruppierung nach Domäne (CRUD / Generation / Balance)
- 🎯 Thin Layer - nur Delegation, keine Business Logic

**Unsere 3 Handler-Klassen:**

- `TimeEntryHandlers` - CRUD Operations (CREATE/UPDATE/DELETE)
- `GenerationHandlers` - Bulk-Generierung (Monthly/Yearly)
- `BalanceHandlers` - Balance-Abfragen (Monthly/Current/Recent)
