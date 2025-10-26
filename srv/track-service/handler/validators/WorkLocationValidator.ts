import { Transaction } from '@sap/cds';
import { WorkLocationRepository } from '../repositories/index.js';
import { logger } from '../utils/index.js';

/**
 * Validator für WorkLocation-Referenzen
 */
export class WorkLocationValidator {
  private repository: WorkLocationRepository;

  constructor(repository: WorkLocationRepository) {
    this.repository = repository;
  }

  /**
   * Validiert ob WorkLocation existiert
   * @param tx - Transaction Objekt
   * @param code - WorkLocation Code
   * @throws Error wenn Code nicht existiert
   */
  async validateExists(tx: Transaction, code: string): Promise<void> {
    const exists = await this.repository.exists(tx, code);
    if (!exists) {
      logger.validationWarning('WorkLocationValidator', `WorkLocation '${code}' not found`, { code });
      throw new Error(`Arbeitsort '${code}' existiert nicht.`);
    }
    logger.validationSuccess('WorkLocationValidator', `WorkLocation '${code}' exists`, { code });
  }
}

export default WorkLocationValidator;
