import { Transaction } from '@sap/cds';
import { ActivityType } from '#cds-models/TrackService';

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
    return await tx.run(SELECT.one.from(this.ActivityTypes).where({ code }));
  }

  /**
   * Prüft ob ActivityType mit Code existiert
   * @param tx - Transaction Objekt
   * @param code - Activity Code
   * @returns True wenn ActivityType existiert
   */
  async exists(tx: Transaction, code: string): Promise<boolean> {
    const activity = await this.findByCode(tx, code);
    return activity !== null;
  }

  /**
   * Validiert ob ActivityType existiert, wirft Fehler falls nicht
   * @param tx - Transaction Objekt
   * @param code - Activity Code
   * @throws Error wenn Activity Code ungültig
   */
  async validateExists(tx: Transaction, code: string): Promise<void> {
    const activity = await this.findByCode(tx, code);

    if (!activity) {
      throw new Error('Ungültiger Activity Code.');
    }
  }

  /**
   * Lädt alle ActivityTypes
   * @param tx - Transaction Objekt
   * @returns Array von ActivityTypes
   */
  async findAll(tx: Transaction): Promise<ActivityType[]> {
    return await tx.run(SELECT.from(this.ActivityTypes));
  }

  /**
   * Lädt ActivityType by ID
   * @param tx - Transaction Objekt
   * @param id - ActivityType ID
   * @returns ActivityType oder null
   */
  async findById(tx: Transaction, id: string): Promise<ActivityType | null> {
    return await tx.run(SELECT.one.from(this.ActivityTypes).where({ ID: id }));
  }
}

export default ActivityTypeRepository;
