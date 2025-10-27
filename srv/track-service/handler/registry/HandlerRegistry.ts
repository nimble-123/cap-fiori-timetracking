import { ApplicationService } from '@sap/cds';
import { logger } from '../utils';

/**
 * Handler-Konfiguration für Event-Registrierung
 */
export interface HandlerConfig {
  /** Typ des Handlers: 'before', 'on', 'after' */
  type: 'before' | 'on' | 'after';

  /** Event-Name (z.B. 'CREATE', 'UPDATE', 'READ', 'generateMonthlyTimeEntries') */
  event: string;

  /** Optional: Entity für CRUD-Operationen (z.B. TimeEntries) */
  entity?: any;

  /** Handler-Funktion */
  handler: Function;

  /** Optional: Beschreibung für Debugging */
  description?: string;
}

/**
 * Handler Registry für strukturierte Event-Handler-Registrierung
 *
 * Verwaltet alle before/on/after Handler zentral und ermöglicht
 * eine saubere Trennung von Handler-Definition und -Registrierung.
 *
 * @example
 * ```typescript
 * const registry = new HandlerRegistry();
 *
 * registry.register({
 *   type: 'before',
 *   event: 'CREATE',
 *   entity: TimeEntries,
 *   handler: this.handleCreate.bind(this),
 *   description: 'Validate and enrich time entry before creation'
 * });
 *
 * registry.apply(this);
 * ```
 */
export class HandlerRegistry {
  private handlers: HandlerConfig[] = [];

  /**
   * Registriert einen neuen Handler
   * @param config - Handler-Konfiguration
   */
  register(config: HandlerConfig): HandlerRegistry {
    this.handlers.push(config);
    return this; // Fluent API für method chaining
  }

  /**
   * Registriert mehrere Handler auf einmal
   * @param configs - Array von Handler-Konfigurationen
   */
  registerMany(configs: HandlerConfig[]): HandlerRegistry {
    this.handlers.push(...configs);
    return this;
  }

  /**
   * Wendet alle registrierten Handler auf den Service an
   * @param service - CAP ApplicationService Instanz
   */
  apply(service: ApplicationService): void {
    logger.registryStart(`Registering ${this.handlers.length} event handlers`, { count: this.handlers.length });

    this.handlers.forEach((config, index) => {
      try {
        this.applyHandler(service, config);

        if (config.description) {
          logger.registrySuccess(`${config.type}:${config.event}`, config.description, {
            index: index + 1,
            entity: config.entity,
          });
        }
      } catch (error) {
        logger.error(`Handler registration failed [${index + 1}]`, error, { config });
        throw error;
      }
    });
  }

  /**
   * Wendet einen einzelnen Handler an
   */
  private applyHandler(service: ApplicationService, config: HandlerConfig): void {
    const { type, event, entity, handler } = config;

    switch (type) {
      case 'before':
        if (entity) {
          service.before(event, entity, handler as any);
        } else {
          service.before(event, handler as any);
        }
        break;

      case 'on':
        if (entity) {
          service.on(event, entity, handler as any);
        } else {
          service.on(event, handler as any);
        }
        break;

      case 'after':
        if (entity) {
          service.after(event, entity, handler as any);
        } else {
          service.after(event, handler as any);
        }
        break;

      default:
        throw new Error(`Unknown handler type: ${type}`);
    }
  }

  /**
   * Gibt eine Übersicht aller registrierten Handler zurück
   */
  getRegisteredHandlers(): Array<{ type: string; event: string; entity: string; description?: string }> {
    return this.handlers.map((h) => ({
      type: h.type,
      event: h.event,
      entity: h.entity ? h.entity.name || String(h.entity) : 'N/A',
      description: h.description,
    }));
  }

  /**
   * Löscht alle registrierten Handler (für Testing)
   */
  clear(): void {
    this.handlers = [];
  }

  /**
   * Gibt die Anzahl registrierter Handler zurück
   */
  get count(): number {
    return this.handlers.length;
  }
}
