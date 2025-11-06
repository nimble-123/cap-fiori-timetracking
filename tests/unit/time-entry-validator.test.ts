/**
 * Unit Tests - TimeEntryValidator
 *
 * Testet echte TimeEntryValidator-Klasse mit gemockten Dependencies
 */

import { TimeEntryValidator } from '../../srv/track-service/handler/validators/TimeEntryValidator';
import { TimeEntryRepository } from '../../srv/track-service/handler/repositories/TimeEntryRepository';
import { ProjectValidator } from '../../srv/track-service/handler/validators/ProjectValidator';
import { ActivityTypeValidator } from '../../srv/track-service/handler/validators/ActivityTypeValidator';
import { WorkLocationValidator } from '../../srv/track-service/handler/validators/WorkLocationValidator';
import { TravelTypeValidator } from '../../srv/track-service/handler/validators/TravelTypeValidator';
import type { Transaction } from '@sap/cds';
import type { TimeEntry } from '#cds-models/TrackService';

const mockTx = {} as Transaction;

const mockProjectValidator = {
  validateActive: jest.fn(),
} as unknown as jest.Mocked<ProjectValidator>;

const mockActivityTypeValidator = {
  validateExists: jest.fn(),
} as unknown as jest.Mocked<ActivityTypeValidator>;

const mockTimeEntryRepository = {
  getEntryByUserAndDate: jest.fn(),
} as unknown as jest.Mocked<TimeEntryRepository>;

const mockWorkLocationValidator = {
  validateExists: jest.fn(),
} as unknown as jest.Mocked<WorkLocationValidator>;

const mockTravelTypeValidator = {
  validateExists: jest.fn(),
} as unknown as jest.Mocked<TravelTypeValidator>;

describe('TimeEntryValidator', () => {
  let validator: TimeEntryValidator;

  beforeEach(() => {
    jest.clearAllMocks();

    validator = new TimeEntryValidator(
      mockProjectValidator,
      mockActivityTypeValidator,
      mockTimeEntryRepository,
      mockWorkLocationValidator,
      mockTravelTypeValidator,
    );

    // Default: Validierungen sind erfolgreich
    mockProjectValidator.validateActive.mockResolvedValue(undefined);
    mockActivityTypeValidator.validateExists.mockResolvedValue(undefined);
    mockWorkLocationValidator.validateExists.mockResolvedValue(undefined);
    mockTravelTypeValidator.validateExists.mockResolvedValue(undefined);
    mockTimeEntryRepository.getEntryByUserAndDate.mockResolvedValue(null);
  });

  describe('validateRequiredFieldsForCreate', () => {
    it('should throw error if user_ID is missing', () => {
      const entryData = { workDate: '2025-01-15', startTime: '08:00:00', endTime: '16:00:00' } as TimeEntry;

      expect(() => validator.validateRequiredFieldsForCreate(entryData)).toThrow('user ist erforderlich');
    });

    it('should throw error if workDate is missing', () => {
      const entryData = { user_ID: 'user-123', startTime: '08:00:00', endTime: '16:00:00' } as TimeEntry;

      expect(() => validator.validateRequiredFieldsForCreate(entryData)).toThrow('workDate ist erforderlich');
    });

    it('should throw error if work entry has no startTime', () => {
      const entryData = {
        user_ID: 'user-123',
        workDate: '2025-01-15',
        entryType: 'WORK',
        endTime: '16:00:00',
      } as TimeEntry;

      expect(() => validator.validateRequiredFieldsForCreate(entryData)).toThrow(
        'startTime und endTime sind bei Arbeitszeit erforderlich',
      );
    });

    it('should throw error if work entry has no endTime', () => {
      const entryData = {
        user_ID: 'user-123',
        workDate: '2025-01-15',
        entryType: 'WORK',
        startTime: '08:00:00',
      } as TimeEntry;

      expect(() => validator.validateRequiredFieldsForCreate(entryData)).toThrow(
        'startTime und endTime sind bei Arbeitszeit erforderlich',
      );
    });

    it('should accept valid work entry', () => {
      const entryData = {
        user_ID: 'user-123',
        workDate: '2025-01-15',
        entryType: 'WORK',
        startTime: '08:00:00',
        endTime: '16:00:00',
      } as TimeEntry;

      const result = validator.validateRequiredFieldsForCreate(entryData);
      expect(result).toBe('WORK');
    });

    it('should default to WORK type if entryType is missing', () => {
      const entryData = {
        user_ID: 'user-123',
        workDate: '2025-01-15',
        startTime: '08:00:00',
        endTime: '16:00:00',
      } as TimeEntry;

      const result = validator.validateRequiredFieldsForCreate(entryData);
      expect(result).toBe('WORK');
    });
  });

  describe('validateFieldsForUpdate', () => {
    it('should throw error if work entry update removes times', () => {
      const existingEntry: TimeEntry = {
        ID: 'entry-1',
        user_ID: 'user-123',
        workDate: '2025-01-15',
        entryType: 'WORK',
        startTime: undefined, // Zeit wird entfernt
        endTime: '16:00:00',
      } as TimeEntry;

      const updateData = { startTime: undefined };

      expect(() => validator.validateFieldsForUpdate(updateData, existingEntry)).toThrow(
        'startTime und endTime sind bei Arbeitszeit erforderlich',
      );
    });

    it('should accept valid work entry update', () => {
      const existingEntry: TimeEntry = {
        ID: 'entry-1',
        entryType: 'WORK',
        startTime: '08:00:00',
        endTime: '16:00:00',
      } as TimeEntry;

      const updateData = { note: 'Updated note' };

      expect(() => validator.validateFieldsForUpdate(updateData, existingEntry)).not.toThrow();
    });
  });

  describe('validateReferences', () => {
    it('should validate project reference if provided', async () => {
      const entryData = { project_ID: 'project-123' };

      await validator.validateReferences(mockTx, entryData);

      expect(mockProjectValidator.validateActive).toHaveBeenCalledWith(mockTx, 'project-123');
    });

    it('should validate activity reference if provided', async () => {
      const entryData = { activity_code: 'DEV' };

      await validator.validateReferences(mockTx, entryData);

      expect(mockActivityTypeValidator.validateExists).toHaveBeenCalledWith(mockTx, 'DEV');
    });

    it('should validate workLocation reference if provided', async () => {
      const entryData = { workLocation_code: 'OFFICE' };

      await validator.validateReferences(mockTx, entryData);

      expect(mockWorkLocationValidator.validateExists).toHaveBeenCalledWith(mockTx, 'OFFICE');
    });

    it('should validate travelType reference if provided', async () => {
      const entryData = { travelType_code: 'CAR' };

      await validator.validateReferences(mockTx, entryData);

      expect(mockTravelTypeValidator.validateExists).toHaveBeenCalledWith(mockTx, 'CAR');
    });

    it('should validate all references when all provided', async () => {
      const entryData = {
        project_ID: 'project-123',
        activity_code: 'DEV',
        workLocation_code: 'OFFICE',
        travelType_code: 'CAR',
      };

      await validator.validateReferences(mockTx, entryData);

      expect(mockProjectValidator.validateActive).toHaveBeenCalledWith(mockTx, 'project-123');
      expect(mockActivityTypeValidator.validateExists).toHaveBeenCalledWith(mockTx, 'DEV');
      expect(mockWorkLocationValidator.validateExists).toHaveBeenCalledWith(mockTx, 'OFFICE');
      expect(mockTravelTypeValidator.validateExists).toHaveBeenCalledWith(mockTx, 'CAR');
    });

    it('should throw error if project validation fails', async () => {
      const entryData = { project_ID: 'invalid-project' };
      mockProjectValidator.validateActive.mockRejectedValue(new Error('Project not found'));

      await expect(validator.validateReferences(mockTx, entryData)).rejects.toThrow('Project not found');
    });
  });

  describe('requiresTimeRecalculation', () => {
    it('should return true if startTime changed', () => {
      const updateData = { startTime: '09:00:00' } as TimeEntry;
      expect(validator.requiresTimeRecalculation(updateData)).toBe(true);
    });

    it('should return true if endTime changed', () => {
      const updateData = { endTime: '17:00:00' } as TimeEntry;
      expect(validator.requiresTimeRecalculation(updateData)).toBe(true);
    });

    it('should return true if breakMin changed', () => {
      const updateData = { breakMin: 45 } as TimeEntry;
      expect(validator.requiresTimeRecalculation(updateData)).toBe(true);
    });

    it('should return true if user_ID changed', () => {
      const updateData = { user_ID: 'other-user' } as TimeEntry;
      expect(validator.requiresTimeRecalculation(updateData)).toBe(true);
    });

    it('should return true if entryType_code changed', () => {
      const updateData = { entryType_code: 'V' } as TimeEntry;
      expect(validator.requiresTimeRecalculation(updateData)).toBe(true);
    });

    it('should return false if only non-time fields changed', () => {
      const updateData = { project_ID: 'project-456' } as TimeEntry;
      expect(validator.requiresTimeRecalculation(updateData)).toBe(false);
    });
  });

  describe('ensureStatusMutable', () => {
    it('should throw error if current status is final', () => {
      expect(() => validator.ensureStatusMutable('RELEASED', 'RELEASED')).toThrow(
        'Freigegebene TimeEntries können nicht mehr bearbeitet werden.',
      );
    });

    it('should not throw if current status is not final', () => {
      expect(() => validator.ensureStatusMutable('OPEN', 'RELEASED')).not.toThrow();
    });
  });

  describe('validateStatusChange', () => {
    const defaults = {
      statusOpenCode: 'OPEN',
      statusProcessedCode: 'PROCESSED',
      statusDoneCode: 'DONE',
      statusReleasedCode: 'RELEASED',
    };

    it('should accept valid status transitions', () => {
      expect(() => validator.validateStatusChange('OPEN', 'PROCESSED', defaults)).not.toThrow();
      expect(() => validator.validateStatusChange('PROCESSED', 'DONE', defaults)).not.toThrow();
    });

    it('should reject invalid status values', () => {
      expect(() => validator.validateStatusChange('OPEN', 'INVALID_STATUS', defaults)).toThrow(
        'Ungültiger TimeEntry-Status.',
      );
    });

    it('should reject manual transition to RELEASED', () => {
      expect(() => validator.validateStatusChange('OPEN', 'RELEASED', defaults)).toThrow(/Released.*Freigabe/);
    });

    it('should allow keeping current status', () => {
      expect(() => validator.validateStatusChange('OPEN', 'OPEN', defaults)).not.toThrow();
    });

    it('should allow undefined requested status', () => {
      expect(() => validator.validateStatusChange('OPEN', undefined as any, defaults)).not.toThrow();
    });
  });

  describe('validateUniqueEntryPerDay', () => {
    it('should throw error if duplicate entry exists', async () => {
      const existingEntry = { ID: 'entry-1', user_ID: 'user-123', workDate: '2025-01-15' } as TimeEntry;
      mockTimeEntryRepository.getEntryByUserAndDate.mockResolvedValue(existingEntry);

      await expect(validator.validateUniqueEntryPerDay(mockTx, 'user-123', '2025-01-15')).rejects.toThrow(
        'Es existiert bereits ein Eintrag für diesen Tag.',
      );

      expect(mockTimeEntryRepository.getEntryByUserAndDate).toHaveBeenCalledWith(
        mockTx,
        'user-123',
        '2025-01-15',
        undefined,
      );
    });

    it('should not throw if no duplicate exists', async () => {
      mockTimeEntryRepository.getEntryByUserAndDate.mockResolvedValue(null);

      await expect(validator.validateUniqueEntryPerDay(mockTx, 'user-123', '2025-01-15')).resolves.not.toThrow();
    });

    it('should exclude specific entry ID when provided', async () => {
      mockTimeEntryRepository.getEntryByUserAndDate.mockResolvedValue(null);

      await validator.validateUniqueEntryPerDay(mockTx, 'user-123', '2025-01-15', 'entry-1');

      expect(mockTimeEntryRepository.getEntryByUserAndDate).toHaveBeenCalledWith(
        mockTx,
        'user-123',
        '2025-01-15',
        'entry-1',
      );
    });
  });
});
