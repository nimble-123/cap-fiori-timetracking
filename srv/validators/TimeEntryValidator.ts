import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ActivityTypeRepository } from '../repositories/ActivityTypeRepository';

/**
 * Validator für TimeEntry Operationen
 * Verwaltet alle Validierungslogik für TimeEntries
 */
export class TimeEntryValidator {
  private projectRepository: ProjectRepository;
  private activityTypeRepository: ActivityTypeRepository;

  constructor(projectRepository: ProjectRepository, activityTypeRepository: ActivityTypeRepository) {
    this.projectRepository = projectRepository;
    this.activityTypeRepository = activityTypeRepository;
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
  }

  /**
   * Validiert Referenzen zu Projekt und Activity
   * @param tx - Transaction Objekt
   * @param entryData - TimeEntry Daten
   */
  async validateReferences(tx: Transaction, entryData: Partial<TimeEntry>): Promise<void> {
    // Projekt-Validierung (nur aktive Projekte)
    if (entryData.project_ID) {
      await this.projectRepository.validateActive(tx, entryData.project_ID);
    }

    // Activity-Validierung
    if (entryData.activity_code) {
      await this.activityTypeRepository.validateExists(tx, entryData.activity_code);
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
