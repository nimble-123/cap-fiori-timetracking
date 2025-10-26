import { Transaction } from '@sap/cds';
import { ActivityType } from '#cds-models/TrackService';
import { logger } from '../utils/index.js';

/**
 * Repository für ActivityType Datenzugriff
 * Kapselt alle Datenbankoperationen für ActivityTypes
 */
export class ActivityTypeRepository {
  private ActivityTypes: any;

  constructor(entities: any) {
    this.ActivityTypes = entities.ActivityTypes;
  }

  /**
   * Lädt ActivityType by Code
   * @param tx - Transaction Objekt
   * @param code - Activity Code
   * @returns ActivityType oder null
   */
  async findByCode(tx: Transaction, code: string): Promise<ActivityType | null> {
    logger.repositoryQuery('ActivityType', 'Finding activity by code', { code });
    const activity = await tx.run(SELECT.one.from(this.ActivityTypes).where({ code }));
    logger.repositoryResult('ActivityType', activity ? 'Activity found' : 'Activity not found', {
      code,
      found: !!activity,
    });
    return activity;
  }

  /**
   * Lädt alle ActivityTypes
   * @param tx - Transaction Objekt
   * @returns Array von ActivityTypes
   */
  async findAll(tx: Transaction): Promise<ActivityType[]> {
    logger.repositoryQuery('ActivityType', 'Finding all activities', {});
    const activities = await tx.run(SELECT.from(this.ActivityTypes));
    logger.repositoryResult('ActivityType', 'All activities loaded', { count: activities.length });
    return activities;
  }

  /**
   * Lädt ActivityType by ID
   * @param tx - Transaction Objekt
   * @param id - ActivityType ID
   * @returns ActivityType oder null
   */
  async findById(tx: Transaction, id: string): Promise<ActivityType | null> {
    logger.repositoryQuery('ActivityType', 'Finding activity by ID', { id });
    const activity = await tx.run(SELECT.one.from(this.ActivityTypes).where({ ID: id }));
    logger.repositoryResult('ActivityType', activity ? 'Activity found' : 'Activity not found', {
      id,
      found: !!activity,
    });
    return activity;
  }
}

export default ActivityTypeRepository;
