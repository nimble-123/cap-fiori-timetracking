# 📋 HandlerRegistry Pattern

**Datei:** `srv/handler/registry/HandlerRegistry.ts`

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

# 📋 Registrar Pattern

**Datei:** `srv/handler/registry/HandlerRegistrar.ts`

Trennt Registrierungslogik von der Business-Logik:

```typescript
class HandlerRegistrar {
  constructor(private registry: HandlerRegistry) {}

  registerTimeEntryHandlers(handlers: TimeEntryHandlers): void {
    this.registry.register({
      type: 'before',
      event: 'CREATE',
      entity: TimeEntries,
      handler: handlers.handleCreate.bind(handlers),
      description: 'Validate and enrich time entry before creation',
    });
    // ... weitere Registrierungen
  }

  registerAllHandlers(handlers: { ... }): void {
    this.registerTimeEntryHandlers(handlers.timeEntry);
    this.registerGenerationHandlers(handlers.generation);
    this.registerBalanceHandlers(handlers.balance);
  }
}
```

**Features:**

- 📋 Strukturierte Registrierung
- 🎯 Separation of Concerns
- 🔄 Wiederverwendbar
