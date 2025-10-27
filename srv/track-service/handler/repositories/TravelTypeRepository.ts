import { Transaction } from '@sap/cds';
import { TravelType } from '#cds-models/TrackService';
import { logger } from '../utils';

/**
 * Repository für TravelType Datenzugriff
 * Kapselt alle Datenbankoperationen für TravelTypes
 */
export class TravelTypeRepository {
  private TravelTypes: any;

  constructor(entities: any) {
    this.TravelTypes = entities.TravelTypes;
  }

  /**
   * Lädt TravelType by Code
   * @param tx - Transaction Objekt
   * @param code - TravelType Code
   * @returns TravelType oder null
   */
  async findByCode(tx: Transaction, code: string): Promise<TravelType | null> {
    logger.repositoryQuery('TravelType', 'Finding travel type by code', { code });
    const travelType = await tx.run(SELECT.one.from(this.TravelTypes).where({ code }));
    logger.repositoryResult('TravelType', travelType ? 'Travel type found' : 'Travel type not found', {
      code,
      found: !!travelType,
    });
    return travelType;
  }

  /**
   * Lädt alle TravelTypes
   * @param tx - Transaction Objekt
   * @returns Array von TravelTypes
   */
  async findAll(tx: Transaction): Promise<TravelType[]> {
    logger.repositoryQuery('TravelType', 'Finding all travel types', {});
    const travelTypes = await tx.run(SELECT.from(this.TravelTypes));
    logger.repositoryResult('TravelType', 'All travel types loaded', { count: travelTypes.length });
    return travelTypes;
  }

  /**
   * Prüft ob TravelType existiert
   * @param tx - Transaction Objekt
   * @param code - TravelType Code
   * @returns true wenn existiert
   */
  async exists(tx: Transaction, code: string): Promise<boolean> {
    logger.repositoryQuery('TravelType', 'Checking if travel type exists', { code });
    const result = await tx.run(SELECT.one.from(this.TravelTypes).columns('code').where({ code }));
    const exists = !!result;
    logger.repositoryResult('TravelType', `Travel type ${exists ? 'exists' : 'does not exist'}`, {
      code,
      exists,
    });
    return exists;
  }
}
