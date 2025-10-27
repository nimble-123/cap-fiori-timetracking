import { Transaction } from '@sap/cds';
import { TravelTypeRepository } from '../repositories';
import { logger } from '../utils';

/**
 * Validator für TravelType-Referenzen
 */
export class TravelTypeValidator {
  private repository: TravelTypeRepository;

  constructor(repository: TravelTypeRepository) {
    this.repository = repository;
  }

  /**
   * Validiert ob TravelType existiert
   * @param tx - Transaction Objekt
   * @param code - TravelType Code
   * @throws Error wenn Code nicht existiert
   */
  async validateExists(tx: Transaction, code: string): Promise<void> {
    const exists = await this.repository.exists(tx, code);
    if (!exists) {
      logger.validationWarning('TravelTypeValidator', `TravelType '${code}' not found`, { code });
      throw new Error(`Reiseart '${code}' existiert nicht.`);
    }
    logger.validationSuccess('TravelTypeValidator', `TravelType '${code}' exists`, { code });
  }
}

export default TravelTypeValidator;
