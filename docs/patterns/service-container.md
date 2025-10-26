# 🏗️ ServiceContainer Pattern (Dependency Injection)

**Datei:** `srv/handler/container/ServiceContainer.ts`

Der **ServiceContainer** ist unser DI-Container. Er verwaltet **alle** Dependencies zentral:

```typescript
// Beim Service-Start
const container = new ServiceContainer();
container.build(entities); // Auto-Wiring!

// Type-safe Resolution
const userService = container.getService<UserService>('user');
const createCommand = container.getCommand<CreateTimeEntryCommand>('createTimeEntry');
```

**Features:**

- 🎯 6 Kategorien: Repositories (6), Services (5), Validators (7), Strategies (2), Commands (10), Factories (2)
- 🔗 Auto-Wiring von Dependencies
- 🛡️ Type-Safe mit Generics
- 🧪 Perfekt für Unit Tests
