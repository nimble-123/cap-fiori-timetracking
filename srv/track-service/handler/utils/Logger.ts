import cds from '@sap/cds';

/**
 * Kontext-Objekt für strukturierte Logs
 */
interface LogContext {
  [key: string]: any;
}

/**
 * Zentraler Logger für TrackService
 *
 * Wrapper um cds.log mit konsistenter Formatierung und Type-Safe API.
 * Verwendet kategoriebasierte Logging-Methoden für einheitliche Log-Messages.
 *
 * Features:
 * - Konsistente Formatierung mit Prefixes
 * - Strukturierte Log-Kontexte
 * - CAP-native Integration
 * - Konfigurierbare Log-Levels via package.json oder Umgebungsvariablen
 *
 * @example
 * ```typescript
 * import { logger } from './utils';
 *
 * logger.commandStart('CreateTimeEntry', { userId: 'user123' });
 * logger.validationSuccess('TimeEntry', 'All fields valid');
 * logger.error('Command failed', error, { command: 'CreateTimeEntry' });
 * ```
 *
 * Konfiguration:
 * ```json
 * // package.json
 * {
 *   "cds": {
 *     "log": {
 *       "levels": {
 *         "track-service": "info"  // info | debug | warn | error
 *       }
 *     }
 *   }
 * }
 * ```
 *
 * Umgebungsvariablen:
 * ```bash
 * # Development: Alle Logs
 * DEBUG=track-service
 *
 * # Production: Nur Warnings/Errors
 * CDS_LOG_LEVELS_TRACK_SERVICE=warn
 *
 * # JSON Format für Log-Aggregation
 * CDS_LOG_FORMAT=json
 * ```
 */
export class TrackLogger {
  private static instance: TrackLogger;
  private log: ReturnType<typeof cds.log>;

  private constructor() {
    this.log = cds.log('track-service');
  }

  /**
   * Singleton-Pattern: Gibt die Logger-Instanz zurück
   */
  static getInstance(): TrackLogger {
    if (!TrackLogger.instance) {
      TrackLogger.instance = new TrackLogger();
    }
    return TrackLogger.instance;
  }

  // ============================================================================
  // SERVICE LIFECYCLE
  // ============================================================================

  /**
   * Service-Initialisierung gestartet
   */
  serviceInit(message: string, context?: LogContext): void {
    this.log.info(`🚀 [INIT] ${message}`, context);
  }

  /**
   * Service erfolgreich initialisiert
   */
  serviceReady(message: string, context?: LogContext): void {
    this.log.info(`🎉 [READY] ${message}`, context);
  }

  /**
   * Service-Komponente registriert
   */
  serviceRegistered(component: string, message: string, context?: LogContext): void {
    this.log.info(`✅ [INIT] ${component}: ${message}`, context);
  }

  // ============================================================================
  // COMMAND EXECUTION
  // ============================================================================

  /**
   * Command-Ausführung gestartet
   */
  commandStart(command: string, context?: LogContext): void {
    this.log.info(`🚀 [COMMAND] ${command} started`, context);
  }

  /**
   * Command erfolgreich abgeschlossen
   */
  commandEnd(command: string, context?: LogContext): void {
    this.log.info(`✅ [COMMAND] ${command} completed`, context);
  }

  /**
   * Command-spezifische Daten (Debug-Level)
   */
  commandData(command: string, message: string, context?: LogContext): void {
    this.log.debug(`📊 [COMMAND:${command}] ${message}`, context);
  }

  /**
   * Command-spezifische Info
   */
  commandInfo(command: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  [COMMAND:${command}] ${message}`, context);
  }

  // ============================================================================
  // HANDLER INVOCATION
  // ============================================================================

  /**
   * Handler wurde aufgerufen
   */
  handlerInvoked(handler: string, event: string, context?: LogContext): void {
    this.log.info(`🚀 [HANDLER] ${handler}.${event} invoked`, context);
  }

  /**
   * Handler erfolgreich abgeschlossen
   */
  handlerCompleted(handler: string, event: string, context?: LogContext): void {
    this.log.debug(`✅ [HANDLER] ${handler}.${event} completed`, context);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validierung erfolgreich
   */
  validationSuccess(entity: string, message: string, context?: LogContext): void {
    this.log.debug(`✅ [VALIDATION:${entity}] ${message}`, context);
  }

  /**
   * Validierungs-Warnung
   */
  validationWarning(entity: string, message: string, context?: LogContext): void {
    this.log.warn(`⚠️  [VALIDATION:${entity}] ${message}`, context);
  }

  /**
   * Validierungs-Info
   */
  validationInfo(entity: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  [VALIDATION:${entity}] ${message}`, context);
  }

  // ============================================================================
  // REPOSITORY OPERATIONS
  // ============================================================================

  /**
   * Repository-Query wird ausgeführt
   */
  repositoryQuery(entity: string, message: string, context?: LogContext): void {
    this.log.debug(`📅 [REPO:${entity}] ${message}`, context);
  }

  /**
   * Repository-Query-Ergebnis
   */
  repositoryResult(entity: string, message: string, context?: LogContext): void {
    this.log.debug(`📝 [REPO:${entity}] ${message}`, context);
  }

  /**
   * Repository Save-Operation
   */
  repositorySave(entity: string, count: number, context?: LogContext): void {
    this.log.info(`💾 [REPO:${entity}] Saved ${count} record(s)`, context);
  }

  /**
   * Repository Info
   */
  repositoryInfo(entity: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  [REPO:${entity}] ${message}`, context);
  }

  // ============================================================================
  // EXTERNAL SERVICES
  // ============================================================================

  /**
   * Externer Service-Call
   */
  serviceCall(service: string, message: string, context?: LogContext): void {
    this.log.debug(`🔍 [SERVICE:${service}] ${message}`, context);
  }

  /**
   * Service-Cache-Hit
   */
  serviceCacheHit(service: string, message: string, context?: LogContext): void {
    this.log.debug(`✅ [SERVICE:${service}] Cache hit: ${message}`, context);
  }

  /**
   * Service-Cache geleert
   */
  serviceCacheCleared(service: string, context?: LogContext): void {
    this.log.info(`🗑️  [SERVICE:${service}] Cache cleared`, context);
  }

  /**
   * Service-Operation Info
   */
  serviceInfo(service: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  [SERVICE:${service}] ${message}`, context);
  }

  // ============================================================================
  // STRATEGY EXECUTION
  // ============================================================================

  /**
   * Strategy wird ausgeführt
   */
  strategyExecute(strategy: string, message: string, context?: LogContext): void {
    this.log.debug(`📅 [STRATEGY:${strategy}] ${message}`, context);
  }

  /**
   * Strategy überspringt Element
   */
  strategySkip(strategy: string, message: string, context?: LogContext): void {
    this.log.debug(`⏭️  [STRATEGY:${strategy}] Skipped: ${message}`, context);
  }

  /**
   * Strategy Event/Special Case
   */
  strategyEvent(strategy: string, message: string, context?: LogContext): void {
    this.log.debug(`🎉 [STRATEGY:${strategy}] ${message}`, context);
  }

  /**
   * Strategy Info
   */
  strategyInfo(strategy: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  [STRATEGY:${strategy}] ${message}`, context);
  }

  // ============================================================================
  // FACTORY
  // ============================================================================

  /**
   * Factory hat Instanz erstellt
   */
  factoryCreated(factory: string, instance: string, context?: LogContext): void {
    this.log.debug(`🏭 [FACTORY:${factory}] Created ${instance}`, context);
  }

  // ============================================================================
  // REGISTRY
  // ============================================================================

  /**
   * Handler-Registrierung gestartet
   */
  registryStart(message: string, context?: LogContext): void {
    this.log.info(`📝 [REGISTRY] ${message}`, context);
  }

  /**
   * Handler erfolgreich registriert
   */
  registrySuccess(handler: string, event: string, context?: LogContext): void {
    this.log.info(`✓ [REGISTRY] ${handler}.${event} registered`, context);
  }

  // ============================================================================
  // GENERIC LOG LEVELS
  // ============================================================================

  /**
   * Info-Level Log
   */
  info(message: string, context?: LogContext): void {
    this.log.info(message, context);
  }

  /**
   * Debug-Level Log
   */
  debug(message: string, context?: LogContext): void {
    this.log.debug(message, context);
  }

  /**
   * Warning-Level Log
   */
  warn(message: string, context?: LogContext): void {
    this.log.warn(message, context);
  }

  /**
   * Error-Level Log mit strukturiertem Error-Objekt
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    const errorContext = {
      ...(error && {
        error: error.message || String(error),
        code: error.code,
        stack: error.stack,
      }),
      ...context,
    };

    this.log.error(`❌ ${message}`, errorContext);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  /**
   * User-Operation Info
   */
  userOperation(operation: string, message: string, context?: LogContext): void {
    this.log.debug(`👤 [USER] ${operation}: ${message}`, context);
  }

  /**
   * Calculation Result
   */
  calculationResult(type: string, message: string, context?: LogContext): void {
    this.log.debug(`🧮 [CALC:${type}] ${message}`, context);
  }

  /**
   * Stats/Metrics
   */
  stats(category: string, message: string, context?: LogContext): void {
    this.log.info(`📈 [STATS:${category}] ${message}`, context);
  }
}

/**
 * Singleton-Instanz des Loggers
 * Verwendung: import { logger } from './utils';
 */
export const logger = TrackLogger.getInstance();
