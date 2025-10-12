import { Transaction } from '@sap/cds';
import { Project } from '#cds-models/TrackService';
import { logger } from '../utils';

/**
 * Repository für Project Datenzugriff
 * Kapselt alle Datenbankoperationen für Projects
 */
export class ProjectRepository {
  private Projects: any;

  constructor(entities: any) {
    this.Projects = entities.Projects;
  }

  /**
   * Lädt Projekt by ID
   * @param tx - Transaction Objekt
   * @param projectId - Project ID
   * @param activeOnly - Nur aktive Projekte laden (default: false)
   * @returns Project oder null
   */
  async findById(tx: Transaction, projectId: string, activeOnly: boolean = false): Promise<Project | null> {
    const whereClause: any = { ID: projectId };
    if (activeOnly) {
      whereClause.active = true;
    }

    return await tx.run(SELECT.one.from(this.Projects).where(whereClause));
  }

  /**
   * Lädt aktives Projekt by ID
   * @param tx - Transaction Objekt
   * @param projectId - Project ID
   * @returns Project oder null
   */
  async findByIdActive(tx: Transaction, projectId: string): Promise<Project | null> {
    return await this.findById(tx, projectId, true);
  }

  /**
   * Prüft ob Projekt existiert und aktiv ist
   * @param tx - Transaction Objekt
   * @param projectId - Project ID
   * @returns True wenn Projekt aktiv ist
   */
  async isActive(tx: Transaction, projectId: string): Promise<boolean> {
    const project = await this.findByIdActive(tx, projectId);
    return project !== null;
  }

  /**
   * Validiert ob Projekt existiert und aktiv ist, wirft Fehler falls nicht
   * @param tx - Transaction Objekt
   * @param projectId - Project ID
   * @throws Error wenn Projekt ungültig oder inaktiv
   */
  async validateActive(tx: Transaction, projectId: string): Promise<void> {
    logger.repositoryQuery('Project', 'Validating active project', { projectId });
    const project = await this.findByIdActive(tx, projectId);

    if (!project) {
      logger.repositoryResult('Project', 'Project invalid or inactive', { projectId });
      throw new Error('Projekt ist ungültig oder inaktiv.');
    }

    logger.repositoryResult('Project', 'Project validated', { projectId, name: project.name });
  }

  /**
   * Lädt alle aktiven Projekte
   * @param tx - Transaction Objekt
   * @returns Array von Projects
   */
  async findAllActive(tx: Transaction): Promise<Project[]> {
    return await tx.run(SELECT.from(this.Projects).where({ active: true }));
  }

  /**
   * Lädt alle Projekte
   * @param tx - Transaction Objekt
   * @returns Array von Projects
   */
  async findAll(tx: Transaction): Promise<Project[]> {
    return await tx.run(SELECT.from(this.Projects));
  }
}

export default ProjectRepository;
