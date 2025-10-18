import { ApplicationService } from '@sap/cds';

import { ServiceContainer, HandlerRegistry, HandlerSetup, logger } from './handler';
import { CustomizingService } from './handler/services/CustomizingService';
import { DateUtils } from './handler/utils';

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

    await this.setupContainer();
    this.setupHandlers();

    await super.init();
    logger.serviceReady('TrackService successfully initialized');
  }

  /**
   * Initialisiert den Dependency Container
   */
  private async setupContainer(): Promise<void> {
    this.container = new ServiceContainer();
    this.container.build(this.entities);
    logger.serviceRegistered('ServiceContainer', 'initialized');

    const customizingService = this.container.getService<CustomizingService>('customizing');
    await customizingService.initialize();

    const userDefaults = customizingService.getUserDefaults();
    DateUtils.configure({
      locale: customizingService.getLocale(),
      defaultWorkingDaysPerWeek: userDefaults.fallbackWorkingDays,
    });
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
