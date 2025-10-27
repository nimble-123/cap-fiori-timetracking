import { Transaction } from '@sap/cds';
import { TimeEntry } from '#cds-models/TrackService';
import { TimeEntryRepository } from '../../repositories';
import { CustomizingService } from '../../services';
import { logger } from '../../utils';

interface Dependencies {
  repository: TimeEntryRepository;
  customizingService: CustomizingService;
}

/**
 * Command: Setzt ein TimeEntry auf Status "Done"
 */
export class MarkTimeEntryDoneCommand {
  private repository: TimeEntryRepository;
  private customizingService: CustomizingService;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.customizingService = dependencies.customizingService;
  }

  async execute(tx: Transaction, entryId: string): Promise<TimeEntry> {
    const id = this.ensureId(entryId);
    logger.commandStart('MarkTimeEntryDone', { entryId: id });

    const entry = await this.repository.getById(tx, id);

    const defaults = this.customizingService.getTimeEntryDefaults();
    const doneCode = defaults.statusDoneCode;
    const releaseCode = defaults.statusReleasedCode;

    const statusCodes = [entry.status_code, doneCode, releaseCode].filter(Boolean) as string[];
    const statusMap = await this.repository.getStatusMapByCodes(tx, statusCodes);
    const status = statusMap.get(entry.status_code as string);

    if (!status) {
      const error = new Error(`Status für TimeEntry ${entry.ID} wurde nicht gefunden.`) as any;
      error.code = 400;
      throw error;
    }

    if (entry.status_code === releaseCode) {
      const error = new Error('Freigegebene TimeEntries können nicht auf "Done" gesetzt werden.') as any;
      error.code = 409;
      throw error;
    }

    if (entry.status_code === doneCode) {
      logger.commandEnd('MarkTimeEntryDone', { updated: false });
      return entry;
    }

    if (!status.allowDoneAction) {
      const error = new Error('Der Status erlaubt die Aktion "Done" nicht.') as any;
      error.code = 409;
      throw error;
    }

    if (status.to_code && status.to_code !== doneCode) {
      const error = new Error('Die Stammdaten erlauben keine Transition zum Status "Done".') as any;
      error.code = 409;
      throw error;
    }

    await this.repository.updateStatusBatch(tx, [id], doneCode);
    const updatedEntry = await this.repository.getById(tx, id);

    logger.commandEnd('MarkTimeEntryDone', { updated: true });
    return updatedEntry;
  }

  private ensureId(entryId?: string): string {
    if (typeof entryId === 'string' && entryId.length) {
      return entryId;
    }

    const error = new Error('TimeEntry ID ist erforderlich.') as any;
    error.code = 400;
    throw error;
  }
}

export default MarkTimeEntryDoneCommand;
