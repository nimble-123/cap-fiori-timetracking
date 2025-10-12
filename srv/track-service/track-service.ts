import { ApplicationService } from '@sap/cds';

import { ServiceContainer, HandlerRegistry, HandlerSetup } from '../handler';

/**
 * TrackService - Hauptorchestrierungsklasse
 *
 * Verantwortlich für:
 * - Dependency Injection via ServiceContainer
 * - Handler-Setup via Builder Pattern
 * - Service-Lifecycle Management
 */
export default class TrackService extends ApplicationService {
  private container!: ServiceContainer;
  private registry!: HandlerRegistry;

  async init(): Promise<void> {
    console.log('🚀 Initialisiere TrackService...\n');

    this.setupContainer();
    this.setupHandlers();

    await super.init();
    console.log('🎉 TrackService erfolgreich initialisiert!\n');
  }

  /**
   * Initialisiert den Dependency Container
   */
  private setupContainer(): void {
    this.container = new ServiceContainer();
    this.container.build(this.entities);
    console.log('✅ ServiceContainer initialisiert\n');
  }

  /**
   * Erstellt und registriert alle Handler mit Builder Pattern
   */
  private setupHandlers(): void {
    this.registry = new HandlerRegistry();

    HandlerSetup.create(this.container, this.registry).withAllHandlers().apply(this);
    console.log(`✅ Alle Handler registriert\n`);
  }
}
