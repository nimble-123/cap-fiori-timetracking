import cds, { ApplicationService } from '@sap/cds';
import { TimeEntries, TimeEntry } from '#cds-models/TrackService';

// Import Repositories
import { TimeEntryRepository } from './repositories/TimeEntryRepository';
import { UserRepository } from './repositories/UserRepository';
import { ProjectRepository } from './repositories/ProjectRepository';
import { ActivityTypeRepository } from './repositories/ActivityTypeRepository';

// Import Services
import { UserService } from './services/UserService';
import { HolidayService } from './services/HolidayService';
import { TimeBalanceService } from './services/TimeBalanceService';

// Import Validators
import { TimeEntryValidator } from './validators/TimeEntryValidator';

// Import Commands, Factories & Strategies
import { TimeEntryFactory } from './factories/TimeEntryFactory';
import { MonthlyGenerationStrategy } from './strategies/MonthlyGenerationStrategy';
import { YearlyGenerationStrategy } from './strategies/YearlyGenerationStrategy';
import { CreateTimeEntryCommand, UpdateTimeEntryCommand } from './commands/TimeEntryCommands';

export default class TrackService extends ApplicationService {
  private userService!: UserService;
  private timeEntryRepository!: TimeEntryRepository;
  private validator!: TimeEntryValidator;
  private monthlyStrategy!: MonthlyGenerationStrategy;
  private yearlyStrategy!: YearlyGenerationStrategy;
  private holidayService!: HolidayService;
  private balanceService!: TimeBalanceService;
  private createCommand!: CreateTimeEntryCommand;
  private updateCommand!: UpdateTimeEntryCommand;
  private userRepository!: UserRepository;
  private projectRepository!: ProjectRepository;
  private activityTypeRepository!: ActivityTypeRepository;

  async init(): Promise<void> {
    // Dependency Injection Setup - Repositories zuerst
    this.userRepository = new UserRepository(this.entities);
    this.projectRepository = new ProjectRepository(this.entities);
    this.activityTypeRepository = new ActivityTypeRepository(this.entities);
    this.timeEntryRepository = new TimeEntryRepository(this.entities);

    // Services mit Repositories
    this.userService = new UserService(this.userRepository);
    this.holidayService = new HolidayService();
    this.balanceService = new TimeBalanceService(this.timeEntryRepository);

    // Validator mit Repositories
    this.validator = new TimeEntryValidator(this.projectRepository, this.activityTypeRepository);

    // Strategies
    this.monthlyStrategy = new MonthlyGenerationStrategy();
    this.yearlyStrategy = new YearlyGenerationStrategy(this.holidayService);

    // Commands mit Dependencies
    const dependencies = {
      userService: this.userService,
      validator: this.validator,
      repository: this.timeEntryRepository,
      factory: TimeEntryFactory,
    };

    this.createCommand = new CreateTimeEntryCommand(dependencies);
    this.updateCommand = new UpdateTimeEntryCommand(dependencies);

    // Event Handlers
    this.before('CREATE', TimeEntries, this.handleCreateTimeEntry.bind(this));
    this.before('UPDATE', TimeEntries, this.handleUpdateTimeEntry.bind(this));
    this.before('DELETE', TimeEntries, this.handleDeleteTimeEntry.bind(this));
    this.on('generateMonthlyTimeEntries', this.handleGenerateMonthlyEntries.bind(this));
    this.on('generateYearlyTimeEntries', this.handleGenerateYearlyEntries.bind(this));

    // Balance Handler
    this.on('getMonthlyBalance', this.handleGetMonthlyBalance.bind(this));
    this.on('getCurrentBalance', this.handleGetCurrentBalance.bind(this));
    this.on('READ', 'MonthlyBalances', this.handleReadMonthlyBalances.bind(this));

    await super.init();
  }

  private async handleCreateTimeEntry(req: any): Promise<void> {
    try {
      const tx = cds.transaction(req) as any;
      const calculatedData = await this.createCommand.execute(tx, req.data as TimeEntry);
      Object.assign(req.data, calculatedData);
    } catch (error: any) {
      req.reject(error.code || 400, error.message);
    }
  }

  private async handleUpdateTimeEntry(req: any): Promise<void> {
    try {
      const tx = cds.transaction(req) as any;
      const entryId = req.data.ID || req.params?.[0];

      if (!entryId) {
        return req.reject(400, 'TimeEntry ID ist erforderlich.');
      }

      const calculatedData = await this.updateCommand.execute(tx, entryId, req.data);
      Object.assign(req.data, calculatedData);
    } catch (error: any) {
      req.reject(error.code || 400, error.message);
    }
  }

  private handleDeleteTimeEntry(req: any): void {
    req.reject(405, 'Löschen von TimeEntries ist nicht erlaubt.');
  }

  private async handleGenerateMonthlyEntries(req: any): Promise<TimeEntry[]> {
    try {
      console.log('🚀 Action generateMonthlyTimeEntries aufgerufen');

      const { userID, user } = await this.userService.resolveUserForGeneration(req);
      if (!user) {
        console.error(`❌ User ${userID} nicht verfügbar`);
        req.reject(404, 'User nicht verfügbar.');
        return [];
      }

      const monthData = this.monthlyStrategy.getCurrentMonthData();
      const existingDates = await this.timeEntryRepository.getExistingDatesInRange(
        userID,
        monthData.monthStartStr,
        monthData.monthEndStr,
      );

      const newEntries = this.monthlyStrategy.generateMissingEntries(userID, user, monthData, existingDates);
      await this.timeEntryRepository.insertBatch(newEntries);

      const allMonthEntries = await this.timeEntryRepository.getEntriesInRange(
        userID,
        monthData.monthStartStr,
        monthData.monthEndStr,
      );

      console.log(`✅ ${newEntries.length} neue Einträge erstellt`);
      return allMonthEntries;
    } catch (error: any) {
      console.error('❌ Fehler in generateMonthlyTimeEntries:', error);
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }

  private async handleGenerateYearlyEntries(req: any): Promise<TimeEntry[]> {
    try {
      console.log('🚀 Action generateYearlyTimeEntries aufgerufen');

      // Parameter auslesen
      const year = req.data.year || new Date().getFullYear();
      const stateCode = req.data.stateCode;

      if (!stateCode) {
        req.reject(400, 'Bundesland (stateCode) ist erforderlich.');
        return [];
      }

      console.log(`📅 Generiere Jahreseinträge für ${year}, Bundesland: ${stateCode}`);

      const { userID, user } = await this.userService.resolveUserForGeneration(req);
      if (!user) {
        console.error(`❌ User ${userID} nicht verfügbar`);
        req.reject(404, 'User nicht verfügbar.');
        return [];
      }

      const yearData = this.yearlyStrategy.getYearData(year);
      const existingDates = await this.timeEntryRepository.getExistingDatesInRange(
        userID,
        yearData.yearStartStr,
        yearData.yearEndStr,
      );

      const newEntries = await this.yearlyStrategy.generateMissingEntries(
        userID,
        user,
        yearData,
        stateCode,
        existingDates,
      );

      await this.timeEntryRepository.insertBatch(newEntries);

      const allYearEntries = await this.timeEntryRepository.getEntriesInRange(
        userID,
        yearData.yearStartStr,
        yearData.yearEndStr,
      );

      console.log(`✅ ${newEntries.length} neue Einträge erstellt (Arbeitstage, Wochenenden, Feiertage)`);
      return allYearEntries;
    } catch (error: any) {
      console.error('❌ Fehler in generateYearlyTimeEntries:', error);
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }

  private getBalanceStatus(balanceValue: number): { emoji: string; status: string; formattedBalance: string } {
    let emoji = '🔵';
    let status = 'Neutral';

    if (balanceValue > 0) {
      emoji = '💚';
      status = 'Positiv';
    } else if (balanceValue < -5) {
      emoji = '🔴';
      status = 'Kritisch';
    } else if (balanceValue < 0) {
      emoji = '🟡';
      status = 'Negativ';
    }

    const formattedBalance = balanceValue > 0 ? `+${balanceValue}h` : `${balanceValue}h`;

    return { emoji, status, formattedBalance };
  }

  private async handleGetMonthlyBalance(req: any): Promise<any> {
    try {
      const year = req.data.year || new Date().getFullYear();
      const month = req.data.month || new Date().getMonth() + 1;

      console.log(`📊 getMonthlyBalance aufgerufen: Jahr=${year}, Monat=${month}`);

      const { userID } = await this.userService.resolveUserForGeneration(req);
      const tx = cds.transaction(req) as any;

      const balance = await this.balanceService.getMonthBalance(tx, userID, year, month);

      const balanceValue = balance.balanceHours ?? 0;
      const { emoji, status, formattedBalance } = this.getBalanceStatus(balanceValue);

      req.info(
        `${emoji} Monatssaldo ${year}-${String(month).padStart(2, '0')}: ${formattedBalance} bei ${balance.workingDays ?? 0} Arbeitstagen (Status: ${status})`,
      );

      console.log(`✅ Saldo berechnet: ${balance.balanceHours}h (${balance.workingDays} Arbeitstage)`);
      return balance;
    } catch (error: any) {
      console.error('❌ Fehler in getMonthlyBalance:', error);
      req.reject(500, `Fehler: ${error.message}`);
      return null;
    }
  }

  private async handleGetCurrentBalance(req: any): Promise<number> {
    try {
      console.log('📊 getCurrentBalance aufgerufen');

      const { userID } = await this.userService.resolveUserForGeneration(req);
      const tx = cds.transaction(req) as any;

      const balance = await this.balanceService.getCurrentCumulativeBalance(tx, userID);

      const { emoji, status, formattedBalance } = this.getBalanceStatus(balance);

      req.info(`${emoji} Ihr aktueller Gesamtsaldo beträgt ${formattedBalance} (Status: ${status})`);

      console.log(`✅ Aktueller Gesamtsaldo: ${balance}h`);
      return balance;
    } catch (error: any) {
      console.error('❌ Fehler in getCurrentBalance:', error);
      req.reject(500, `Fehler: ${error.message}`);
      return 0;
    }
  }

  private async handleReadMonthlyBalances(req: any): Promise<any[]> {
    try {
      console.log('📊 READ MonthlyBalances aufgerufen');

      const { userID } = await this.userService.resolveUserForGeneration(req);
      const tx = cds.transaction(req) as any;

      // Letzte 6 Monate abrufen
      const balances = await this.balanceService.getRecentMonthsBalance(tx, userID, 6);

      console.log(`✅ ${balances.length} Monats-Salden abgerufen`);
      return balances;
    } catch (error: any) {
      console.error('❌ Fehler in handleReadMonthlyBalances:', error);
      req.reject(500, `Fehler: ${error.message}`);
      return [];
    }
  }
}
