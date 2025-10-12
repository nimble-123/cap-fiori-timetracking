import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { TimeEntryRepository } from '../repositories';
import { ProjectValidator } from './ProjectValidator';
import { ActivityTypeValidator } from './ActivityTypeValidator';
import { logger } from '../utils';

/**
 * Validator für TimeEntry Operationen
 * Verwaltet alle Validierungslogik für TimeEntries
 */
export class TimeEntryValidator {
  private projectValidator: ProjectValidator;
  private activityTypeValidator: ActivityTypeValidator;
  private timeEntryRepository: TimeEntryRepository;

  constructor(
    projectValidator: ProjectValidator,
    activityTypeValidator: ActivityTypeValidator,
    timeEntryRepository: TimeEntryRepository,
  ) {
    this.projectValidator = projectValidator;
    this.activityTypeValidator = activityTypeValidator;
    this.timeEntryRepository = timeEntryRepository;
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
    // Wochenenden (O) und Feiertage (H) dürfen 0-Zeiten haben
    if (type === 'WORK' && (!startTime || !endTime)) {
      throw new Error('startTime und endTime sind bei Arbeitszeit erforderlich.');
    }

    logger.validationSuccess('TimeEntry', 'Required fields validated for CREATE', { type, workDate });
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
    // Wochenenden (O) und Feiertage (H) dürfen 0-Zeiten haben
    if (entryType === 'WORK' && (!startTime || !endTime)) {
      throw new Error('startTime und endTime sind bei Arbeitszeit erforderlich.');
    }

    logger.validationSuccess('TimeEntry', 'Fields validated for UPDATE', {
      entryId: existingEntry.ID,
      type: entryType,
    });
  }

  /**
   * Validiert Referenzen zu Projekt und Activity
   * @param tx - Transaction Objekt
   * @param entryData - TimeEntry Daten
   */
  async validateReferences(tx: Transaction, entryData: Partial<TimeEntry>): Promise<void> {
    // Projekt validieren (falls gesetzt)
    if (entryData.project_ID) {
      await this.projectValidator.validateActive(tx, entryData.project_ID);
      logger.validationSuccess('TimeEntry', 'Project reference valid', { projectId: entryData.project_ID });
    }

    // Activity validieren (falls gesetzt)
    if (entryData.activity_code) {
      await this.activityTypeValidator.validateExists(tx, entryData.activity_code);
      logger.validationSuccess('TimeEntry', 'Activity reference valid', { activityCode: entryData.activity_code });
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

  /**
   * Validiert Eindeutigkeit pro User/Tag
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param workDate - Arbeitsdatum
   * @param excludeId - Optional: ID die ausgeschlossen werden soll
   * @throws Error wenn bereits ein Eintrag für diesen Tag existiert
   */
  async validateUniqueEntryPerDay(
    tx: Transaction,
    userId: string,
    workDate: string,
    excludeId?: string,
  ): Promise<void> {
    const existingEntry = await this.timeEntryRepository.getEntryByUserAndDate(tx, userId, workDate, excludeId);

    if (existingEntry) {
      logger.validationWarning('TimeEntry', 'Duplicate entry detected', {
        userId,
        workDate,
        existingId: existingEntry.ID,
      });
      const error = new Error('Es existiert bereits ein Eintrag für diesen Tag.') as any;
      error.code = 409;
      throw error;
    }

    logger.validationSuccess('TimeEntry', 'Unique entry per day validated', { userId, workDate });
  }
}

export default TimeEntryValidator;
