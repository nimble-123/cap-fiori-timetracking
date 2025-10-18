import { Request, Transaction } from '@sap/cds';
import { User } from '#cds-models/TrackService';
import { TimeCalculationService } from './TimeCalculationService';
import { UserRepository } from '../repositories';
import { CustomizingService } from './CustomizingService';
import { logger } from '../utils';

// Type definitions
interface UserResolveResult {
  userID: string;
  user: User;
}

/**
 * Service für User-bezogene Operationen
 * Verwaltet User-Daten und berechnet erwartete Arbeitszeiten
 */
export class UserService {
  private userRepository: UserRepository;
  private customizingService: CustomizingService;

  constructor(userRepository: UserRepository, customizingService: CustomizingService) {
    this.userRepository = userRepository;
    this.customizingService = customizingService;
  }

  /**
   * Lädt User und berechnet/aktualisiert erwartete Tagesstunden
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns Erwartete Tagesstunden
   */
  async getExpectedDailyHours(tx: Transaction, userId: string): Promise<number> {
    const user = await this.userRepository.findByIdActiveOrThrow(tx, userId);

    const userDefaults = this.customizingService.getUserDefaults();
    const weeklyHours = Number(user.weeklyHoursDec ?? userDefaults.fallbackWeeklyHours);
    const workingDays = Math.max(1, Number(user.workingDaysPerWeek ?? userDefaults.fallbackWorkingDays));
    const expectedDaily = TimeCalculationService.roundToTwoDecimals(weeklyHours / workingDays);

    // Update falls sich erwartete Tagesstunden geändert haben
    if (user.expectedDailyHoursDec !== expectedDaily) {
      await this.userRepository.updateExpectedDailyHours(tx, String(user.ID), expectedDaily);
    }

    return expectedDaily;
  }

  /**
   * Sucht User für Generierung mit Fallback-Logik
   * @param req - Request Objekt mit User-Kontext
   * @returns Promise mit userID und user Objekt
   */
  async resolveUserForGeneration(req: Request): Promise<UserResolveResult> {
    const TEST_USER_IDS = ['max.mustermann@test.de', 'erika.musterfrau@test.de', 'testuser1', 'user1'];

    const userDefaults = this.customizingService.getUserDefaults();
    const demoWeeklyHours = userDefaults.fallbackWeeklyHours;
    const demoWorkingDays = Math.max(1, userDefaults.fallbackWorkingDays);
    const demoExpectedDaily = TimeCalculationService.roundToTwoDecimals(demoWeeklyHours / demoWorkingDays);

    const DEMO_USER_ID = userDefaults.demoUserId;
    const demoUser = {
      ID: DEMO_USER_ID,
      name: 'Demo User',
      active: true,
      workingDaysPerWeek: demoWorkingDays,
      weeklyHoursDec: demoWeeklyHours,
      expectedDailyHoursDec: demoExpectedDaily,
    } as User;

    let userID: string = req.user?.id;

    if (!userID) {
      // Development Fallback: Suche nach Test-Usern
      const testUserResult = await this.userRepository.findFirstTestUser(TEST_USER_IDS);
      if (testUserResult) {
        logger.userOperation('Fallback', `Development fallback found: ${testUserResult.id}`, {
          userId: testUserResult.id,
          name: testUserResult.user.name,
        });
        return { userID: testUserResult.id, user: testUserResult.user };
      }

      logger.userOperation('Fallback', 'Using demo user (no authenticated user)');
      return { userID: DEMO_USER_ID, user: demoUser };
    }

    logger.userOperation('Auth', `Authenticated user: ${userID}`, { userID });

    try {
      const user = await this.userRepository.findByIdWithoutTx(userID);
      if (!user) {
        logger.userOperation('Fallback', `Authenticated user ${userID} not in DB, using demo user`, { userID });
        return { userID: DEMO_USER_ID, user: demoUser };
      }
      return { userID, user };
    } catch (error: any) {
      logger.userOperation('Fallback', `Error loading user, using demo user: ${error.message}`, { userID });
      return { userID: DEMO_USER_ID, user: demoUser };
    }
  }
}

export default UserService;
