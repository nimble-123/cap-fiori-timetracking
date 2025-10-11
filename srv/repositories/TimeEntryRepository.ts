import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';

/**
 * Repository für TimeEntry Datenzugriff
 * Kapselt alle Datenbankoperationen für TimeEntries
 */
export class TimeEntryRepository {
  private TimeEntries: any;

  constructor(entities: any) {
    this.TimeEntries = entities.TimeEntries;
  }

  /**
   * Prüft Eindeutigkeit pro User/Tag
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param workDate - Arbeitsdatum
   * @param excludeId - Optional: ID die ausgeschlossen werden soll
   */
  async validateUniqueEntryPerDay(
    tx: Transaction,
    userId: string,
    workDate: string,
    excludeId: string | null = null,
  ): Promise<void> {
    const whereClause: any = { user_ID: userId, workDate };

    if (excludeId) {
      whereClause.ID = { '!=': excludeId };
    }

    const existingEntry = await tx.run(SELECT.one.from(this.TimeEntries).where(whereClause));

    if (existingEntry) {
      const error = new Error('Es existiert bereits ein Eintrag für diesen Tag.') as any;
      error.code = 409;
      throw error;
    }
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
   * Lädt existierende Entries für User im Zeitraum (nur Daten)
   * @param userID - User ID
   * @param startDate - Startdatum
   * @param endDate - Enddatum
   * @returns Set der existierenden Daten
   */
  async getExistingDatesInRange(userID: string, startDate: string, endDate: string): Promise<Set<string>> {
    console.log(`📅 Suche existierende Einträge von ${startDate} bis ${endDate}`);

    const existingEntries = await SELECT.from(this.TimeEntries).where({
      user_ID: userID,
    });

    const existingInRange = existingEntries.filter(
      (entry: any) => entry.workDate >= startDate && entry.workDate <= endDate,
    );

    console.log(`📝 ${existingInRange.length} existierende Einträge im Zeitraum gefunden`);

    return new Set(existingInRange.map((entry: any) => entry.workDate));
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
      console.log(`ℹ️ Keine neuen Einträge zu erstellen`);
      return;
    }

    console.log(`💾 Persistiere ${entries.length} neue TimeEntries in DB...`);
    await INSERT.into(this.TimeEntries).entries(entries);
    console.log(`✅ ${entries.length} TimeEntries erfolgreich gespeichert`);
  }
}

export default TimeEntryRepository;
