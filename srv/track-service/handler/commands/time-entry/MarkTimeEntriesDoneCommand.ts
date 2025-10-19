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
 * Command: Setzt TimeEntries auf Status "Done"
 */
export class MarkTimeEntriesDoneCommand {
  private repository: TimeEntryRepository;
  private customizingService: CustomizingService;

  constructor(dependencies: Dependencies) {
    this.repository = dependencies.repository;
    this.customizingService = dependencies.customizingService;
  }

  async execute(tx: Transaction, entryIds: string[]): Promise<TimeEntry[]> {
    logger.commandStart('MarkTimeEntriesDone', { count: entryIds?.length ?? 0 });

    const ids = this.normalizeIds(entryIds);
    if (!ids.length) {
      const error = new Error('Keine TimeEntry IDs übergeben.') as any;
      error.code = 400;
      throw error;
    }

    const entries = await this.repository.getByIds(tx, ids);
    this.ensureAllFound(ids, entries);

    const defaults = this.customizingService.getTimeEntryDefaults();
    const doneCode = defaults.statusDoneCode;
    const releaseCode = defaults.statusReleasedCode;

    const statusCodes = entries.map((entry) => entry.status_code).filter(Boolean) as string[];
    statusCodes.push(doneCode, releaseCode);
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
        const error = new Error('Freigegebene TimeEntries können nicht auf "Done" gesetzt werden.') as any;
        error.code = 409;
        throw error;
      }

      if (entry.status_code === doneCode) {
        // Bereits erledigt - keine Aktualisierung nötig, aber nicht fehlschlagen
        continue;
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

      updatableIds.push(entry.ID as string);
    }

    if (updatableIds.length) {
      await this.repository.updateStatusBatch(tx, updatableIds, doneCode);
    }

    const updatedEntries = await this.repository.getByIds(tx, ids);
    logger.commandEnd('MarkTimeEntriesDone', { updated: updatableIds.length });
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

export default MarkTimeEntriesDoneCommand;
