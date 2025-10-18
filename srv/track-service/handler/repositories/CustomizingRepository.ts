import { Transaction } from '@sap/cds';
import { Customizing } from '#cds-models/TrackService';

/**
 * Repository für Customizing Singleton
 */
export class CustomizingRepository {
  private Customizing: any;

  constructor(entities: any) {
    this.Customizing = entities.Customizing;
  }

  /**
   * Lädt Customizing-Datensatz
   * @param tx - Optionales Transaction Objekt
   */
  async read(tx?: Transaction): Promise<Customizing> {
    if (tx) {
      return tx.run(SELECT.one.from(this.Customizing));
    }

    return SELECT.one.from(this.Customizing);
  }
}

export default CustomizingRepository;
