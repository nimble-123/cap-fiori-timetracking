import {
  // Repositories
  UserRepository,
  ProjectRepository,
  ActivityTypeRepository,
  TimeEntryRepository,
  // Services
  UserService,
  HolidayService,
  TimeBalanceService,
  // Validators
  TimeEntryValidator,
  GenerationValidator,
  BalanceValidator,
  // Strategies
  MonthlyGenerationStrategy,
  YearlyGenerationStrategy,
  // Factories
  TimeEntryFactory,
  // Commands
  CreateTimeEntryCommandImpl,
  UpdateTimeEntryCommandImpl,
  GenerateMonthlyCommandImpl,
  GenerateYearlyCommandImpl,
  GetMonthlyBalanceCommandImpl,
  GetCurrentBalanceCommandImpl,
  GetRecentBalancesCommandImpl,
} from '../index';

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
    this.buildStrategies();
    this.buildFactories();
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
  }

  private buildServices(): void {
    this.services.set('user', new UserService(this.getRepository('user')));
    this.services.set('holiday', new HolidayService());
    this.services.set('balance', new TimeBalanceService(this.getRepository('timeEntry')));
  }

  private buildValidators(): void {
    this.validators.set(
      'timeEntry',
      new TimeEntryValidator(this.getRepository('project'), this.getRepository('activityType')),
    );
    this.validators.set('generation', new GenerationValidator());
    this.validators.set('balance', new BalanceValidator());
  }

  private buildStrategies(): void {
    this.strategies.set('monthly', new MonthlyGenerationStrategy());
    this.strategies.set('yearly', new YearlyGenerationStrategy(this.getService('holiday')));
  }

  private buildFactories(): void {
    this.factories.set('timeEntry', TimeEntryFactory);
  }

  private buildCommands(): void {
    // TimeEntry CRUD Commands
    const timeEntryDeps = {
      userService: this.getService<UserService>('user'),
      validator: this.getValidator<TimeEntryValidator>('timeEntry'),
      repository: this.getRepository<TimeEntryRepository>('timeEntry'),
      factory: this.getFactory<typeof TimeEntryFactory>('timeEntry'),
    };
    this.commands.set('createTimeEntry', new CreateTimeEntryCommandImpl(timeEntryDeps));
    this.commands.set('updateTimeEntry', new UpdateTimeEntryCommandImpl(timeEntryDeps));

    // Generation Commands
    const generationDeps = {
      userService: this.getService<UserService>('user'),
      validator: this.getValidator<GenerationValidator>('generation'),
      repository: this.getRepository<TimeEntryRepository>('timeEntry'),
      monthlyStrategy: this.getStrategy<MonthlyGenerationStrategy>('monthly'),
      yearlyStrategy: this.getStrategy<YearlyGenerationStrategy>('yearly'),
    };
    this.commands.set('generateMonthly', new GenerateMonthlyCommandImpl(generationDeps));
    this.commands.set('generateYearly', new GenerateYearlyCommandImpl(generationDeps));

    // Balance Commands
    const balanceDeps = {
      balanceService: this.getService<TimeBalanceService>('balance'),
      userService: this.getService<UserService>('user'),
      validator: this.getValidator<BalanceValidator>('balance'),
    };
    this.commands.set('getMonthlyBalance', new GetMonthlyBalanceCommandImpl(balanceDeps));
    this.commands.set('getCurrentBalance', new GetCurrentBalanceCommandImpl(balanceDeps));
    this.commands.set('getRecentBalances', new GetRecentBalancesCommandImpl(balanceDeps));
  }
}
