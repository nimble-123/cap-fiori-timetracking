import { Transaction } from '@sap/cds';
import { TimeEntry, TimeEntryStatus } from '#cds-models/TrackService';
import { logger } from '../utils/index.js';

/**
 * Repository für TimeEntry Datenzugriff
 * Kapselt alle Datenbankoperationen für TimeEntries
 */
export class TimeEntryRepository {
  private TimeEntries: any;
  private TimeEntryStatuses: any;

  constructor(entities: any) {
    this.TimeEntries = entities.TimeEntries;
    this.TimeEntryStatuses = entities.TimeEntryStatuses;
  }

  /**
   * Lädt TimeEntry by ID
   * @param tx - Transaction Objekt
   * @param entryId - TimeEntry ID
   * @returns TimeEntry oder wirft Fehler
   */
  async getById(tx: Transaction, entryId: string): Promise<TimeEntry> {
    const entry = await tx.run(SELECT.one.from(this.TimeEntries).where({ ID: entryId }));

    if (!entry) {
      throw new Error('TimeEntry nicht gefunden.');
    }

    return entry;
  }

  /**
   * Lädt TimeEntry für User und Datum (reiner Datenzugriff)
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param workDate - Arbeitsdatum
   * @param excludeId - Optional: ID die ausgeschlossen werden soll
   * @returns TimeEntry oder null
   */
  async getEntryByUserAndDate(
    tx: Transaction,
    userId: string,
    workDate: string,
    excludeId?: string,
  ): Promise<TimeEntry | null> {
    const whereClause: any = { user_ID: userId, workDate };

    if (excludeId) {
      whereClause.ID = { '!=': excludeId };
    }

    const entry = await tx.run(SELECT.one.from(this.TimeEntries).where(whereClause));

    return entry || null;
  }

  /**
   * Lädt existierende Entries für User im Zeitraum (nur Daten)
   * @param userID - User ID
   * @param startDate - Startdatum
   * @param endDate - Enddatum
   * @returns Set der existierenden Daten
   */
  async getExistingDatesInRange(userID: string, startDate: string, endDate: string): Promise<Set<string>> {
    logger.repositoryQuery('TimeEntry', `Searching existing entries from ${startDate} to ${endDate}`, {
      userID,
      startDate,
      endDate,
    });

    const existingEntries = await SELECT.from(this.TimeEntries).where({
      user_ID: userID,
    });

    const existingInRange = existingEntries.filter(
      (entry: any) => entry.workDate >= startDate && entry.workDate <= endDate,
    );

    logger.repositoryResult('TimeEntry', `Found ${existingInRange.length} existing entries in range`, {
      count: existingInRange.length,
      startDate,
      endDate,
    });

    return new Set(existingInRange.map((entry: any) => entry.workDate));
  }

  /**
   * Lädt mehrere TimeEntries anhand einer Liste von IDs
   * @param tx - Transaction Objekt
   * @param ids - Liste der TimeEntry IDs
   */
  async getByIds(tx: Transaction, ids: string[]): Promise<TimeEntry[]> {
    if (!ids.length) {
      return [];
    }

    const uniqueIds = Array.from(new Set(ids));
    logger.repositoryQuery('TimeEntry', 'Fetching entries by IDs', { count: uniqueIds.length });

    const entries = await tx.run(SELECT.from(this.TimeEntries).where({ ID: { in: uniqueIds } }));
    logger.repositoryResult('TimeEntry', 'Entries fetched by IDs', { count: entries.length });

    const entryMap = new Map(entries.map((entry: any) => [entry.ID, entry]));
    return uniqueIds.map((id) => entryMap.get(id)).filter((entry): entry is TimeEntry => Boolean(entry));
  }

  /**
   * Batch-Update des Status für mehrere TimeEntries
   * @param tx - Transaction Objekt
   * @param ids - Liste der TimeEntry IDs
   * @param statusCode - Ziel-Statuscode
   */
  async updateStatusBatch(tx: Transaction, ids: string[], statusCode: string): Promise<void> {
    if (!ids.length) {
      return;
    }

    const uniqueIds = Array.from(new Set(ids));
    logger.repositorySave('TimeEntry', uniqueIds.length, {
      statusCode,
    });

    await tx.run(
      UPDATE(this.TimeEntries)
        .set({ status_code: statusCode })
        .where({ ID: { in: uniqueIds } }),
    );
  }

  /**
   * Lädt TimeEntry Status nach Codes
   * @param tx - Transaction Objekt
   * @param codes - Liste der Statuscodes
   */
  async getStatusesByCodes(tx: Transaction, codes: string[]): Promise<TimeEntryStatus[]> {
    if (!codes.length) {
      return [];
    }

    const uniqueCodes = Array.from(new Set(codes));
    logger.repositoryQuery('TimeEntryStatus', 'Fetching statuses by codes', { codes: uniqueCodes });
    const statuses = await tx.run(SELECT.from(this.TimeEntryStatuses).where({ code: { in: uniqueCodes } }));
    logger.repositoryResult('TimeEntryStatus', 'Statuses fetched', { count: statuses.length });

    return statuses;
  }

  /**
   * Liefert Status als Map für schnellen Zugriff
   * @param tx - Transaction Objekt
   * @param codes - Liste der Statuscodes
   */
  async getStatusMapByCodes(tx: Transaction, codes: string[]): Promise<Map<string, TimeEntryStatus>> {
    const statuses = await this.getStatusesByCodes(tx, codes);
    return new Map(statuses.map((status: any) => [status.code, status]));
  }

  /**
   * Lädt alle TimeEntries für User im Zeitraum
   * @param userID - User ID
   * @param startDate - Startdatum
   * @param endDate - Enddatum
   * @returns TimeEntries im Zeitraum
   */
  async getEntriesInRange(userID: string, startDate: string, endDate: string): Promise<TimeEntry[]> {
    const allUserEntries = await SELECT.from(this.TimeEntries).where({ user_ID: userID }).orderBy('workDate');

    return allUserEntries.filter((entry: any) => entry.workDate >= startDate && entry.workDate <= endDate);
  }

  /**
   * Batch Insert von TimeEntries
   * @param entries - Zu speichernde Einträge
   */
  async insertBatch(entries: TimeEntry[]): Promise<void> {
    if (entries.length === 0) {
      logger.repositoryInfo('TimeEntry', 'No new entries to create');
      return;
    }

    logger.repositoryQuery('TimeEntry', `Persisting ${entries.length} new entries`, { count: entries.length });
    await INSERT.into(this.TimeEntries).entries(entries);
    logger.repositorySave('TimeEntry', entries.length);
  }

  /**
   * Lädt alle TimeEntries für User in einem Monat (für Balance-Berechnung)
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param year - Jahr
   * @param month - Monat (1-12)
   * @returns TimeEntries im Monat
   */
  async getEntriesForMonth(tx: Transaction, userId: string, year: number, month: number): Promise<TimeEntry[]> {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];

    const entries = await tx.run(
      SELECT.from(this.TimeEntries)
        .where({ user_ID: userId })
        .and(`workDate >= '${monthStartStr}'`)
        .and(`workDate <= '${monthEndStr}'`)
        .orderBy('workDate'),
    );

    return entries;
  }

  /**
   * Lädt alle TimeEntries für User (für Gesamtsaldo)
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns Alle TimeEntries des Users
   */
  async getAllEntriesForUser(tx: Transaction, userId: string): Promise<TimeEntry[]> {
    const entries = await tx.run(SELECT.from(this.TimeEntries).where({ user_ID: userId }).orderBy('workDate'));

    return entries;
  }

  /**
   * Lädt TimeEntries für User in Datumsbereich mit bestimmtem EntryType
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param startDate - Start-Datum (YYYY-MM-DD)
   * @param endDate - End-Datum (YYYY-MM-DD)
   * @param entryTypeCode - EntryType Code (z.B. 'V', 'S')
   * @returns TimeEntries
   */
  async findByUserAndDateRangeAndType(
    tx: Transaction,
    userId: string,
    startDate: string,
    endDate: string,
    entryTypeCode: string,
  ): Promise<TimeEntry[]> {
    logger.repositoryQuery('TimeEntry', 'Finding entries by user, date range and type', {
      userId,
      startDate,
      endDate,
      entryTypeCode,
    });

    const entries = await tx.run(
      SELECT.from(this.TimeEntries)
        .where({ user_ID: userId, entryType_code: entryTypeCode })
        .and(`workDate >= '${startDate}'`)
        .and(`workDate <= '${endDate}'`)
        .orderBy('workDate'),
    );

    logger.repositoryResult('TimeEntry', 'Entries found', { count: entries.length });
    return entries;
  }

  /**
   * Berechnet Summen für TimeEntries
   * @param entries - TimeEntry Array
   * @returns Aggregierte Summen
   */
  calculateSums(entries: TimeEntry[]): {
    totalOvertime: number;
    totalUndertime: number;
    workingDays: number;
  } {
    const totalOvertime = entries.reduce((sum: number, e: any) => sum + (Number(e.overtimeHours) || 0), 0);
    const totalUndertime = entries.reduce((sum: number, e: any) => sum + (Number(e.undertimeHours) || 0), 0);
    const workingDays = entries.filter((e: any) => e.entryType_code === 'W').length;

    return {
      totalOvertime: Math.round(totalOvertime * 100) / 100,
      totalUndertime: Math.round(totalUndertime * 100) / 100,
      workingDays,
    };
  }
}

export default TimeEntryRepository;
