import cds from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { CreateTimeEntryCommand, UpdateTimeEntryCommand } from '../commands/TimeEntryCommands';

/**
 * Handler für TimeEntry CRUD-Operationen
 *
 * Verwaltet CREATE, UPDATE und DELETE Events für TimeEntries.
 * Delegiert Geschäftslogik an Commands.
 */
export class TimeEntryHandlers {
  constructor(
    private createCommand: CreateTimeEntryCommand,
    private updateCommand: UpdateTimeEntryCommand,
  ) {}

  /**
   * Handler: TimeEntry erstellen (before CREATE)
   *
   * Validiert und berechnet Daten vor dem Anlegen eines neuen TimeEntry.
   * Nutzt CreateTimeEntryCommand für Business Logic.
   */
  async handleCreate(req: any): Promise<void> {
    try {
      const tx = cds.transaction(req) as any;
      const calculatedData = await this.createCommand.execute(tx, req.data as TimeEntry);

      // Berechnete Daten in Request übernehmen
      Object.assign(req.data, calculatedData);
    } catch (error: any) {
      req.reject(error.code || 400, error.message);
    }
  }

  /**
   * Handler: TimeEntry aktualisieren (before UPDATE)
   *
   * Validiert und berechnet Daten vor dem Update eines TimeEntry.
   * Nutzt UpdateTimeEntryCommand für Business Logic.
   */
  async handleUpdate(req: any): Promise<void> {
    try {
      const tx = cds.transaction(req) as any;
      const entryId = req.data.ID || req.params?.[0];

      if (!entryId) {
        return req.reject(400, 'TimeEntry ID ist erforderlich.');
      }

      const calculatedData = await this.updateCommand.execute(tx, entryId, req.data);

      // Berechnete Daten in Request übernehmen
      Object.assign(req.data, calculatedData);
    } catch (error: any) {
      req.reject(error.code || 400, error.message);
    }
  }

  /**
   * Handler: TimeEntry löschen (before DELETE)
   *
   * Verhindert das Löschen von TimeEntries (Business Rule).
   */
  handleDelete(req: any): void {
    req.reject(405, 'Löschen von TimeEntries ist nicht erlaubt.');
  }
}
