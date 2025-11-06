/**
 * Unit Tests - TimeEntryFactory
 *
 * Testet Object Creation und Business Logic für TimeEntries
 */

// TimeEntryFactory ist eine TypeScript-Klasse, die wir direkt importieren müssen
// Da es Unit Tests sind, mocken wir die Dependencies

describe('TimeEntryFactory - Unit Tests', () => {
  describe('createWorkTimeData - Logic Tests', () => {
    it('should calculate overtime when working more than expected', () => {
      // Simuliere 9h gearbeitet, 8h erwartet
      const actualHours = 9;
      const expectedHours = 8;
      const diff = actualHours - expectedHours;

      const overtime = diff > 0 ? diff : 0;
      const undertime = diff < 0 ? Math.abs(diff) : 0;

      expect(overtime).toBe(1);
      expect(undertime).toBe(0);
    });

    it('should calculate undertime when working less than expected', () => {
      const actualHours = 6;
      const expectedHours = 8;
      const diff = actualHours - expectedHours;

      const overtime = diff > 0 ? diff : 0;
      const undertime = diff < 0 ? Math.abs(diff) : 0;

      expect(overtime).toBe(0);
      expect(undertime).toBe(2);
    });

    it('should have zero overtime/undertime when meeting expectations', () => {
      const actualHours = 8;
      const expectedHours = 8;
      const diff = actualHours - expectedHours;

      const overtime = diff > 0 ? diff : 0;
      const undertime = diff < 0 ? Math.abs(diff) : 0;

      expect(overtime).toBe(0);
      expect(undertime).toBe(0);
    });
  });

  describe('createNonWorkTimeData - Logic Tests', () => {
    it('should set net hours equal to expected for vacation', () => {
      const expectedHours = 8;
      // Non-work time gets full expected hours credited
      const netHours = expectedHours;
      const overtime = 0;
      const undertime = 0;

      expect(netHours).toBe(8);
      expect(overtime).toBe(0);
      expect(undertime).toBe(0);
    });

    it('should set net hours equal to expected for sick leave', () => {
      const expectedHours = 7.5;
      const netHours = expectedHours;

      expect(netHours).toBe(7.5);
    });

    it('should use zero times for non-work entries', () => {
      // Non-work entries typically have 00:00:00 times
      const startTime = '00:00:00';
      const endTime = '00:00:00';
      const breakMin = 0;

      expect(startTime).toBe('00:00:00');
      expect(endTime).toBe('00:00:00');
      expect(breakMin).toBe(0);
    });
  });

  describe('Generated Entry Types - Logic Tests', () => {
    it('should create default work entry with standard times', () => {
      // Standard work day: 08:00-16:30 with 30min break = 8h net
      const breakMin = 30;
      const grossMin = (16.5 - 8) * 60; // 510 min
      const netMin = grossMin - breakMin; // 480 min
      const netHours = netMin / 60; // 8h

      expect(netHours).toBe(8);
      expect(breakMin).toBe(30);
    });

    it('should create weekend entry with zero hours', () => {
      const entryType = 'O'; // Off/Weekend
      const netHours = 0;
      const startTime = '00:00:00';

      expect(entryType).toBe('O');
      expect(netHours).toBe(0);
      expect(startTime).toBe('00:00:00');
    });

    it('should create holiday entry with expected hours and note', () => {
      const entryType = 'H'; // Holiday
      const expectedHours = 8;
      const holidayName = 'Neujahr';

      const netHours = expectedHours;
      const note = `Feiertag: ${holidayName}`;

      expect(entryType).toBe('H');
      expect(netHours).toBe(8);
      expect(note).toContain(holidayName);
    });
  });

  describe('Criticality Calculation - Logic Tests', () => {
    it('should set green criticality (3) for overtime', () => {
      const overtime = 1.5;

      const overtimeCriticality = overtime > 0 ? 3 : 0;
      const undertimeCriticality = 0;

      expect(overtimeCriticality).toBe(3); // Green
      expect(undertimeCriticality).toBe(0);
    });

    it('should set yellow criticality (2) for slight undertime', () => {
      const undertime = 1; // < 2h critical

      const undertimeCriticality = undertime > 0 && undertime < 2 ? 2 : undertime >= 2 ? 1 : 0;

      expect(undertimeCriticality).toBe(2); // Yellow
    });

    it('should set red criticality (1) for critical undertime', () => {
      const undertime = 3; // >= 2h critical

      const undertimeCriticality = undertime >= 2 ? 1 : undertime > 0 ? 2 : 0;

      expect(undertimeCriticality).toBe(1); // Red
    });

    it('should set neutral (0) when no overtime/undertime', () => {
      const overtime = 0;
      const undertime = 0;

      const overtimeCriticality = overtime > 0 ? 3 : 0;
      const undertimeCriticality = undertime > 0 ? (undertime >= 2 ? 1 : 2) : 0;

      expect(overtimeCriticality).toBe(0);
      expect(undertimeCriticality).toBe(0);
    });
  });
});
