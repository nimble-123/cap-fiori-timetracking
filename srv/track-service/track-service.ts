import { ApplicationService } from '@sap/cds';

import { ServiceContainer, HandlerRegistry, HandlerSetup, logger } from './handler';

/**
 * TrackService - Hauptorchestrierungsklasse
 *
 * Verantwortlich für:
 * - Dependency Injection via ServiceContainer
 * - Handler-Setup via Builder Pattern
 * - Service-Lifecycle Management
 */
export class TrackService extends ApplicationService {
  private container!: ServiceContainer;
  private registry!: HandlerRegistry;

  async init(): Promise<void> {
    logger.serviceInit('Initializing TrackService...');

    this.setupContainer();
    this.setupHandlers();

    await super.init();
    logger.serviceReady('TrackService successfully initialized');
  }

  /**
   * Initialisiert den Dependency Container
   */
  private setupContainer(): void {
    this.container = new ServiceContainer();
    this.container.build(this.entities);
    logger.serviceRegistered('ServiceContainer', 'initialized');
  }

  /**
   * Erstellt und registriert alle Handler mit Builder Pattern
   */
  private setupHandlers(): void {
    this.registry = new HandlerRegistry();

    HandlerSetup.create(this.container, this.registry).withAllHandlers().apply(this);
    logger.serviceRegistered('HandlerRegistry', 'all handlers registered');
  }
}
