# 🏭 Factory Pattern (2 Factories!)

## **TimeEntryFactory** - Domain Object Creation

**Datei:** `srv/handler/factories/TimeEntryFactory.ts`

Kennt alle Business Rules und erstellt perfekt berechnete TimeEntry-Objekte:

```typescript
const factory = container.getFactory<TimeEntryFactory>('timeEntry');

// Work-Time Data (wird im Command verwendet)
const workData = await factory.createWorkTimeData(userService, tx, userId, startTime, endTime, breakMin);
// → Berechnet automatisch: gross, net, overtime, undertime, nutzt Customizing-Fallbacks

// Non-Work-Time Data (Urlaub, Krankheit)
const nonWorkData = await factory.createNonWorkTimeData(userService, tx, userId);

// Komplette Entries für Generierung (nutzen Customizing Defaults)
const workEntry = factory.createDefaultEntry(userId, date, user);
const weekendEntry = factory.createWeekendEntry(userId, date);
const holidayEntry = factory.createHolidayEntry(userId, date, 'Neujahr');
```

## **HandlerFactory** - Handler Instance Creation

**Datei:** `srv/handler/factories/HandlerFactory.ts`

Erstellt Handler-Instanzen mit Dependencies aus dem ServiceContainer:

```typescript
class HandlerFactory {
  constructor(private container: ServiceContainer) {}

  createTimeEntryHandlers(): TimeEntryHandlers {
    return new TimeEntryHandlers(
      this.container.getCommand<CreateTimeEntryCommand>('createTimeEntry'),
      this.container.getCommand<UpdateTimeEntryCommand>('updateTimeEntry'),
    );
  }

  createAllHandlers() {
    return {
      timeEntry: this.createTimeEntryHandlers(),
      generation: this.createGenerationHandlers(),
      balance: this.createBalanceHandlers(),
    };
  }
}
```

**Features:**

- 🏭 Kapselt Handler-Instanziierung
- 🔗 Löst Dependencies aus Container auf
- 🧪 Perfekt für Unit Tests
