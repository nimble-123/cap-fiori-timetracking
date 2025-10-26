import { ServiceContainer } from '../container/index.js';
import { TimeEntryHandlers, GenerationHandlers, BalanceHandlers } from '../handlers/index.js';
import type {
  CreateTimeEntryCommand,
  UpdateTimeEntryCommand,
  RecalculateTimeEntryCommand,
  GenerateMonthlyCommand,
  GenerateYearlyCommand,
  GetDefaultParamsCommand,
  GetMonthlyBalanceCommand,
  GetCurrentBalanceCommand,
  GetRecentBalancesCommand,
  GetVacationBalanceCommand,
  GetSickLeaveBalanceCommand,
  MarkTimeEntryDoneCommand,
  ReleaseTimeEntryCommand,
} from '../commands/index.js';

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
      this.container.getCommand<RecalculateTimeEntryCommand>('recalculateTimeEntry'),
      this.container.getCommand<MarkTimeEntryDoneCommand>('markTimeEntryDone'),
      this.container.getCommand<ReleaseTimeEntryCommand>('releaseTimeEntry'),
    );
  }

  /**
   * Erstellt Generation Handler mit Dependencies aus Container
   */
  createGenerationHandlers(): GenerationHandlers {
    return new GenerationHandlers(
      this.container.getCommand<GenerateMonthlyCommand>('generateMonthly'),
      this.container.getCommand<GenerateYearlyCommand>('generateYearly'),
      this.container.getCommand<GetDefaultParamsCommand>('getDefaultParams'),
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
      this.container.getCommand<GetVacationBalanceCommand>('getVacationBalance'),
      this.container.getCommand<GetSickLeaveBalanceCommand>('getSickLeaveBalance'),
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
