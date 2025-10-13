import { Transaction } from '@sap/cds';
import { WorkLocation } from '#cds-models/TrackService';
import { logger } from '../utils';

/**
 * Repository für WorkLocation Datenzugriff
 * Kapselt alle Datenbankoperationen für WorkLocations
 */
export class WorkLocationRepository {
  private WorkLocations: any;

  constructor(entities: any) {
    this.WorkLocations = entities.WorkLocations;
  }

  /**
   * Lädt WorkLocation by Code
   * @param tx - Transaction Objekt
   * @param code - WorkLocation Code
   * @returns WorkLocation oder null
   */
  async findByCode(tx: Transaction, code: string): Promise<WorkLocation | null> {
    logger.repositoryQuery('WorkLocation', 'Finding work location by code', { code });
    const location = await tx.run(SELECT.one.from(this.WorkLocations).where({ code }));
    logger.repositoryResult('WorkLocation', location ? 'Location found' : 'Location not found', {
      code,
      found: !!location,
    });
    return location;
  }

  /**
   * Lädt alle WorkLocations
   * @param tx - Transaction Objekt
   * @returns Array von WorkLocations
   */
  async findAll(tx: Transaction): Promise<WorkLocation[]> {
    logger.repositoryQuery('WorkLocation', 'Finding all work locations', {});
    const locations = await tx.run(SELECT.from(this.WorkLocations));
    logger.repositoryResult('WorkLocation', 'All locations loaded', { count: locations.length });
    return locations;
  }

  /**
   * Prüft ob WorkLocation existiert
   * @param tx - Transaction Objekt
   * @param code - WorkLocation Code
   * @returns true wenn existiert
   */
  async exists(tx: Transaction, code: string): Promise<boolean> {
    logger.repositoryQuery('WorkLocation', 'Checking if location exists', { code });
    const result = await tx.run(SELECT.one.from(this.WorkLocations).columns('code').where({ code }));
    const exists = !!result;
    logger.repositoryResult('WorkLocation', `Location ${exists ? 'exists' : 'does not exist'}`, {
      code,
      exists,
    });
    return exists;
  }
}
