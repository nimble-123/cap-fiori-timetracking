import { Transaction } from '@sap/cds';
import { Customizing } from '#cds-models/TrackService';
import { CustomizingRepository } from '../repositories';
import { logger } from '../utils';

interface TimeEntryDefaults {
  startHour: number;
  startMinute: number;
  defaultBreakMinutes: number;
  generatedSourceCode: string;
  manualSourceCode: string;
  workEntryTypeCode: string;
  weekendEntryTypeCode: string;
  holidayEntryTypeCode: string;
}

interface UserDefaults {
  fallbackWeeklyHours: number;
  fallbackWorkingDays: number;
  fallbackAnnualVacationDays: number;
  demoUserId: string;
}

interface BalanceSettings {
  undertimeCriticalHours: number;
  recentMonthsDefault: number;
  yearPastLimit: number;
  yearFutureLimit: number;
  futureMonthBuffer: number;
  maxMonths: number;
  maxHoursAbsolute: number;
  maxWorkingDaysPerMonth: number;
}

interface VacationSettings {
  warningRemainingDays: number;
  criticalRemainingDays: number;
}

interface SickLeaveSettings {
  warningDays: number;
  criticalDays: number;
}

interface HolidayApiConfig {
  baseUrl: string;
  countryParameter: string;
}

interface CustomizingConfig {
  timeEntry: TimeEntryDefaults;
  user: UserDefaults;
  balance: BalanceSettings;
  vacation: VacationSettings;
  sickLeave: SickLeaveSettings;
  holidayApi: HolidayApiConfig;
  locale: string;
}

/**
 * Service für Zugriff auf Customizing Singleton
 */
export class CustomizingService {
  private repository: CustomizingRepository;
  private cache: CustomizingConfig | null = null;

  constructor(repository: CustomizingRepository) {
    this.repository = repository;
  }

  async initialize(tx?: Transaction): Promise<void> {
    this.cache = await this.load(tx);
    logger.serviceReady('Customizing loaded', { component: 'CustomizingService' });
  }

  async refresh(tx?: Transaction): Promise<void> {
    this.cache = await this.load(tx);
  }

  async ensureLoaded(): Promise<void> {
    if (!this.cache) {
      this.cache = await this.load();
    }
  }

  getTimeEntryDefaults(): TimeEntryDefaults {
    return this.requireConfig().timeEntry;
  }

  getUserDefaults(): UserDefaults {
    return this.requireConfig().user;
  }

  getBalanceSettings(): BalanceSettings {
    return this.requireConfig().balance;
  }

  getVacationSettings(): VacationSettings {
    return this.requireConfig().vacation;
  }

  getSickLeaveSettings(): SickLeaveSettings {
    return this.requireConfig().sickLeave;
  }

  getHolidayApiConfig(): HolidayApiConfig {
    return this.requireConfig().holidayApi;
  }

  getLocale(): string {
    return this.requireConfig().locale;
  }

  private requireConfig(): CustomizingConfig {
    if (!this.cache) {
      throw new Error('Customizing cache not initialised');
    }
    return this.cache;
  }

  private async load(tx?: Transaction): Promise<CustomizingConfig> {
    const raw = await this.repository.read(tx);
    if (!raw) {
      throw new Error('Customizing singleton not found');
    }
    return this.map(raw);
  }

  private map(raw: Customizing): CustomizingConfig {
    return {
      timeEntry: {
        startHour: this.toInt(raw.workStartHour, 8),
        startMinute: this.toInt(raw.workStartMinute, 0),
        defaultBreakMinutes: this.toInt(raw.defaultBreakMinutes, 30),
        generatedSourceCode: raw.generatedSourceCode || 'GENERATED',
        manualSourceCode: raw.manualSourceCode || 'UI',
        workEntryTypeCode: raw.workEntryTypeCode || 'W',
        weekendEntryTypeCode: raw.weekendEntryTypeCode || 'O',
        holidayEntryTypeCode: raw.holidayEntryTypeCode || 'H',
      },
      user: {
        fallbackWeeklyHours: this.toNumber(raw.fallbackWeeklyHours, 36),
        fallbackWorkingDays: this.toInt(raw.fallbackWorkingDays, 5),
        fallbackAnnualVacationDays: this.toNumber(raw.fallbackAnnualVacationDays, 30),
        demoUserId: raw.demoUserId || 'max.mustermann@test.de',
      },
      balance: {
        undertimeCriticalHours: this.toNumber(raw.balanceUndertimeCriticalHours, 5),
        recentMonthsDefault: this.toInt(raw.recentMonthsDefault, 6),
        yearPastLimit: this.toInt(raw.balanceYearPastLimit, 10),
        yearFutureLimit: this.toInt(raw.balanceYearFutureLimit, 1),
        futureMonthBuffer: this.toInt(raw.balanceFutureMonthBuffer, 2),
        maxMonths: this.toInt(raw.balanceMaxMonths, 24),
        maxHoursAbsolute: this.toInt(raw.balanceMaxHoursAbsolute, 500),
        maxWorkingDaysPerMonth: this.toInt(raw.balanceMaxWorkingDaysPerMonth, 23),
      },
      vacation: {
        warningRemainingDays: this.toNumber(raw.vacationWarningRemainingDays, 10),
        criticalRemainingDays: this.toNumber(raw.vacationCriticalRemainingDays, 5),
      },
      sickLeave: {
        warningDays: this.toInt(raw.sickLeaveWarningDays, 10),
        criticalDays: this.toInt(raw.sickLeaveCriticalDays, 30),
      },
      holidayApi: {
        baseUrl: raw.holidayApiBaseUrl || 'https://feiertage-api.de/api/',
        countryParameter: raw.holidayApiCountryParameter || 'nur_land',
      },
      locale: raw.locale || 'de-DE',
    };
  }

  private toNumber(value: any, fallback: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private toInt(value: any, fallback: number): number {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}

export default CustomizingService;
