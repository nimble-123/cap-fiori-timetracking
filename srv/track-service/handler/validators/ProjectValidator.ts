import { Transaction } from '@sap/cds';
import { ProjectRepository } from '../repositories/index.js';
import { logger } from '../utils/index.js';

/**
 * Validator für Project-Operationen
 * Validiert Project-Referenzen und Business Rules
 */
export class ProjectValidator {
  constructor(private projectRepository: ProjectRepository) {}

  /**
   * Validiert ob Projekt existiert und aktiv ist
   * @param tx - Transaction Objekt
   * @param projectId - Project ID
   * @throws Error wenn Projekt ungültig oder inaktiv
   */
  async validateActive(tx: Transaction, projectId: string): Promise<void> {
    const project = await this.projectRepository.findByIdActive(tx, projectId);

    if (!project) {
      logger.validationWarning('Project', 'Project invalid or inactive', { projectId });
      throw new Error('Projekt ist ungültig oder inaktiv.');
    }

    logger.validationSuccess('Project', 'Project is active', { projectId, name: project.name });
  }

  /**
   * Prüft ob Projekt existiert und aktiv ist
   * @param tx - Transaction Objekt
   * @param projectId - Project ID
   * @returns True wenn Projekt aktiv ist
   */
  async isActive(tx: Transaction, projectId: string): Promise<boolean> {
    const project = await this.projectRepository.findByIdActive(tx, projectId);
    return project !== null;
  }
}

export default ProjectValidator;
