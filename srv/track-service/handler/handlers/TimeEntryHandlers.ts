import cds from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import {
  CreateTimeEntryCommand,
  UpdateTimeEntryCommand,
  RecalculateTimeEntryCommand,
  MarkTimeEntriesDoneCommand,
  ReleaseTimeEntriesCommand,
} from '../commands';
import { logger } from '../utils';

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
    private recalculateCommand: RecalculateTimeEntryCommand,
    private markDoneCommand: MarkTimeEntriesDoneCommand,
    private releaseCommand: ReleaseTimeEntriesCommand,
  ) {}

  /**
   * Handler: TimeEntry erstellen (before CREATE)
   *
   * Validiert und berechnet Daten vor dem Anlegen eines neuen TimeEntry.
   * Nutzt CreateTimeEntryCommand für Business Logic.
   */
  async handleCreate(req: any): Promise<void> {
    try {
      logger.handlerInvoked('TimeEntry', 'CREATE', { workDate: req.data?.workDate });
      const tx = cds.transaction(req) as any;
      const calculatedData = await this.createCommand.execute(tx, req.data as TimeEntry);

      // Berechnete Daten in Request übernehmen
      Object.assign(req.data, calculatedData);
      logger.handlerCompleted('TimeEntry', 'CREATE', { workDate: req.data.workDate });
    } catch (error: any) {
      logger.error('TimeEntry CREATE handler failed', error, { workDate: req.data?.workDate });
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
        logger.validationWarning('TimeEntry', 'UPDATE attempted without ID');
        return req.reject(400, 'TimeEntry ID ist erforderlich.');
      }

      logger.handlerInvoked('TimeEntry', 'UPDATE', { entryId });
      const calculatedData = await this.updateCommand.execute(tx, entryId, req.data);

      // Berechnete Daten in Request übernehmen
      Object.assign(req.data, calculatedData);
      logger.handlerCompleted('TimeEntry', 'UPDATE', { entryId });
    } catch (error: any) {
      logger.error('TimeEntry UPDATE handler failed', error, { entryId: req.data.ID || req.params?.[0] });
      req.reject(error.code || 400, error.message);
    }
  }

  /**
   * Handler: TimeEntry löschen (before DELETE)
   *
   * Verhindert das Löschen von TimeEntries (Business Rule).
   */
  handleDelete(req: any): void {
    logger.handlerInvoked('TimeEntry', 'DELETE', { entryId: req.params?.[0] });
    logger.validationWarning('TimeEntry', 'DELETE operation prevented (business rule)', { entryId: req.params?.[0] });
    req.reject(405, 'Löschen von TimeEntries ist nicht erlaubt.');
  }

  /**
   * Handler: TimeEntry neu berechnen (Bound Action)
   *
   * Berechnet alle Zeitwerte basierend auf aktuellen Daten und User-Sollstunden.
   */
  async handleRecalculate(req: any): Promise<TimeEntry> {
    try {
      const tx = cds.transaction(req) as any;
      const entryId = req.params[0]?.ID || req.params[0];

      if (!entryId) {
        logger.validationWarning('TimeEntry', 'RECALCULATE attempted without ID');
        return req.reject(400, 'TimeEntry ID ist erforderlich.');
      }

      logger.handlerInvoked('TimeEntry', 'RECALCULATE', { entryId });

      const updatedEntry = await this.recalculateCommand.execute(tx, entryId);

      logger.handlerCompleted('TimeEntry', 'RECALCULATE', { entryId });

      return updatedEntry;
    } catch (error: any) {
      logger.error('TimeEntry RECALCULATE handler failed', error, { entryId: req.params?.[0] });
      return req.reject(error.code || 400, error.message);
    }
  }

  /**
   * Handler: Mehrere TimeEntries auf "Done" setzen (Unbound Action)
   */
  async handleMarkDone(req: any): Promise<TimeEntry[]> {
    try {
      const tx = cds.transaction(req) as any;
      const entryIds = req.data?.entryIDs ?? [];
      logger.handlerInvoked('TimeEntry', 'MARK_DONE', { count: entryIds.length });
      const updatedEntries = await this.markDoneCommand.execute(tx, entryIds);
      logger.handlerCompleted('TimeEntry', 'MARK_DONE', { count: updatedEntries.length });
      return updatedEntries;
    } catch (error: any) {
      logger.error('TimeEntry MARK_DONE handler failed', error, { entryIDs: req.data?.entryIDs });
      return req.reject(error.code || 400, error.message);
    }
  }

  /**
   * Handler: Mehrere TimeEntries auf "Released" setzen (Unbound Action)
   */
  async handleRelease(req: any): Promise<TimeEntry[]> {
    try {
      const tx = cds.transaction(req) as any;
      const entryIds = req.data?.entryIDs ?? [];
      logger.handlerInvoked('TimeEntry', 'RELEASE', { count: entryIds.length });
      const updatedEntries = await this.releaseCommand.execute(tx, entryIds);
      logger.handlerCompleted('TimeEntry', 'RELEASE', { count: updatedEntries.length });
      return updatedEntries;
    } catch (error: any) {
      logger.error('TimeEntry RELEASE handler failed', error, { entryIDs: req.data?.entryIDs });
      return req.reject(error.code || 400, error.message);
    }
  }
}
