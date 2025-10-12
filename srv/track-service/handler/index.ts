// Infrastructure
export { ServiceContainer } from './container/ServiceContainer';
export { HandlerRegistry, HandlerRegistrar } from './registry';
export { HandlerSetup } from './setup';

// Repositories
export { UserRepository, ProjectRepository, ActivityTypeRepository, TimeEntryRepository } from './repositories';

// Services
export { UserService, HolidayService, TimeBalanceService, TimeCalculationService } from './services';

// Validators
export { TimeEntryValidator, GenerationValidator, BalanceValidator } from './validators';

// Strategies
export { MonthlyGenerationStrategy, YearlyGenerationStrategy } from './strategies';

// Factories
export { TimeEntryFactory, HandlerFactory } from './factories';

// Utils
export { DateUtils } from './utils/DateUtils';

// Commands (Type-only exports for external use)
export type {
  CreateTimeEntryCommand,
  UpdateTimeEntryCommand,
  GenerateMonthlyCommand,
  GenerateYearlyCommand,
  GetMonthlyBalanceCommand,
  GetCurrentBalanceCommand,
  GetRecentBalancesCommand,
} from './commands';

// Command implementations (for internal use)
export {
  CreateTimeEntryCommandImpl,
  UpdateTimeEntryCommandImpl,
  GenerateMonthlyCommandImpl,
  GenerateYearlyCommandImpl,
  GetMonthlyBalanceCommandImpl,
  GetCurrentBalanceCommandImpl,
  GetRecentBalancesCommandImpl,
} from './commands';

// Handlers
export { TimeEntryHandlers, GenerationHandlers, BalanceHandlers } from './handlers';
