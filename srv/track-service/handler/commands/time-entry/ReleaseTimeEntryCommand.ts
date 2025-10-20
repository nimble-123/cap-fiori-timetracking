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
 * Command: Setzt ein TimeEntry auf Status "Released"
 */
export class ReleaseTimeEntryCommand {
  private repository: TimeEntryRepository;
  private customizingService: CustomizingService;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.customizingService = dependencies.customizingService;
  }

  async execute(tx: Transaction, entryId: string): Promise<TimeEntry> {
    const id = this.ensureId(entryId);
    logger.commandStart('ReleaseTimeEntry', { entryId: id });

    const entry = await this.repository.getById(tx, id);

    const defaults = this.customizingService.getTimeEntryDefaults();
    const releaseCode = defaults.statusReleasedCode;
    const statusCodes = [entry.status_code, releaseCode].filter(Boolean) as string[];

    const statusMap = await this.repository.getStatusMapByCodes(tx, statusCodes);
    const status = statusMap.get(entry.status_code as string);

    if (!status) {
      const error = new Error(`Status für TimeEntry ${entry.ID} wurde nicht gefunden.`) as any;
      error.code = 400;
      throw error;
    }

    if (entry.status_code === releaseCode) {
      logger.commandEnd('ReleaseTimeEntry', { updated: false });
      return entry;
    }

    if (!status.allowReleaseAction) {
      const error = new Error('Der Status erlaubt die Aktion "Release" nicht.') as any;
      error.code = 409;
      throw error;
    }

    if (status.to_code && status.to_code !== releaseCode) {
      const error = new Error('Die Stammdaten erlauben keine Transition zum Status "Released".') as any;
      error.code = 409;
      throw error;
    }

    await this.repository.updateStatusBatch(tx, [id], releaseCode);
    const updatedEntry = await this.repository.getById(tx, id);

    logger.commandEnd('ReleaseTimeEntry', { updated: true });
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

export default ReleaseTimeEntryCommand;
