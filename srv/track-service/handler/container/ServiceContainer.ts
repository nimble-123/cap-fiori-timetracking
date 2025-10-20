// Repositories
import {
  UserRepository,
  ProjectRepository,
  ActivityTypeRepository,
  TimeEntryRepository,
  WorkLocationRepository,
  TravelTypeRepository,
  CustomizingRepository,
} from '../repositories';

// Services
import {
  UserService,
  HolidayService,
  TimeBalanceService,
  VacationBalanceService,
  SickLeaveBalanceService,
  CustomizingService,
} from '../services';

// Validators
import {
  TimeEntryValidator,
  GenerationValidator,
  BalanceValidator,
  ProjectValidator,
  ActivityTypeValidator,
  WorkLocationValidator,
  TravelTypeValidator,
} from '../validators';

// Strategies
import { MonthlyGenerationStrategy, YearlyGenerationStrategy } from '../strategies';

// Factories
import { TimeEntryFactory } from '../factories';

// Commands
import {
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
} from '../commands';

/**
 * Service Container für Dependency Injection
 *
 * Verwaltet alle Services, Repositories, Validators, Strategies und Commands.
 * Bietet type-safe dependency resolution mit generics.
 */
export class ServiceContainer {
  private repositories = new Map<string, any>();
  private services = new Map<string, any>();
  private validators = new Map<string, any>();
  private strategies = new Map<string, any>();
  private commands = new Map<string, any>();
  private factories = new Map<string, any>();

  /**
   * Initialisiert alle Dependencies mit Auto-Wiring
   * @param entities - CAP Service Entities für Repository-Initialisierung
   */
  build(entities: any): void {
    this.buildRepositories(entities);
    this.buildServices();
    this.buildValidators();
    this.buildFactories();
    this.buildStrategies();
    this.buildCommands();
  }

  /**
   * Type-safe Dependency Resolution
   * @param category - Kategorie: 'repository', 'service', 'validator', 'strategy', 'command', 'factory'
   * @param key - Service-Key innerhalb der Kategorie
   */
  get<T>(category: string, key: string): T {
    const result = (() => {
      switch (category) {
        case 'repository':
          return this.repositories.get(key);
        case 'service':
          return this.services.get(key);
        case 'validator':
          return this.validators.get(key);
        case 'strategy':
          return this.strategies.get(key);
        case 'command':
          return this.commands.get(key);
        case 'factory':
          return this.factories.get(key);
        default:
          throw new Error(`Unknown category: ${category}`);
      }
    })();

    if (!result) {
      throw new Error(`Dependency not found: ${category}.${key}`);
    }

    return result as T;
  }

  /**
   * Convenience Methods für bessere Lesbarkeit
   */
  getRepository<T>(key: string): T {
    return this.get<T>('repository', key);
  }

  getService<T>(key: string): T {
    return this.get<T>('service', key);
  }

  getCommand<T>(key: string): T {
    return this.get<T>('command', key);
  }

  getValidator<T>(key: string): T {
    return this.get<T>('validator', key);
  }

  getStrategy<T>(key: string): T {
    return this.get<T>('strategy', key);
  }

  getFactory<T>(key: string): T {
    return this.get<T>('factory', key);
  }

  /**
   * Private Builder Methods
   */
  private buildRepositories(entities: any): void {
    this.repositories.set('user', new UserRepository(entities));
    this.repositories.set('project', new ProjectRepository(entities));
    this.repositories.set('activityType', new ActivityTypeRepository(entities));
    this.repositories.set('timeEntry', new TimeEntryRepository(entities));
    this.repositories.set('workLocation', new WorkLocationRepository(entities));
    this.repositories.set('travelType', new TravelTypeRepository(entities));
    this.repositories.set('customizing', new CustomizingRepository(entities));
  }

  private buildServices(): void {
    const customizingRepository = this.getRepository<CustomizingRepository>('customizing');
    const customizingService = new CustomizingService(customizingRepository);
    const userRepository = this.getRepository<UserRepository>('user');
    const timeEntryRepository = this.getRepository<TimeEntryRepository>('timeEntry');

    this.services.set('customizing', customizingService);
    this.services.set('user', new UserService(userRepository, customizingService));
    this.services.set('holiday', new HolidayService(customizingService));
    this.services.set('balance', new TimeBalanceService(timeEntryRepository, customizingService));
    this.services.set(
      'vacationBalance',
      new VacationBalanceService(timeEntryRepository, userRepository, customizingService),
    );
    this.services.set('sickLeaveBalance', new SickLeaveBalanceService(timeEntryRepository, customizingService));
  }

  private buildValidators(): void {
    const projectRepository = this.getRepository<ProjectRepository>('project');
    const activityTypeRepository = this.getRepository<ActivityTypeRepository>('activityType');
    const workLocationRepository = this.getRepository<WorkLocationRepository>('workLocation');
    const travelTypeRepository = this.getRepository<TravelTypeRepository>('travelType');
    const customizingService = this.getService<CustomizingService>('customizing');

    // Zuerst Project und ActivityType Validators erstellen
    this.validators.set('project', new ProjectValidator(projectRepository));
    this.validators.set('activityType', new ActivityTypeValidator(activityTypeRepository));

    // WorkLocation und TravelType Validators
    this.validators.set('workLocation', new WorkLocationValidator(workLocationRepository));
    this.validators.set('travelType', new TravelTypeValidator(travelTypeRepository));

    // TimeEntryValidator mit allen Validators
    this.validators.set(
      'timeEntry',
      new TimeEntryValidator(
        this.getValidator('project'),
        this.getValidator('activityType'),
        this.getRepository('timeEntry'),
        this.getValidator('workLocation'),
        this.getValidator('travelType'),
      ),
    );
    this.validators.set('generation', new GenerationValidator(customizingService));
    this.validators.set('balance', new BalanceValidator(customizingService));
  }

  private buildStrategies(): void {
    const timeEntryFactory = this.getFactory<TimeEntryFactory>('timeEntry');
    const customizingService = this.getService<CustomizingService>('customizing');
    const holidayService = this.getService<HolidayService>('holiday');

    this.strategies.set('monthly', new MonthlyGenerationStrategy(timeEntryFactory, customizingService));
    this.strategies.set('yearly', new YearlyGenerationStrategy(holidayService, timeEntryFactory));
  }

  private buildFactories(): void {
    const customizingService = this.getService<CustomizingService>('customizing');

    this.factories.set('timeEntry', new TimeEntryFactory(customizingService));
  }

  private buildCommands(): void {
    // TimeEntry CRUD Commands
    const userService = this.getService<UserService>('user');
    const timeEntryValidator = this.getValidator<TimeEntryValidator>('timeEntry');
    const timeEntryRepository = this.getRepository<TimeEntryRepository>('timeEntry');
    const timeEntryFactory = this.getFactory<TimeEntryFactory>('timeEntry');
    const customizingService = this.getService<CustomizingService>('customizing');

    this.commands.set(
      'createTimeEntry',
      new CreateTimeEntryCommand({
        userService,
        validator: timeEntryValidator,
        repository: timeEntryRepository,
        factory: timeEntryFactory,
        customizingService,
      }),
    );

    const updateDeps = {
      userService,
      validator: timeEntryValidator,
      repository: timeEntryRepository,
      factory: timeEntryFactory,
      customizingService,
    };
    this.commands.set('updateTimeEntry', new UpdateTimeEntryCommand(updateDeps));
    this.commands.set('recalculateTimeEntry', new RecalculateTimeEntryCommand({ ...updateDeps, customizingService }));

    // Generation Commands
    const generationDeps = {
      userService,
      validator: this.getValidator<GenerationValidator>('generation'),
      repository: timeEntryRepository,
      monthlyStrategy: this.getStrategy<MonthlyGenerationStrategy>('monthly'),
      yearlyStrategy: this.getStrategy<YearlyGenerationStrategy>('yearly'),
    };
    this.commands.set('generateMonthly', new GenerateMonthlyCommand(generationDeps));
    this.commands.set('generateYearly', new GenerateYearlyCommand({ ...generationDeps, customizingService }));
    this.commands.set('getDefaultParams', new GetDefaultParamsCommand(userService));

    // Balance Commands
    const balanceDeps = {
      balanceService: this.getService<TimeBalanceService>('balance'),
      userService,
      validator: this.getValidator<BalanceValidator>('balance'),
      customizingService,
    };
    this.commands.set('getMonthlyBalance', new GetMonthlyBalanceCommand(balanceDeps));
    this.commands.set('getCurrentBalance', new GetCurrentBalanceCommand(balanceDeps));
    this.commands.set('getRecentBalances', new GetRecentBalancesCommand(balanceDeps));

    // Vacation Balance Command
    const vacationBalanceDeps = {
      vacationBalanceService: this.getService<VacationBalanceService>('vacationBalance'),
      userService,
    };
    this.commands.set('getVacationBalance', new GetVacationBalanceCommand(vacationBalanceDeps));

    // Sick Leave Balance Command
    const sickLeaveBalanceDeps = {
      sickLeaveBalanceService: this.getService<SickLeaveBalanceService>('sickLeaveBalance'),
      userService,
    };
    this.commands.set('getSickLeaveBalance', new GetSickLeaveBalanceCommand(sickLeaveBalanceDeps));

    // Status Commands
    const statusDeps = {
      repository: timeEntryRepository,
      customizingService,
    };
    this.commands.set('markTimeEntryDone', new MarkTimeEntryDoneCommand(statusDeps));
    this.commands.set('releaseTimeEntry', new ReleaseTimeEntryCommand(statusDeps));
  }
}
