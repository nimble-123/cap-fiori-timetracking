import { ServiceContainer } from '../container/ServiceContainer';
import { TimeEntryHandlers, GenerationHandlers, BalanceHandlers } from '../handlers';
import type {
  CreateTimeEntryCommand,
  UpdateTimeEntryCommand,
  GenerateMonthlyCommand,
  GenerateYearlyCommand,
  GetMonthlyBalanceCommand,
  GetCurrentBalanceCommand,
  GetRecentBalancesCommand,
} from '../commands';

/**
 * Factory für Handler-Instanzen
 * Kapselt die Handler-Erstellung mit Dependencies aus dem Container
 */
export class HandlerFactory {
  constructor(private container: ServiceContainer) {}

  /**
   * Erstellt TimeEntry Handler mit Dependencies aus Container
   */
  createTimeEntryHandlers(): TimeEntryHandlers {
    return new TimeEntryHandlers(
      this.container.getCommand<CreateTimeEntryCommand>('createTimeEntry'),
      this.container.getCommand<UpdateTimeEntryCommand>('updateTimeEntry'),
    );
  }

  /**
   * Erstellt Generation Handler mit Dependencies aus Container
   */
  createGenerationHandlers(): GenerationHandlers {
    return new GenerationHandlers(
      this.container.getCommand<GenerateMonthlyCommand>('generateMonthly'),
      this.container.getCommand<GenerateYearlyCommand>('generateYearly'),
    );
  }

  /**
   * Erstellt Balance Handler mit Dependencies aus Container
   */
  createBalanceHandlers(): BalanceHandlers {
    return new BalanceHandlers(
      this.container.getCommand<GetMonthlyBalanceCommand>('getMonthlyBalance'),
      this.container.getCommand<GetCurrentBalanceCommand>('getCurrentBalance'),
      this.container.getCommand<GetRecentBalancesCommand>('getRecentBalances'),
    );
  }

  /**
   * Erstellt alle Handler auf einmal
   */
  createAllHandlers() {
    return {
      timeEntry: this.createTimeEntryHandlers(),
      generation: this.createGenerationHandlers(),
      balance: this.createBalanceHandlers(),
    };
  }
}
