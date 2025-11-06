/**
 * Unit Tests - TimeCalculationService
 *
 * Testet reine Funktionen für Zeitberechnungen ohne DB-Zugriff
 */
const { TimeCalculationService } = require('../../srv/track-service/handler/services/TimeCalculationService');

describe('TimeCalculationService - Unit Tests', () => {
  describe('timeToMinutes', () => {
    it('should convert HH:MM:SS to minutes', () => {
      expect(TimeCalculationService.timeToMinutes('08:30:00')).toBe(510); // 8*60 + 30
      expect(TimeCalculationService.timeToMinutes('12:45:30')).toBe(765); // 12*60 + 45
      expect(TimeCalculationService.timeToMinutes('00:15:00')).toBe(15);
    });

    it('should convert HH:MM to minutes', () => {
      expect(TimeCalculationService.timeToMinutes('08:30')).toBe(510);
      expect(TimeCalculationService.timeToMinutes('23:59')).toBe(1439);
    });

    it('should handle null and undefined', () => {
      expect(TimeCalculationService.timeToMinutes(null)).toBe(0);
      expect(TimeCalculationService.timeToMinutes(undefined)).toBe(0);
      expect(TimeCalculationService.timeToMinutes('')).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(TimeCalculationService.timeToMinutes('00:00:00')).toBe(0);
      expect(TimeCalculationService.timeToMinutes('24:00:00')).toBe(1440);
    });
  });

  describe('roundToTwoDecimals', () => {
    it('should round to 2 decimal places', () => {
      expect(TimeCalculationService.roundToTwoDecimals(7.505)).toBe(7.51);
      expect(TimeCalculationService.roundToTwoDecimals(7.504)).toBe(7.5);
      expect(TimeCalculationService.roundToTwoDecimals(7.123456)).toBe(7.12);
    });

    it('should handle integers', () => {
      expect(TimeCalculationService.roundToTwoDecimals(8)).toBe(8);
      expect(TimeCalculationService.roundToTwoDecimals(0)).toBe(0);
    });

    it('should handle negative numbers', () => {
      expect(TimeCalculationService.roundToTwoDecimals(-7.505)).toBe(-7.5); // Math.round rounds towards zero for negatives
      expect(TimeCalculationService.roundToTwoDecimals(-2.125)).toBe(-2.12);
      expect(TimeCalculationService.roundToTwoDecimals(-10.999)).toBe(-11);
    });
  });

  describe('calculateWorkingHours', () => {
    it('should calculate standard work day (8h with 30min break)', () => {
      const result = TimeCalculationService.calculateWorkingHours('08:00:00', '16:30:00', 30);

      expect(result.error).toBeUndefined();
      expect(result.grossMinutes).toBe(510); // 8.5 hours = 510 minutes
      expect(result.breakMinutes).toBe(30);
      expect(result.netMinutes).toBe(480); // 8 hours = 480 minutes
      expect(result.netHours).toBe(8);
    });

    it('should calculate part-time work (4h with 0 break)', () => {
      const result = TimeCalculationService.calculateWorkingHours('09:00:00', '13:00:00', 0);

      expect(result.error).toBeUndefined();
      expect(result.netMinutes).toBe(240); // 4 hours
      expect(result.netHours).toBe(4);
    });

    it('should calculate with 60min break', () => {
      const result = TimeCalculationService.calculateWorkingHours('08:00:00', '17:00:00', 60);

      expect(result.error).toBeUndefined();
      expect(result.grossMinutes).toBe(540); // 9 hours
      expect(result.netMinutes).toBe(480); // 8 hours net
      expect(result.netHours).toBe(8);
    });

    it('should reject end time before start time', () => {
      const result = TimeCalculationService.calculateWorkingHours('16:00:00', '08:00:00', 0);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Endzeit muss nach Startzeit liegen');
    });

    it('should reject break longer than gross time', () => {
      const result = TimeCalculationService.calculateWorkingHours('08:00:00', '12:00:00', 300);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Pause darf nicht länger als Bruttozeit sein');
    });

    it('should treat negative break as zero', () => {
      const result = TimeCalculationService.calculateWorkingHours('08:00:00', '16:00:00', -30);

      expect(result.error).toBeUndefined();
      expect(result.breakMinutes).toBe(0); // Negative break becomes 0
      expect(result.netMinutes).toBe(480);
    });

    it('should handle same start and end time', () => {
      const result = TimeCalculationService.calculateWorkingHours('08:00:00', '08:00:00', 0);

      expect(result.error).toBeDefined();
      expect(result.error).toContain('Endzeit muss nach Startzeit liegen');
    });
  });

  describe('calculateOvertimeAndUndertime', () => {
    it('should calculate overtime when working more', () => {
      const result = TimeCalculationService.calculateOvertimeAndUndertime(9, 8);

      expect(result.overtime).toBe(1);
      expect(result.undertime).toBe(0);
    });

    it('should calculate undertime when working less', () => {
      const result = TimeCalculationService.calculateOvertimeAndUndertime(6, 8);

      expect(result.overtime).toBe(0);
      expect(result.undertime).toBe(2);
    });

    it('should have zero for both when exactly meeting expected hours', () => {
      const result = TimeCalculationService.calculateOvertimeAndUndertime(8, 8);

      expect(result.overtime).toBe(0);
      expect(result.undertime).toBe(0);
    });

    it('should handle decimal hours', () => {
      const result = TimeCalculationService.calculateOvertimeAndUndertime(7.5, 8);

      expect(result.overtime).toBe(0);
      expect(result.undertime).toBe(0.5);
    });

    it('should round overtime/undertime to 2 decimals', () => {
      const result = TimeCalculationService.calculateOvertimeAndUndertime(8.333, 8);

      expect(result.overtime).toBe(0.33);
      expect(result.undertime).toBe(0);
    });

    it('should handle zero expected hours', () => {
      const result = TimeCalculationService.calculateOvertimeAndUndertime(4, 0);

      expect(result.overtime).toBe(4);
      expect(result.undertime).toBe(0);
    });
  });
});
