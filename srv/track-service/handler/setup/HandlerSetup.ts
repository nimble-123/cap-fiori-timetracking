import { ApplicationService } from '@sap/cds';
import { ServiceContainer } from '../container/index.js';
import { HandlerRegistry, HandlerRegistrar } from '../registry/index.js';
import { HandlerFactory } from '../factories/index.js';
import { TimeEntryHandlers, GenerationHandlers, BalanceHandlers } from '../handlers/index.js';
import { logger } from '../utils/index.js';

/**
 * Builder für Handler-Setup mit Fluent API
 *
 * Nutzt intern HandlerFactory und HandlerRegistrar,
 * bietet aber eine einfachere, chainbare API
 *
 * @example
 * HandlerSetup
 *   .create(container, registry)
 *   .withTimeEntryHandlers()
 *   .withGenerationHandlers()
 *   .withBalanceHandlers()
 *   .apply(service);
 *
 * @example
 * // Alle Handler auf einmal
 * HandlerSetup
 *   .create(container, registry)
 *   .withAllHandlers()
 *   .apply(service);
 */
export class HandlerSetup {
  private factory: HandlerFactory;
  private registrar: HandlerRegistrar;
  private handlers: {
    timeEntry?: TimeEntryHandlers;
    generation?: GenerationHandlers;
    balance?: BalanceHandlers;
  } = {};

  private constructor(
    private container: ServiceContainer,
    private registry: HandlerRegistry,
  ) {
    this.factory = new HandlerFactory(container);
    this.registrar = new HandlerRegistrar(registry);
  }

  /**
   * Erstellt eine neue HandlerSetup-Instanz
   */
  static create(container: ServiceContainer, registry: HandlerRegistry): HandlerSetup {
    return new HandlerSetup(container, registry);
  }

  /**
   * Fügt TimeEntry Handler hinzu
   */
  withTimeEntryHandlers(): this {
    this.handlers.timeEntry = this.factory.createTimeEntryHandlers();
    this.registrar.registerTimeEntryHandlers(this.handlers.timeEntry);
    return this;
  }

  /**
   * Fügt Generation Handler hinzu
   */
  withGenerationHandlers(): this {
    this.handlers.generation = this.factory.createGenerationHandlers();
    this.registrar.registerGenerationHandlers(this.handlers.generation);
    return this;
  }

  /**
   * Fügt Balance Handler hinzu
   */
  withBalanceHandlers(): this {
    this.handlers.balance = this.factory.createBalanceHandlers();
    this.registrar.registerBalanceHandlers(this.handlers.balance);
    return this;
  }

  /**
   * Fügt alle Handler auf einmal hinzu
   */
  withAllHandlers(): this {
    return this.withTimeEntryHandlers().withGenerationHandlers().withBalanceHandlers();
  }

  /**
   * Wendet die Registry auf den Service an
   */
  apply(service: ApplicationService): void {
    const handlerCount = Object.keys(this.handlers).length;
    logger.serviceInit(`Applying ${handlerCount} handler group(s) to service`, {
      component: 'HandlerSetup',
    });

    this.registry.apply(service);

    logger.serviceReady('All handlers successfully applied', {
      component: 'HandlerSetup',
    });
  }

  /**
   * Gibt die erstellten Handler zurück (für Tests/Debugging)
   */
  getHandlers() {
    return { ...this.handlers };
  }
}
