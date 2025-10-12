import { ApplicationService } from '@sap/cds';
import { TimeEntries } from '#cds-models/TrackService';

import {
  // Infrastructure
  ServiceContainer,
  HandlerRegistry,
  // Handlers
  TimeEntryHandlers,
  GenerationHandlers,
  BalanceHandlers,
  // Commands (Types)
  type CreateTimeEntryCommand,
  type UpdateTimeEntryCommand,
  type GenerateMonthlyCommand,
  type GenerateYearlyCommand,
  type GetMonthlyBalanceCommand,
  type GetCurrentBalanceCommand,
  type GetRecentBalancesCommand,
} from '../handler';

/**
 * TrackService - Hauptorchestrierungsklasse
 *
 * Verantwortlich für:
 * - Dependency Injection via ServiceContainer
 * - Handler-Registrierung via HandlerRegistry
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
   * Erstellt und registriert alle Handler
   */
  private setupHandlers(): void {
    this.registry = new HandlerRegistry();

    // Handler erstellen
    const timeEntryHandlers = this.createTimeEntryHandlers();
    const generationHandlers = this.createGenerationHandlers();
    const balanceHandlers = this.createBalanceHandlers();

    // Handler registrieren
    this.registerTimeEntryHandlers(timeEntryHandlers);
    this.registerGenerationHandlers(generationHandlers);
    this.registerBalanceHandlers(balanceHandlers);

    // Registry auf Service anwenden
    this.registry.apply(this);
  }

  /**
   * Erstellt TimeEntry Handler mit Dependencies aus Container
   */
  private createTimeEntryHandlers(): TimeEntryHandlers {
    return new TimeEntryHandlers(
      this.container.getCommand<CreateTimeEntryCommand>('createTimeEntry'),
      this.container.getCommand<UpdateTimeEntryCommand>('updateTimeEntry'),
    );
  }

  /**
   * Erstellt Generation Handler mit Dependencies aus Container
   */
  private createGenerationHandlers(): GenerationHandlers {
    return new GenerationHandlers(
      this.container.getCommand<GenerateMonthlyCommand>('generateMonthly'),
      this.container.getCommand<GenerateYearlyCommand>('generateYearly'),
    );
  }

  /**
   * Erstellt Balance Handler mit Dependencies aus Container
   */
  private createBalanceHandlers(): BalanceHandlers {
    return new BalanceHandlers(
      this.container.getCommand<GetMonthlyBalanceCommand>('getMonthlyBalance'),
      this.container.getCommand<GetCurrentBalanceCommand>('getCurrentBalance'),
      this.container.getCommand<GetRecentBalancesCommand>('getRecentBalances'),
    );
  }

  /**
   * Registriert TimeEntry CRUD Handler
   */
  private registerTimeEntryHandlers(handlers: TimeEntryHandlers): void {
    this.registry.register({
      type: 'before',
      event: 'CREATE',
      entity: TimeEntries,
      handler: handlers.handleCreate.bind(handlers),
      description: 'Validate and enrich time entry before creation',
    });

    this.registry.register({
      type: 'before',
      event: 'UPDATE',
      entity: TimeEntries,
      handler: handlers.handleUpdate.bind(handlers),
      description: 'Validate and recalculate time entry before update',
    });

    this.registry.register({
      type: 'before',
      event: 'DELETE',
      entity: TimeEntries,
      handler: handlers.handleDelete.bind(handlers),
      description: 'Prevent deletion of time entries',
    });
  }

  /**
   * Registriert Generation Action Handler
   */
  private registerGenerationHandlers(handlers: GenerationHandlers): void {
    this.registry.register({
      type: 'on',
      event: 'generateMonthlyTimeEntries',
      handler: handlers.handleGenerateMonthly.bind(handlers),
      description: 'Generate monthly time entries for current user',
    });

    this.registry.register({
      type: 'on',
      event: 'generateYearlyTimeEntries',
      handler: handlers.handleGenerateYearly.bind(handlers),
      description: 'Generate yearly time entries with holidays',
    });
  }

  /**
   * Registriert Balance Action Handler
   */
  private registerBalanceHandlers(handlers: BalanceHandlers): void {
    this.registry.register({
      type: 'on',
      event: 'getMonthlyBalance',
      handler: handlers.handleGetMonthlyBalance.bind(handlers),
      description: 'Calculate monthly time balance',
    });

    this.registry.register({
      type: 'on',
      event: 'getCurrentBalance',
      handler: handlers.handleGetCurrentBalance.bind(handlers),
      description: 'Get current time balance',
    });

    this.registry.register({
      type: 'on',
      event: 'READ',
      entity: 'MonthlyBalances',
      handler: handlers.handleReadMonthlyBalances.bind(handlers),
      description: 'Read recent monthly balances (last 6 months)',
    });
  }
}
