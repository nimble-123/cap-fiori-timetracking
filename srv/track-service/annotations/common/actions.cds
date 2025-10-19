using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  Bound Actions - Annotationen
////////////////////////////////////////////////////////////////////////////

/**
 * recalculateTimeEntry Bound Action
 * - Nur im Display Mode verfügbar (nicht im Draft/Edit Mode)
 * - Automatisches UI-Refresh nach Ausführung via SideEffects
 */
annotate service.TimeEntries actions {
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
  )
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

/**
 * markTimeEntriesDone Action
 * - Setzt ausgewählte TimeEntries auf Status "Done"
 */
annotate service.markTimeEntriesDone with @(
  Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']},
  Common.Label      : '{i18n>action.markTimeEntriesDone}'
);

/**
 * releaseTimeEntries Action
 * - Setzt ausgewählte TimeEntries auf Status "Released"
 */
annotate service.releaseTimeEntries with @(
  Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']},
  Common.Label      : '{i18n>action.releaseTimeEntries}'
);

////////////////////////////////////////////////////////////////////////////
//  Functions - Annotationen
////////////////////////////////////////////////////////////////////////////

/**
 * getDefaultParamsForGenerateYearly Function
 * - Liefert Default-Werte für generateYearlyTimeEntries Action
 */
annotate service.getDefaultParamsForGenerateYearly with @(Common.Label: '{i18n>action.getDefaultParamsForGenerateYearly}');
