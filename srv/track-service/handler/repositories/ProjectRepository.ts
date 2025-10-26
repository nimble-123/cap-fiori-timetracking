import { Transaction } from '@sap/cds';
import { Project } from '#cds-models/TrackService';
import { logger } from '../utils/index.js';

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
    logger.repositoryQuery('Project', 'Finding project by ID', { projectId, activeOnly });

    const whereClause: any = { ID: projectId };
    if (activeOnly) {
      whereClause.active = true;
    }

    const project = await tx.run(SELECT.one.from(this.Projects).where(whereClause));

    logger.repositoryResult('Project', project ? 'Project found' : 'Project not found', {
      projectId,
      found: !!project,
    });

    return project;
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
   * Lädt alle aktiven Projekte
   * @param tx - Transaction Objekt
   * @returns Array von Projects
   */
  async findAllActive(tx: Transaction): Promise<Project[]> {
    logger.repositoryQuery('Project', 'Finding all active projects', {});
    const projects = await tx.run(SELECT.from(this.Projects).where({ active: true }));
    logger.repositoryResult('Project', 'Active projects loaded', { count: projects.length });
    return projects;
  }

  /**
   * Lädt alle Projekte
   * @param tx - Transaction Objekt
   * @returns Array von Projects
   */
  async findAll(tx: Transaction): Promise<Project[]> {
    logger.repositoryQuery('Project', 'Finding all projects', {});
    const projects = await tx.run(SELECT.from(this.Projects));
    logger.repositoryResult('Project', 'All projects loaded', { count: projects.length });
    return projects;
  }
}

export default ProjectRepository;
