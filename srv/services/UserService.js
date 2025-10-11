const TimeCalculationService = require('./TimeCalculationService');

/**
 * Service für User-bezogene Operationen
 * Verwaltet User-Daten und berechnet erwartete Arbeitszeiten
 */
class UserService {
  constructor(entities) {
    this.User = entities.User;
  }

  /**
   * Lädt User und berechnet/aktualisiert erwartete Tagesstunden
   * @param {Object} tx - Transaction Objekt
   * @param {string} userId - User ID
   * @returns {Promise<number>} Erwartete Tagesstunden
   */
  async getExpectedDailyHours(tx, userId) {
    const user = await tx.run(SELECT.one.from(this.User).where({ ID: userId, active: true }));

    if (!user) {
      throw new Error('User not found or inactive');
    }

    const weeklyHours = Number(user.weeklyHoursDec ?? 0);
    const workingDays = Math.max(1, Number(user.workingDaysPerWeek ?? 5));
    const expectedDaily = TimeCalculationService.roundToTwoDecimals(weeklyHours / workingDays);

    // Update falls sich erwartete Tagesstunden geändert haben
    if (user.expectedDailyHoursDec !== expectedDaily) {
      await tx.run(UPDATE(this.User, user.ID).set({ expectedDailyHoursDec: expectedDaily }));
    }

    return expectedDaily;
  }

  /**
   * Sucht User für Generierung mit Fallback-Logik
   * @param {Object} req - Request Objekt mit User-Kontext
   * @returns {Promise<{userID: string, user: Object}>}
   */
  async resolveUserForGeneration(req) {
    const TEST_USER_IDS = ['max.mustermann@test.de', 'erika.musterfrau@test.de', 'testuser1', 'user1'];

    const DEMO_USER = {
      ID: 'max.mustermann@test.de',
      name: 'Max Mustermann (Demo)',
      active: true,
      workingDaysPerWeek: 5,
      weeklyHoursDec: 36.0,
      expectedDailyHoursDec: 7.2,
    };

    let userID = req.user?.id || req.user?.email;

    if (!userID) {
      // Development Fallback: Suche nach Test-Usern
      for (const testId of TEST_USER_IDS) {
        const foundUser = await SELECT.one.from('io.nimble.User').where({ ID: testId });
        if (foundUser) {
          console.log(`💡 Development-Fallback: Gefunden ${testId} (${foundUser.name || 'Unbekannt'})`);
          return { userID: testId, user: foundUser };
        }
      }

      console.log('⚠️ Fallback auf Demo-User');
      return { userID: DEMO_USER.ID, user: DEMO_USER };
    }

    console.log(`✅ Authentifizierter User: ${userID}`);

    try {
      const user = await SELECT.one.from('io.nimble.User').where({ ID: userID });
      if (!user) {
        console.log(`⚠️ Authentifizierter User ${userID} nicht in DB, verwende Demo-User`);
        return { userID: DEMO_USER.ID, user: DEMO_USER };
      }
      return { userID, user };
    } catch (error) {
      console.log(`⚠️ Fehler beim User-Laden, verwende Demo-User: ${error.message}`);
      return { userID: DEMO_USER.ID, user: DEMO_USER };
    }
  }
}

module.exports = UserService;
