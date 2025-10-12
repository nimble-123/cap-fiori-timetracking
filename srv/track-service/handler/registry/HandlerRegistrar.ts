import { HandlerRegistry } from './HandlerRegistry';
import { TimeEntries } from '#cds-models/TrackService';
import { TimeEntryHandlers, GenerationHandlers, BalanceHandlers } from '../handlers';

/**
 * Registriert Handler bei der HandlerRegistry
 * Trennt Registrierungslogik von der Business-Logik
 */
export class HandlerRegistrar {
  constructor(private registry: HandlerRegistry) {}

  /**
   * Registriert TimeEntry CRUD Handler
   */
  registerTimeEntryHandlers(handlers: TimeEntryHandlers): void {
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
  registerGenerationHandlers(handlers: GenerationHandlers): void {
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

    // DefaultValues Function für generateYearlyTimeEntries
    this.registry.register({
      type: 'on',
      event: 'getDefaultParamsForGenerateYearly',
      handler: handlers.handleGetDefaultParams.bind(handlers),
      description: 'Returns default parameters for generateYearly action',
    });
  }

  /**
   * Registriert Balance Action Handler
   */
  registerBalanceHandlers(handlers: BalanceHandlers): void {
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

  /**
   * Registriert alle Handler auf einmal
   */
  registerAllHandlers(handlers: {
    timeEntry: TimeEntryHandlers;
    generation: GenerationHandlers;
    balance: BalanceHandlers;
  }): void {
    this.registerTimeEntryHandlers(handlers.timeEntry);
    this.registerGenerationHandlers(handlers.generation);
    this.registerBalanceHandlers(handlers.balance);
  }
}
