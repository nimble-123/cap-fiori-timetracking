using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  Default Values Functions
////////////////////////////////////////////////////////////////////////////

/**
 * DefaultValuesFunction für generateYearlyTimeEntries Action
 * Prefüllt den 'year' Parameter mit dem aktuellen Jahr
 * und 'stateCode' mit dem bevorzugten Bundesland des Users (falls vorhanden)
 */
annotate service.generateYearlyTimeEntries with @(Common.DefaultValuesFunction: 'TrackService.getDefaultParamsForGenerateYearly');
