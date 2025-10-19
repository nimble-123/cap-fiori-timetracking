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
 * Command: Setzt TimeEntries auf Status "Released"
 */
export class ReleaseTimeEntriesCommand {
  private repository: TimeEntryRepository;
  private customizingService: CustomizingService;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.customizingService = dependencies.customizingService;
  }

  async execute(tx: Transaction, entryIds: string[]): Promise<TimeEntry[]> {
    logger.commandStart('ReleaseTimeEntries', { count: entryIds?.length ?? 0 });

    const ids = this.normalizeIds(entryIds);
    if (!ids.length) {
      const error = new Error('Keine TimeEntry IDs übergeben.') as any;
      error.code = 400;
      throw error;
    }

    const entries = await this.repository.getByIds(tx, ids);
    this.ensureAllFound(ids, entries);

    const defaults = this.customizingService.getTimeEntryDefaults();
    const releaseCode = defaults.statusReleasedCode;
    const statusCodes = entries.map((entry) => entry.status_code).filter(Boolean) as string[];
    statusCodes.push(releaseCode);

    const statusMap = await this.repository.getStatusMapByCodes(tx, statusCodes);
    const updatableIds: string[] = [];

    for (const entry of entries) {
      const status = statusMap.get(entry.status_code as string);

      if (!status) {
        const error = new Error(`Status für TimeEntry ${entry.ID} wurde nicht gefunden.`) as any;
        error.code = 400;
        throw error;
      }

      if (entry.status_code === releaseCode) {
        // Bereits freigegeben – überspringen
        continue;
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

      updatableIds.push(entry.ID as string);
    }

    if (updatableIds.length) {
      await this.repository.updateStatusBatch(tx, updatableIds, releaseCode);
    }

    const updatedEntries = await this.repository.getByIds(tx, ids);
    logger.commandEnd('ReleaseTimeEntries', { updated: updatableIds.length });
    return updatedEntries;
  }

  private normalizeIds(ids?: string[]): string[] {
    if (!Array.isArray(ids)) {
      return [];
    }
    return Array.from(new Set(ids.filter((id) => typeof id === 'string' && id.length)));
  }

  private ensureAllFound(ids: string[], entries: TimeEntry[]): void {
    const foundIds = new Set(entries.map((entry) => entry.ID));
    const missing = ids.filter((id) => !foundIds.has(id));

    if (missing.length) {
      const error = new Error(`TimeEntries nicht gefunden: ${missing.join(', ')}`) as any;
      error.code = 404;
      throw error;
    }
  }
}

export default ReleaseTimeEntriesCommand;
