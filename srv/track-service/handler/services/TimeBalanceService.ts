import { Transaction } from '@sap/cds';
import type { MonthlyBalance } from '#cds-models/TrackService';
import { TimeEntryRepository } from '../repositories';
import { logger } from '../utils';
import { CustomizingService } from './CustomizingService';

export interface YearBalance {
  year: number;
  totalOvertimeHours: number;
  totalUndertimeHours: number;
  balanceHours: number;
  workingDays: number;
  months: MonthlyBalance[];
}

/**
 * Service zur Berechnung von Über-/Unterstunden-Salden
 * Nutzt TimeEntryRepository für alle DB-Zugriffe (Dependency Injection)
 */
export class TimeBalanceService {
  private repository: TimeEntryRepository;
  private customizingService: CustomizingService;

  constructor(repository: TimeEntryRepository, customizingService: CustomizingService) {
    this.repository = repository;
    this.customizingService = customizingService;
  }

  /**
   * Berechnet den Saldo für einen bestimmten Monat
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param year - Jahr
   * @param month - Monat (1-12)
   * @returns Monatssaldo mit Criticality
   */
  async getMonthBalance(tx: Transaction, userId: string, year: number, month: number): Promise<MonthlyBalance> {
    logger.serviceCall('TimeBalance', 'Calculating monthly balance', { userId, year, month });

    // Nutze Repository statt direkter DB-Zugriff
    const entries = await this.repository.getEntriesForMonth(tx, userId, year, month);

    // Nutze Repository-Methode für Summenberechnung
    const { totalOvertime, totalUndertime, workingDays } = this.repository.calculateSums(entries);

    const balance = totalOvertime - totalUndertime;

    logger.calculationResult('MonthlyBalance', 'Balance calculated', {
      year,
      month,
      balance,
      workingDays,
      entries: entries.length,
    });

    // Criticality: 3=positive(grün), 2=critical(gelb), 1=negative(rot), 0=neutral
    const balanceSettings = this.customizingService.getBalanceSettings();
    const undertimeCriticalLimit = -Math.abs(balanceSettings.undertimeCriticalHours);

    let criticality = 0;
    if (balance > 0) {
      criticality = 3; // Grün - Überstunden
    } else if (balance < undertimeCriticalLimit) {
      criticality = 1; // Rot - Kritische Unterzeit
    } else if (balance < 0) {
      criticality = 2; // Gelb - Leichte Unterzeit
    }

    return {
      month: `${year}-${month.toString().padStart(2, '0')}`,
      year,
      monthNumber: month,
      totalOvertimeHours: totalOvertime,
      totalUndertimeHours: totalUndertime,
      balanceHours: balance,
      workingDays,
      balanceCriticality: criticality,
    };
  }

  /**
   * Berechnet den Saldo für ein ganzes Jahr
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param year - Jahr
   * @returns Jahressaldo mit allen Monaten
   */
  async getYearBalance(tx: Transaction, userId: string, year: number): Promise<YearBalance> {
    const months: MonthlyBalance[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthBalance = await this.getMonthBalance(tx, userId, year, month);
      months.push(monthBalance);
    }

    const totalOvertime = months.reduce((sum, m) => sum + (m.totalOvertimeHours ?? 0), 0);
    const totalUndertime = months.reduce((sum, m) => sum + (m.totalUndertimeHours ?? 0), 0);
    const totalWorkingDays = months.reduce((sum, m) => sum + (m.workingDays ?? 0), 0);

    return {
      year,
      totalOvertimeHours: Math.round(totalOvertime * 100) / 100,
      totalUndertimeHours: Math.round(totalUndertime * 100) / 100,
      balanceHours: Math.round((totalOvertime - totalUndertime) * 100) / 100,
      workingDays: totalWorkingDays,
      months,
    };
  }

  /**
   * Gibt die letzten N Monate inkl. aktuellen Monat zurück
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param numberOfMonths - Anzahl Monate (default: 6)
   * @returns Array mit Monats-Salden (neueste zuerst)
   */
  async getRecentMonthsBalance(tx: Transaction, userId: string, numberOfMonths?: number): Promise<MonthlyBalance[]> {
    const balances: MonthlyBalance[] = [];
    const now = new Date();
    const balanceSettings = this.customizingService.getBalanceSettings();
    const monthsToFetch = numberOfMonths ?? balanceSettings.recentMonthsDefault;

    for (let i = 0; i < monthsToFetch; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const balance = await this.getMonthBalance(tx, userId, date.getFullYear(), date.getMonth() + 1);
      balances.push(balance);
    }

    return balances;
  }

  /**
   * Gibt den aktuellen kumulierten Gesamtsaldo zurück
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns Gesamtsaldo über alle TimeEntries
   */
  async getCurrentCumulativeBalance(tx: Transaction, userId: string): Promise<number> {
    logger.serviceCall('TimeBalance', 'Calculating cumulative balance', { userId });

    // Nutze Repository statt direkter DB-Zugriff
    const entries = await this.repository.getAllEntriesForUser(tx, userId);

    // Nutze Repository-Methode für Summenberechnung
    const { totalOvertime, totalUndertime } = this.repository.calculateSums(entries);

    const balance = Math.round((totalOvertime - totalUndertime) * 100) / 100;

    logger.calculationResult('CumulativeBalance', 'Balance calculated', {
      userId,
      balance,
      totalEntries: entries.length,
    });

    return balance;
  }
}

export default TimeBalanceService;
