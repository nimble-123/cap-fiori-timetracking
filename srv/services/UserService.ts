import { Request, Transaction } from '@sap/cds';
import { User } from '#cds-models/TrackService';
import { TimeCalculationService } from './TimeCalculationService';

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
  private Users: any;

  constructor(entities: any) {
    this.Users = entities.Users;
  }

  /**
   * Lädt User und berechnet/aktualisiert erwartete Tagesstunden
   * @param tx - Transaction Objekt
   * @param userId - User ID
   * @returns Erwartete Tagesstunden
   */
  async getExpectedDailyHours(tx: Transaction, userId: string): Promise<number> {
    const user = await tx.run(SELECT.one.from(this.Users).where({ ID: userId, active: true }));

    if (!user) {
      throw new Error('User not found or inactive');
    }

    const weeklyHours = Number(user.weeklyHoursDec ?? 0);
    const workingDays = Math.max(1, Number(user.workingDaysPerWeek ?? 5));
    const expectedDaily = TimeCalculationService.roundToTwoDecimals(weeklyHours / workingDays);

    // Update falls sich erwartete Tagesstunden geändert haben
    if (user.expectedDailyHoursDec !== expectedDaily) {
      await tx.run(UPDATE(this.Users, user.ID).set({ expectedDailyHoursDec: expectedDaily }));
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

    const DEMO_USER_ID = 'max.mustermann@test.de';
    const DEMO_USER = {
      ID: DEMO_USER_ID,
      name: 'Max Mustermann (Demo)',
      active: true,
      workingDaysPerWeek: 5,
      weeklyHoursDec: 36.0,
      expectedDailyHoursDec: 7.2,
    } as User;

    let userID: string = req.user?.id;

    if (!userID) {
      // Development Fallback: Suche nach Test-Usern
      for (const testId of TEST_USER_IDS) {
        const foundUser = await SELECT.one.from(this.Users).where({ ID: testId });
        if (foundUser) {
          console.log(`💡 Development-Fallback: Gefunden ${testId} (${foundUser.name || 'Unbekannt'})`);
          return { userID: testId, user: foundUser };
        }
      }

      console.log('⚠️ Fallback auf Demo-User');
      return { userID: DEMO_USER_ID, user: DEMO_USER };
    }

    console.log(`✅ Authentifizierter User: ${userID}`);

    try {
      const user = await SELECT.one.from(this.Users).where({ ID: userID });
      if (!user) {
        console.log(`⚠️ Authentifizierter User ${userID} nicht in DB, verwende Demo-User`);
        return { userID: DEMO_USER_ID, user: DEMO_USER };
      }
      return { userID, user };
    } catch (error: any) {
      console.log(`⚠️ Fehler beim User-Laden, verwende Demo-User: ${error.message}`);
      return { userID: DEMO_USER_ID, user: DEMO_USER };
    }
  }
}

export default UserService;
