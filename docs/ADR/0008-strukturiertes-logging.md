# ADR 0008: Strukturiertes Logging mit kategorisierten Methoden

## Status
Akzeptiert - Logging-Refactoring (Iteration 4)

## Kontext und Problemstellung
In frühen Entwicklungsphasen nutzten Handler, Commands und Services inkonsistente Logging-Ansätze:
1. **Direkte `console.log`-Aufrufe**: Keine strukturierte Ausgabe, fehlende Log-Levels, keine Filterung.
2. **Inkonsistente `cds.log`-Nutzung**: Verschiedene Komponenten nutzten unterschiedliche Log-Kategorien (`track-service`, `handler`, `command`), was zentrale Konfiguration unmöglich machte.
3. **Fehlende Kontextinformationen**: Logs enthielten oft nur Messages ohne strukturierte Kontext-Objekte (z.B. `userId`, `command`, `error.stack`).
4. **Keine visuellen Unterscheidungen**: Alle Logs sahen gleich aus, was schnelle Identifikation von Command-, Validation- oder Repository-Logs erschwerte.
5. **Schwierige Debugging-Workflows**: Entwickler mussten manuell nach relevanten Log-Zeilen suchen, da keine Präfixe oder Kategorien existierten.

Wir benötigten ein zentrales Logging-System, das konsistente Formatierung, strukturierte Kontexte und kategorisierte Methoden bietet, um schnelle Fehlerbehebung und Observability zu ermöglichen.

## Entscheidungsfaktoren
- **Konsistenz**: Alle Komponenten (Handler, Commands, Repositories, Services) sollen die gleiche Logging-API nutzen.
- **Strukturierte Kontexte**: Logs sollen strukturierte Kontext-Objekte enthalten (z.B. `{ userId, command, error.stack }`), die in JSON-Format exportiert werden können.
- **Visuelle Unterscheidbarkeit**: Verschiedene Log-Kategorien (Command, Validation, Repository) sollen durch Präfixe und Farben unterscheidbar sein.
- **CAP-native Integration**: Das System soll `cds.log` unter der Haube nutzen, um CAP-Features wie Log-Level-Konfiguration und JSON-Export zu nutzen.
- **Performance**: Logging soll minimalen Overhead haben, besonders für Debug-Logs in Production (Lazy Evaluation).
- **Konfigurierbarkeit**: Log-Levels sollen über `package.json` oder Umgebungsvariablen konfigurierbar sein.

## Betrachtete Optionen

### Option A - `console.log` mit manuellen Präfixen
- Handler und Commands rufen `console.log('[COMMAND] CreateTimeEntry started')` auf.
- Vorteil: Einfach, keine zusätzliche Abstraktion.
- Nachteil: Keine strukturierten Kontexte, keine Log-Level-Filterung, keine JSON-Export-Option, inkonsistente Formatierung.

### Option B - Direkte `cds.log`-Nutzung mit manuellen Kategorien
- Jede Komponente nutzt `cds.log('track-service')` direkt.
- Vorteil: CAP-native, Log-Level-Konfiguration verfügbar.
- Nachteil: Inkonsistente Formatierung (jeder Entwickler formatiert anders), keine visuellen Präfixe, schwierige Filterung nach Kategorien.

### Option C - Zentraler Logger mit kategorisierten Methoden
- Eine `TrackLogger`-Klasse kapselt `cds.log('track-service')`.
- Kategorisierte Methoden für verschiedene Komponenten: `logger.commandStart()`, `logger.validationSuccess()`, `logger.repositoryQuery()`, `logger.serviceCall()`.
- Automatische Präfixe mit Emojis und ANSI-Farben (deaktiviert bei JSON-Export).
- Strukturierte Kontexte als zweiter Parameter.
- Singleton-Pattern für globalen Zugriff.
- Vorteil: Konsistente API, visuelle Unterscheidbarkeit, strukturierte Kontexte, CAP-Integration.
- Nachteil: Zusätzliche Abstraktionsschicht, höhere initiale Lernkurve.

## Entscheidung
Wir wählen **Option C** - einen zentralen Logger mit kategorisierten Methoden. Die Implementierung befindet sich unter `srv/track-service/handler/utils/logger.ts` und exportiert eine Singleton-Instanz `logger`.

### Logger-Struktur
Der `TrackLogger` bietet 10 Kategorien mit jeweils spezifischen Methoden:

#### 1. Service Lifecycle
- `logger.serviceInit(message, context?)` - Service-Initialisierung gestartet
- `logger.serviceReady(message, context?)` - Service erfolgreich initialisiert
- `logger.serviceRegistered(component, message, context?)` - Komponente registriert

#### 2. Command Execution
- `logger.commandStart(command, context?)` - Command-Ausführung gestartet
- `logger.commandEnd(command, context?)` - Command erfolgreich abgeschlossen
- `logger.commandInfo(command, message, context?)` - Command-spezifische Info
- `logger.commandData(command, message, context?)` - Command-Daten (Debug-Level)

#### 3. Handler Invocation
- `logger.handlerInvoked(handler, event, context?)` - Handler aufgerufen
- `logger.handlerCompleted(handler, event, context?)` - Handler abgeschlossen

#### 4. Validation
- `logger.validationSuccess(entity, message, context?)` - Validierung erfolgreich
- `logger.validationWarning(entity, message, context?)` - Validierungs-Warnung
- `logger.validationInfo(entity, message, context?)` - Validierungs-Info

#### 5. Repository Operations
- `logger.repositoryQuery(entity, message, context?)` - Query wird ausgeführt
- `logger.repositoryResult(entity, message, context?)` - Query-Ergebnis
- `logger.repositorySave(entity, count, context?)` - Save-Operation
- `logger.repositoryInfo(entity, message, context?)` - Repository-Info

#### 6. External Services
- `logger.serviceCall(service, message, context?)` - Externer Service-Call (z.B. HolidayService)
- `logger.serviceCacheHit(service, message, context?)` - Cache-Hit
- `logger.serviceCacheCleared(service, context?)` - Cache geleert
- `logger.serviceInfo(service, message, context?)` - Service-Info

#### 7. Strategy Execution
- `logger.strategyExecute(strategy, message, context?)` - Strategy ausgeführt
- `logger.strategySkip(strategy, message, context?)` - Element übersprungen
- `logger.strategyEvent(strategy, message, context?)` - Special Case
- `logger.strategyInfo(strategy, message, context?)` - Strategy-Info

#### 8. Factory
- `logger.factoryCreated(factory, instance, context?)` - Instanz erstellt

#### 9. Registry
- `logger.registryStart(message, context?)` - Handler-Registrierung gestartet
- `logger.registrySuccess(handler, event, context?)` - Handler registriert

#### 10. Generic/Utility
- `logger.info(message, context?)` / `logger.debug()` / `logger.warn()` / `logger.error(message, error?, context?)`
- `logger.userOperation(operation, message, context?)` - User-Operation
- `logger.calculationResult(type, message, context?)` - Berechnungsergebnis
- `logger.stats(category, message, context?)` - Statistiken/Metrics

### Visuelle Formatierung
Jede Methode fügt automatisch einen farbigen Präfix hinzu (z.B. `🚀 [COMMAND]`, `✅ [VALIDATION:TimeEntry]`, `📅 [REPO:TimeEntry]`). Farben werden via ANSI-Codes hinzugefügt und bei JSON-Export automatisch deaktiviert.

### Konfiguration
Log-Levels werden über `package.json` konfiguriert:
```json
{
  "cds": {
    "log": {
      "levels": {
        "track-service": "info"  // info | debug | warn | error
      }
    }
  }
}
```

Alternativ via Umgebungsvariablen:
```bash
# Development: Alle Logs (inkl. Debug)
DEBUG=track-service

# Production: Nur Warnings/Errors
CDS_LOG_LEVELS_TRACK_SERVICE=warn

# JSON-Format für Log-Aggregation (z.B. Elasticsearch)
CDS_LOG_FORMAT=json
```

## Konsequenzen

### Positiv
- **Konsistente Formatierung**: Alle Logs folgen dem gleichen Pattern (`Emoji [PREFIX] Message + Context`), was schnelle Identifikation ermöglicht.
- **Strukturierte Kontexte**: Alle relevanten Daten (z.B. `userId`, `command`, `error.stack`) werden als Objekte übergeben und können in JSON exportiert werden.
- **Visuelle Unterscheidbarkeit**: Emojis und Farben ermöglichen schnelles Scannen von Log-Outputs (z.B. `🚀 [COMMAND]` vs. `📅 [REPO]`).
- **CAP-Integration**: Nutzt `cds.log` unter der Haube, wodurch Log-Level-Konfiguration und JSON-Export funktionieren.
- **Performance**: Debug-Logs können via Log-Level deaktiviert werden, was in Production Performance spart.
- **Einfache Migration**: Bestehende `console.log`-Aufrufe können schrittweise durch `logger.*`-Methoden ersetzt werden.

### Negativ
- **Zusätzliche Abstraktion**: Entwickler müssen die richtigen Logger-Methoden kennen (z.B. `commandStart` statt `info`).
- **Höhere Lernkurve**: Neue Entwickler müssen die 10 Kategorien und ihre Methoden lernen.
- **Boilerplate**: Jeder Log-Aufruf erfordert Methoden-Call mit strukturiertem Context, was mehr Code bedeutet als `console.log`.

### Trade-offs
Wir akzeptieren die zusätzliche Abstraktion und Lernkurve zugunsten von Konsistenz, Observability und strukturierten Logs. Die `.github/copilot-instructions.md` dokumentiert alle Logger-Methoden für schnelle Referenz.

## Beispiel-Code

### Command Logging
```typescript
import { logger } from '../utils';

class CreateTimeEntryCommand {
  async execute(tx: Transaction, data: Partial<TimeEntry>) {
    logger.commandStart('CreateTimeEntry', { userId: data.user_ID, workDate: data.workDate });
    
    try {
      // Business-Logik
      const result = await this.process(tx, data);
      
      logger.commandEnd('CreateTimeEntry', { entryId: result.ID });
      return result;
    } catch (error: any) {
      logger.error('CreateTimeEntry failed', error, { userId: data.user_ID });
      throw error;
    }
  }
}
```

### Repository Logging
```typescript
import { logger } from '../utils';

export class TimeEntryRepository {
  async findById(tx: Transaction, id: string): Promise<TimeEntry | null> {
    logger.repositoryQuery('TimeEntry', `Finding by ID: ${id}`, { id });
    
    const entry = await tx.read(this.entries).where({ ID: id }).one();
    
    if (!entry) {
      logger.repositoryNotFound('TimeEntry', `Entry not found for ID: ${id}`, { id });
      return null;
    }
    
    logger.repositoryResult('TimeEntry', `Found entry`, { id, entryType: entry.entryType_code });
    return entry;
  }
}
```

### Service Logging
```typescript
import { logger } from '../utils';

export class HolidayService {
  async getHolidays(year: number, stateCode: string): Promise<Map<string, Holiday>> {
    if (this.cache.has(cacheKey)) {
      logger.serviceCacheHit('Holiday', `Holidays for ${year}/${stateCode}`, { year, stateCode });
      return this.cache.get(cacheKey)!;
    }
    
    logger.serviceCall('Holiday', `Fetching holidays from API for ${year}/${stateCode}`, { year, stateCode });
    // ... API-Call
    
    logger.serviceInfo('Holiday', `Loaded ${holidays.size} holidays`, { year, stateCode, count: holidays.size });
    return holidays;
  }
}
```

### Validation Logging
```typescript
import { logger } from '../utils';

export class TimeEntryValidator {
  async validate(tx: Transaction, data: Partial<TimeEntry>): Promise<void> {
    logger.validationInfo('TimeEntry', 'Starting validation', { userId: data.user_ID });
    
    if (!data.user_ID) {
      logger.validationWarning('TimeEntry', 'Missing user_ID', { data });
      throw new Error('User ID ist erforderlich');
    }
    
    logger.validationSuccess('TimeEntry', 'All fields valid', { userId: data.user_ID });
  }
}
```

## Log-Output Beispiel

### Development (mit Farben)
```
🚀 [INIT] Initializing TrackService...
✅ [INIT] ServiceContainer: initialized
📝 [REGISTRY] Registering handlers...
✅ [REGISTRY] TimeEntryHandlers.onCreate registered
🎉 [READY] TrackService successfully initialized
🚀 [COMMAND] CreateTimeEntry started { userId: 'user123', workDate: '2025-10-14' }
📅 [REPO:TimeEntry] Finding by ID: abc123 { id: 'abc123' }
✅ [VALIDATION:TimeEntry] All fields valid { userId: 'user123' }
✅ [COMMAND] CreateTimeEntry completed { entryId: 'abc123' }
```

### Production (JSON-Format)
```json
{"level":"info","time":"2025-10-14T10:00:00.000Z","category":"track-service","message":"[INIT] Initializing TrackService..."}
{"level":"info","time":"2025-10-14T10:00:01.000Z","category":"track-service","message":"[COMMAND] CreateTimeEntry started","context":{"userId":"user123","workDate":"2025-10-14"}}
{"level":"info","time":"2025-10-14T10:00:01.500Z","category":"track-service","message":"[COMMAND] CreateTimeEntry completed","context":{"entryId":"abc123"}}
```

## Verweise
- `srv/track-service/handler/utils/logger.ts` - Logger-Implementierung mit allen Methoden
- `srv/track-service/handler/commands/time-entry/CreateTimeEntryCommand.ts` - Beispiel für Command-Logging
- `srv/track-service/handler/repositories/TimeEntryRepository.ts` - Beispiel für Repository-Logging
- `srv/track-service/handler/services/HolidayService.ts` - Beispiel für Service-Logging
- `package.json` - Log-Level-Konfiguration unter `cds.log.levels`
- `.github/copilot-instructions.md` - Logger-Konventionen im AI-Development-Guide

## Hinweise für Entwickler
- **Welche Methode nutzen?** Orientiere dich an der Komponenten-Kategorie: Commands → `commandStart/End`, Repositories → `repositoryQuery/Result`, Services → `serviceCall/Info`.
- **Strukturierte Kontexte**: Übergebe immer relevante Daten als Objekt (z.B. `{ userId, workDate, entryId }`).
- **Error-Logging**: Nutze `logger.error(message, error, context)` statt `logger.info()`, um Error-Stack zu erfassen.
- **Debug-Logs**: Nutze Debug-Methoden (z.B. `commandData`, `repositoryQuery`) für detaillierte Logs, die in Production deaktiviert werden können.
- **Migration von `console.log`**: Ersetze `console.log('[COMMAND] ...')` durch `logger.commandInfo('CommandName', '...')`.
