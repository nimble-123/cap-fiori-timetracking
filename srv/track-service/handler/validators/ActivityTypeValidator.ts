import { Transaction } from '@sap/cds';
import { ActivityTypeRepository } from '../repositories';
import { logger } from '../utils';

/**
 * Validator für ActivityType-Operationen
 * Validiert ActivityType-Referenzen und Codes
 */
export class ActivityTypeValidator {
  constructor(private activityTypeRepository: ActivityTypeRepository) {}

  /**
   * Validiert ob ActivityType existiert
   * @param tx - Transaction Objekt
   * @param code - Activity Code
   * @throws Error wenn Activity Code ungültig
   */
  async validateExists(tx: Transaction, code: string): Promise<void> {
    const activity = await this.activityTypeRepository.findByCode(tx, code);

    if (!activity) {
      logger.validationWarning('ActivityType', 'Activity code invalid', { code });
      throw new Error('Ungültiger Activity Code.');
    }

    logger.validationSuccess('ActivityType', 'Activity code valid', { code, name: activity.name });
  }

  /**
   * Prüft ob ActivityType mit Code existiert
   * @param tx - Transaction Objekt
   * @param code - Activity Code
   * @returns True wenn ActivityType existiert
   */
  async exists(tx: Transaction, code: string): Promise<boolean> {
    const activity = await this.activityTypeRepository.findByCode(tx, code);
    return activity !== null;
  }
}

export default ActivityTypeValidator;
