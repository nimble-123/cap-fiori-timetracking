using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  Bound Actions - Annotationen
////////////////////////////////////////////////////////////////////////////

annotate service.TimeEntries actions {
  /**
   * recalculateTimeEntry Bound Action
   * - Nur im Display Mode verfügbar (nicht im Draft/Edit Mode)
   * - Automatisches UI-Refresh nach Ausführung via SideEffects
   */
  recalculateTimeEntry @(
    Common.SideEffects     : {TargetProperties: [
      'durationHoursGross',
      'durationHoursNet',
      'expectedDailyHoursDec',
      'overtimeHours',
      'undertimeHours',
      'overtimeCriticality',
      'undertimeCriticality'
    ]},
    Core.OperationAvailable: IsActiveEntity,
    Common.Label           : '{i18n>action.recalculateTimeEntry}',
    Core.Description       : 'Berechnet alle Zeitwerte neu basierend auf aktuellen User-Sollstunden'
  );

  /**
   * markTimeEntryDone Bound Action
   * - Setzt ein TimeEntry auf Status "Done"
   */
  markTimeEntryDone    @(
    Common.SideEffects: {TargetProperties: ['status_code']},
    Common.Label      : '{i18n>action.markTimeEntryDone}'
  );

  /**
   * releaseTimeEntry Bound Action
   * - Setzt ein TimeEntry auf Status "Released"
   */
  releaseTimeEntry     @(
    Common.SideEffects: {TargetProperties: ['status_code']},
    Common.Label      : '{i18n>action.releaseTimeEntry}'
  );
};

////////////////////////////////////////////////////////////////////////////
//  Unbound Actions - Annotationen
////////////////////////////////////////////////////////////////////////////

/**
 * generateMonthlyTimeEntries Action
 * - Generiert TimeEntries für den aktuellen Monat
 * - SideEffects für automatisches UI-Refresh der TimeEntries-Liste
 */
annotate service.generateMonthlyTimeEntries with @(
  Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']},
  Common.Label      : '{i18n>action.generateMonthlyTimeEntries}'
);

/**
 * generateYearlyTimeEntries Action
 * - Generiert TimeEntries für ein ganzes Jahr inkl. Feiertage
 * - SideEffects für automatisches UI-Refresh der TimeEntries-Liste
 * - DefaultValuesFunction für Prefill der Parameter
 */
annotate service.generateYearlyTimeEntries with @(
  Common.SideEffects          : {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']},
  Common.Label                : '{i18n>action.generateYearlyTimeEntries}',
  Common.DefaultValuesFunction: 'TrackService.getDefaultParamsForGenerateYearly'
);

/**
 * getMonthlyBalance Action
 * - Berechnet Monatssaldo für bestimmtes Jahr/Monat
 */
annotate service.getMonthlyBalance with @(Common.Label: '{i18n>action.getMonthlyBalance}');

/**
 * getCurrentBalance Action
 * - Liefert aktuellen kumulierten Gesamtsaldo
 */
annotate service.getCurrentBalance with @(Common.Label: '{i18n>action.getCurrentBalance}');

/**
 * getVacationBalance Action
 * - Liefert Urlaubssaldo für aktuelles Jahr
 */
annotate service.getVacationBalance with @(Common.Label: '{i18n>action.getVacationBalance}');

/**
 * getSickLeaveBalance Action
 * - Liefert Krankheitssaldo für aktuelles Jahr
 */
annotate service.getSickLeaveBalance with @(Common.Label: '{i18n>action.getSickLeaveBalance}');

////////////////////////////////////////////////////////////////////////////
//  Functions - Annotationen
////////////////////////////////////////////////////////////////////////////

/**
 * getDefaultParamsForGenerateYearly Function
 * - Liefert Default-Werte für generateYearlyTimeEntries Action
 */
annotate service.getDefaultParamsForGenerateYearly with @(Common.Label: '{i18n>action.getDefaultParamsForGenerateYearly}');
