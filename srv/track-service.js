// srv/track-service.js
const cds = require('@sap/cds');

// Import Design Pattern Classes
const UserService = require('./services/UserService');
const TimeEntryRepository = require('./repositories/TimeEntryRepository');
const TimeEntryValidator = require('./validators/TimeEntryValidator');
const TimeEntryFactory = require('./factories/TimeEntryFactory');
const MonthlyGenerationStrategy = require('./strategies/MonthlyGenerationStrategy');
const { CreateTimeEntryCommand, UpdateTimeEntryCommand } = require('./commands/TimeEntryCommands');

module.exports = cds.service.impl(function () {
  const entities = this.entities;

  // ----------------- Dependency Injection Setup -----------------

  const userService = new UserService(entities);
  const repository = new TimeEntryRepository(entities);
  const validator = new TimeEntryValidator(entities);
  const generationStrategy = new MonthlyGenerationStrategy();

  const dependencies = {
    userService,
    validator,
    repository,
    factory: TimeEntryFactory,
  };
  const createCommand = new CreateTimeEntryCommand(dependencies);
  const updateCommand = new UpdateTimeEntryCommand(dependencies);

  // --------------- CRUD Event Handlers ---------------

  /**
   * CREATE Handler für TimeEntries
   */
  this.before('CREATE', 'TimeEntries', async (req) => {
    try {
      const tx = cds.transaction(req);
      const calculatedData = await createCommand.execute(tx, req.data);
      Object.assign(req.data, calculatedData);
    } catch (error) {
      req.reject(error.code || 400, error.message);
    }
  });

  /**
   * UPDATE Handler für TimeEntries
   */
  this.before('UPDATE', 'TimeEntries', async (req) => {
    try {
      const tx = cds.transaction(req);
      const entryId = req.data.ID || req.params?.[0];

      if (!entryId) {
        return req.reject(400, 'TimeEntry ID ist erforderlich.');
      }

      const calculatedData = await updateCommand.execute(tx, entryId, req.data);
      Object.assign(req.data, calculatedData);
    } catch (error) {
      req.reject(error.code || 400, error.message);
    }
  });

  /**
   * DELETE Handler für TimeEntries - verhindert Löschungen
   */
  this.before('DELETE', 'TimeEntries', (req) => {
    req.reject(405, 'Löschen von TimeEntries ist nicht erlaubt.');
  });

  // ----------------- Monthly Time Entry Generation Action -----------------

  /**
   * Action: Generiere monatliche TimeEntries
   */
  this.on('generateMonthlyTimeEntries', async (req) => {
    try {
      console.log('🚀 Action generateMonthlyTimeEntries aufgerufen');

      // User ermitteln und validieren
      const { userID, user } = await userService.resolveUserForGeneration(req);
      if (!user) {
        console.error(`❌ User ${userID} nicht verfügbar`);
        return req.reject(404, 'User nicht verfügbar.');
      }
      console.log(`✅ User gefunden: ${user.name} (${userID})`);

      // Monatsdaten bestimmen
      const monthData = generationStrategy.getCurrentMonthData();

      // Existierende Einträge laden
      const existingDates = await repository.getExistingDatesInRange(
        userID,
        monthData.monthStartStr,
        monthData.monthEndStr,
      );

      // Neue Einträge generieren
      const newEntries = generationStrategy.generateMissingEntries(userID, user, monthData, existingDates);

      // In DB persistieren
      await repository.insertBatch(newEntries);

      // Alle Monatseinträge für UI-Refresh zurückgeben
      const allMonthEntries = await repository.getEntriesInRange(
        userID,
        monthData.monthStartStr,
        monthData.monthEndStr,
      );

      console.log(
        `🔄 Gebe ${allMonthEntries.length} TimeEntries für UI-Refresh zurück (${newEntries.length} neu erstellt)`,
      );

      return allMonthEntries;
    } catch (error) {
      console.error('❌ Fehler in generateMonthlyTimeEntries:', error);
      return req.reject(500, `Fehler beim Generieren der TimeEntries: ${error.message}`);
    }
  });
});
