import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';

/**
 * Validator für TimeEntry Operationen
 * Verwaltet alle Validierungslogik für TimeEntries
 */
export class TimeEntryValidator {
  private Projects: any;
  private ActivityTypes: any;

  constructor(entities: any) {
    this.Projects = entities.Projects;
    this.ActivityTypes = entities.ActivityTypes;
  }

  /**
   * Validiert Pflichtfelder für TimeEntry CREATE
   * @param entryData - TimeEntry Daten
   * @returns Entry Type
   */
  validateRequiredFieldsForCreate(entryData: Partial<TimeEntry>): string {
    const { user_ID, workDate, startTime, endTime, entryType } = entryData;

    if (!user_ID) {
      throw new Error('user ist erforderlich.');
    }

    if (!workDate) {
      throw new Error('workDate ist erforderlich.');
    }

    const type = entryType || 'WORK';

    // Bei Arbeitszeit sind Start-/Endzeit erforderlich
    if (type === 'WORK' && (!startTime || !endTime)) {
      throw new Error('startTime und endTime sind bei Arbeitszeit erforderlich.');
    }

    return String(type);
  }

  /**
   * Validiert Felder für TimeEntry UPDATE
   * @param entryData - TimeEntry Daten
   * @param existingEntry - Bestehender TimeEntry
   */
  validateFieldsForUpdate(entryData: Partial<TimeEntry>, existingEntry: TimeEntry): void {
    const startTime = entryData.startTime ?? existingEntry.startTime;
    const endTime = entryData.endTime ?? existingEntry.endTime;
    const entryType = entryData.entryType ?? existingEntry.entryType ?? 'WORK';

    // Bei Arbeitszeit sind Start-/Endzeit erforderlich
    if (entryType === 'WORK' && (!startTime || !endTime)) {
      throw new Error('startTime und endTime sind bei Arbeitszeit erforderlich.');
    }
  }

  /**
   * Validiert Referenzen zu Projekt und Activity
   * @param tx - Transaction Objekt
   * @param entryData - TimeEntry Daten
   */
  async validateReferences(tx: Transaction, entryData: Partial<TimeEntry>): Promise<void> {
    // Projekt-Validierung (nur aktive Projekte)
    if (entryData.project_ID) {
      const project = await tx.run(
        SELECT.one.from(this.Projects).where({
          ID: entryData.project_ID,
          active: true,
        }),
      );

      if (!project) {
        throw new Error('Projekt ist ungültig oder inaktiv.');
      }
    }

    // Activity-Validierung
    if (entryData.activity_code) {
      const activity = await tx.run(
        SELECT.one.from(this.ActivityTypes).where({
          code: entryData.activity_code,
        }),
      );

      if (!activity) {
        throw new Error('Ungültiger Activity Code.');
      }
    }
  }

  /**
   * Prüft ob zeitrelevante Felder geändert wurden
   * @param updateData - Update-Daten
   * @returns True wenn Neuberechnung erforderlich
   */
  requiresTimeRecalculation(updateData: Partial<TimeEntry>): boolean {
    const timeRelevantFields: (keyof TimeEntry)[] = [
      'startTime',
      'endTime',
      'breakMin',
      'user_ID',
      'entryType_code',
      'note',
    ];

    return timeRelevantFields.some((field) => field in updateData);
  }
}

export default TimeEntryValidator;
