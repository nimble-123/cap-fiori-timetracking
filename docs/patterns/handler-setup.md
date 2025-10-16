# 🏗️ Builder Pattern (Fluent API)

**Datei:** `srv/handler/setup/HandlerSetup.ts`

Builder mit Fluent API für elegantes Handler-Setup:

```typescript
class HandlerSetup {
  static create(container: ServiceContainer, registry: HandlerRegistry): HandlerSetup {
    return new HandlerSetup(container, registry);
  }

  withTimeEntryHandlers(): this {
    this.handlers.timeEntry = this.factory.createTimeEntryHandlers();
    this.registrar.registerTimeEntryHandlers(this.handlers.timeEntry);
    return this;
  }

  withAllHandlers(): this {
    return this.withTimeEntryHandlers().withGenerationHandlers().withBalanceHandlers();
  }

  apply(service: ApplicationService): void {
    this.registry.apply(service);
  }
}
```

**Usage in TrackService:**

```typescript
private setupHandlers(): void {
  this.registry = new HandlerRegistry();

  HandlerSetup
    .create(this.container, this.registry)
    .withAllHandlers()
    .apply(this);
}
```

**Features:**

- ⛓️ Chainable API
- 🎨 Sehr elegant und lesbar
- 🔧 Flexibel - kann selektiv Handler hinzufügen
- 🧩 Kombiniert Factory + Registrar
