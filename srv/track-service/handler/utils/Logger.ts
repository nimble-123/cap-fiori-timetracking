import cds from '@sap/cds';

/**
 * Kontext-Objekt für strukturierte Logs
 */
interface LogContext {
  [key: string]: any;
}

/**
 * ANSI Color Codes für Terminal-Ausgaben
 */
const Colors = {
  // Text Colors
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Foreground Colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Bright Foreground Colors
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
} as const;

/**
 * Helper für farbige Log-Prefixes
 */
const colorize = (text: string, color: string): string => {
  // Nur colorieren wenn nicht im JSON-Format
  if (process.env.CDS_LOG_FORMAT === 'json') {
    return text;
  }
  return `${color}${text}${Colors.reset}`;
};

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
    this.log.info(`🚀 ${colorize('[INIT]', Colors.brightBlue)} ${message}`, context);
  }

  /**
   * Service erfolgreich initialisiert
   */
  serviceReady(message: string, context?: LogContext): void {
    this.log.info(`🎉 ${colorize('[READY]', Colors.brightGreen)} ${message}`, context);
  }

  /**
   * Service-Komponente registriert
   */
  serviceRegistered(component: string, message: string, context?: LogContext): void {
    this.log.info(`✅ ${colorize('[INIT]', Colors.brightBlue)} ${component}: ${message}`, context);
  }

  // ============================================================================
  // COMMAND EXECUTION
  // ============================================================================

  /**
   * Command-Ausführung gestartet
   */
  commandStart(command: string, context?: LogContext): void {
    this.log.info(`🚀 ${colorize('[COMMAND]', Colors.cyan)} ${command} started`, context);
  }

  /**
   * Command erfolgreich abgeschlossen
   */
  commandEnd(command: string, context?: LogContext): void {
    this.log.info(`✅ ${colorize('[COMMAND]', Colors.cyan)} ${command} completed`, context);
  }

  /**
   * Command-spezifische Daten (Debug-Level)
   */
  commandData(command: string, message: string, context?: LogContext): void {
    this.log.debug(`📊 ${colorize(`[COMMAND:${command}]`, Colors.cyan)} ${message}`, context);
  }

  /**
   * Command-spezifische Info
   */
  commandInfo(command: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  ${colorize(`[COMMAND:${command}]`, Colors.cyan)} ${message}`, context);
  }

  // ============================================================================
  // HANDLER INVOCATION
  // ============================================================================

  /**
   * Handler wurde aufgerufen
   */
  handlerInvoked(handler: string, event: string, context?: LogContext): void {
    this.log.info(`🚀 ${colorize('[HANDLER]', Colors.magenta)} ${handler}.${event} invoked`, context);
  }

  /**
   * Handler erfolgreich abgeschlossen
   */
  handlerCompleted(handler: string, event: string, context?: LogContext): void {
    this.log.debug(`✅ ${colorize('[HANDLER]', Colors.magenta)} ${handler}.${event} completed`, context);
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Validierung erfolgreich
   */
  validationSuccess(entity: string, message: string, context?: LogContext): void {
    this.log.debug(`✅ ${colorize(`[VALIDATION:${entity}]`, Colors.green)} ${message}`, context);
  }

  /**
   * Validierungs-Warnung
   */
  validationWarning(entity: string, message: string, context?: LogContext): void {
    this.log.warn(`⚠️  ${colorize(`[VALIDATION:${entity}]`, Colors.yellow)} ${message}`, context);
  }

  /**
   * Validierungs-Info
   */
  validationInfo(entity: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  ${colorize(`[VALIDATION:${entity}]`, Colors.blue)} ${message}`, context);
  }

  // ============================================================================
  // REPOSITORY OPERATIONS
  // ============================================================================

  /**
   * Repository-Query wird ausgeführt
   */
  repositoryQuery(entity: string, message: string, context?: LogContext): void {
    this.log.debug(`📅 ${colorize(`[REPO:${entity}]`, Colors.brightCyan)} ${message}`, context);
  }

  /**
   * Repository-Query-Ergebnis
   */
  repositoryResult(entity: string, message: string, context?: LogContext): void {
    this.log.debug(`📝 ${colorize(`[REPO:${entity}]`, Colors.brightCyan)} ${message}`, context);
  }

  /**
   * Repository Save-Operation
   */
  repositorySave(entity: string, count: number, context?: LogContext): void {
    this.log.info(`💾 ${colorize(`[REPO:${entity}]`, Colors.brightCyan)} Saved ${count} record(s)`, context);
  }

  /**
   * Repository Info
   */
  repositoryInfo(entity: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  ${colorize(`[REPO:${entity}]`, Colors.brightCyan)} ${message}`, context);
  }

  // ============================================================================
  // EXTERNAL SERVICES
  // ============================================================================

  /**
   * Externer Service-Call
   */
  serviceCall(service: string, message: string, context?: LogContext): void {
    this.log.debug(`🔍 ${colorize(`[SERVICE:${service}]`, Colors.brightMagenta)} ${message}`, context);
  }

  /**
   * Service-Cache-Hit
   */
  serviceCacheHit(service: string, message: string, context?: LogContext): void {
    this.log.debug(`✅ ${colorize(`[SERVICE:${service}]`, Colors.brightMagenta)} Cache hit: ${message}`, context);
  }

  /**
   * Service-Cache geleert
   */
  serviceCacheCleared(service: string, context?: LogContext): void {
    this.log.info(`🗑️  ${colorize(`[SERVICE:${service}]`, Colors.brightMagenta)} Cache cleared`, context);
  }

  /**
   * Service-Operation Info
   */
  serviceInfo(service: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  ${colorize(`[SERVICE:${service}]`, Colors.brightMagenta)} ${message}`, context);
  }

  // ============================================================================
  // STRATEGY EXECUTION
  // ============================================================================

  /**
   * Strategy wird ausgeführt
   */
  strategyExecute(strategy: string, message: string, context?: LogContext): void {
    this.log.debug(`📅 ${colorize(`[STRATEGY:${strategy}]`, Colors.brightYellow)} ${message}`, context);
  }

  /**
   * Strategy überspringt Element
   */
  strategySkip(strategy: string, message: string, context?: LogContext): void {
    this.log.debug(`⏭️  ${colorize(`[STRATEGY:${strategy}]`, Colors.brightYellow)} Skipped: ${message}`, context);
  }

  /**
   * Strategy Event/Special Case
   */
  strategyEvent(strategy: string, message: string, context?: LogContext): void {
    this.log.debug(`🎉 ${colorize(`[STRATEGY:${strategy}]`, Colors.brightYellow)} ${message}`, context);
  }

  /**
   * Strategy Info
   */
  strategyInfo(strategy: string, message: string, context?: LogContext): void {
    this.log.info(`ℹ️  ${colorize(`[STRATEGY:${strategy}]`, Colors.brightYellow)} ${message}`, context);
  }

  // ============================================================================
  // FACTORY
  // ============================================================================

  /**
   * Factory hat Instanz erstellt
   */
  factoryCreated(factory: string, instance: string, context?: LogContext): void {
    this.log.debug(`🏭 ${colorize(`[FACTORY:${factory}]`, Colors.brightBlue)} Created ${instance}`, context);
  }

  // ============================================================================
  // REGISTRY
  // ============================================================================

  /**
   * Handler-Registrierung gestartet
   */
  registryStart(message: string, context?: LogContext): void {
    this.log.info(`📝 ${colorize('[REGISTRY]', Colors.brightMagenta)} ${message}`, context);
  }

  /**
   * Handler erfolgreich registriert
   */
  registrySuccess(handler: string, event: string, context?: LogContext): void {
    this.log.info(`✅ ${colorize('[REGISTRY]', Colors.brightMagenta)} ${handler}.${event} registered`, context);
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

    this.log.error(`❌ ${colorize('[ERROR]', Colors.brightRed)} ${message}`, errorContext);
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  /**
   * User-Operation Info
   */
  userOperation(operation: string, message: string, context?: LogContext): void {
    this.log.debug(`👤 ${colorize('[USER]', Colors.blue)} ${operation}: ${message}`, context);
  }

  /**
   * Calculation Result
   */
  calculationResult(type: string, message: string, context?: LogContext): void {
    this.log.debug(`🧮 ${colorize(`[CALC:${type}]`, Colors.yellow)} ${message}`, context);
  }

  /**
   * Stats/Metrics
   */
  stats(category: string, message: string, context?: LogContext): void {
    this.log.info(`📈 ${colorize(`[STATS:${category}]`, Colors.green)} ${message}`, context);
  }
}

/**
 * Singleton-Instanz des Loggers
 * Verwendung: import { logger } from './utils';
 */
export const logger = TrackLogger.getInstance();
