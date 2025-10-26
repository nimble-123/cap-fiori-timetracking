import { Transaction } from '@sap/cds';
import { User } from '#cds-models/TrackService';
import { logger } from '../utils/index.js';

/**
 * Repository für User Datenzugriff
 * Kapselt alle Datenbankoperationen für Users
 */
export class UserRepository {
  private Users: any;

  constructor(entities: any) {
    this.Users = entities.Users;
  }

  /**
   * Lädt User by ID (mit oder ohne active-Filter)
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param activeOnly - Nur aktive User laden (default: false)
   * @returns User oder null
   */
  async findById(tx: Transaction, userId: string, activeOnly: boolean = false): Promise<User | null> {
    const whereClause: any = { ID: userId };
    if (activeOnly) {
      whereClause.active = true;
    }

    return await tx.run(SELECT.one.from(this.Users).where(whereClause));
  }

  /**
   * Lädt aktiven User by ID oder wirft Fehler
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns User
   * @throws Error wenn User nicht gefunden oder inaktiv
   */
  async findByIdActiveOrThrow(tx: Transaction, userId: string): Promise<User> {
    logger.repositoryQuery('User', 'Finding active user by ID', { userId });
    const user = await this.findById(tx, userId, true);

    if (!user) {
      logger.repositoryResult('User', 'User not found or inactive', { userId });
      throw new Error('User not found or inactive');
    }

    logger.repositoryResult('User', 'Active user found', { userId, name: user.name });
    return user;
  }

  /**
   * Aktualisiert erwartete Tagesstunden für User
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @param expectedDailyHours - Erwartete Tagesstunden
   */
  async updateExpectedDailyHours(tx: Transaction, userId: string, expectedDailyHours: number): Promise<void> {
    await tx.run(UPDATE(this.Users, userId).set({ expectedDailyHoursDec: expectedDailyHours }));
  }

  /**
   * Sucht ersten existierenden User aus Liste von Test-IDs
   * @param testUserIds - Array von Test-User IDs
   * @returns User und ID oder null
   */
  async findFirstTestUser(testUserIds: string[]): Promise<{ id: string; user: User } | null> {
    for (const testId of testUserIds) {
      const foundUser = await SELECT.one.from(this.Users).where({ ID: testId });
      if (foundUser) {
        return { id: testId, user: foundUser };
      }
    }
    return null;
  }

  /**
   * Lädt User by ID (ohne Transaction, für Fallback-Szenarien)
   * @param userId - User ID
   * @returns User oder null
   */
  async findByIdWithoutTx(userId: string): Promise<User | null> {
    return await SELECT.one.from(this.Users).where({ ID: userId });
  }

  /**
   * Lädt mehrere User by IDs
   * @param tx - Transaction Objekt
   * @param userIds - Array von User IDs
   * @param activeOnly - Nur aktive User laden (default: false)
   * @returns Array von Users
   */
  async findByIds(tx: Transaction, userIds: string[], activeOnly: boolean = false): Promise<User[]> {
    const whereClause: any = { ID: { in: userIds } };
    if (activeOnly) {
      whereClause.active = true;
    }

    return await tx.run(SELECT.from(this.Users).where(whereClause));
  }

  /**
   * Lädt alle aktiven User
   * @param tx - Transaction Objekt
   * @returns Array von Users
   */
  async findAllActive(tx: Transaction): Promise<User[]> {
    return await tx.run(SELECT.from(this.Users).where({ active: true }));
  }
}

export default UserRepository;
