using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  EntryTypes - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.Customizing with @(
  UI.HeaderInfo                       : {
    TypeName      : '{i18n>headerInfo.customizing.typeName}',
    TypeNamePlural: '{i18n>headerInfo.customizing.typeNamePlural}',
    Title         : {Value: 'System Defaults'},
    Description   : {Value: locale}
  },
  UI.Facets                           : [
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>facet.customizing.userInterface}',
      Target: '@UI.FieldGroup#UserInterfaceDefaults'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>facet.customizing.timeEntry}',
      Target: '@UI.FieldGroup#TimeEntryDefaults'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>facet.customizing.userFallbacks}',
      Target: '@UI.FieldGroup#UserDefaults'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>facet.customizing.balance}',
      Target: '@UI.FieldGroup#BalanceSettings'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>facet.customizing.vacation}',
      Target: '@UI.FieldGroup#VacationSettings'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>facet.customizing.integration}',
      Target: '@UI.FieldGroup#IntegrationSettings'
    }
  ],
  UI.FieldGroup #UserInterfaceDefaults: {Data: [{
    Value: hideAttachmentFacet,
    $Type: 'UI.DataField'
  }]},
  UI.FieldGroup #TimeEntryDefaults    : {Data: [
    {
      Value: workStartHour,
      $Type: 'UI.DataField'
    },
    {
      Value: workStartMinute,
      $Type: 'UI.DataField'
    },
    {
      Value: defaultBreakMinutes,
      $Type: 'UI.DataField'
    },
    {
      Value: workEntryTypeCode,
      $Type: 'UI.DataField'
    },
    {
      Value: weekendEntryTypeCode,
      $Type: 'UI.DataField'
    },
    {
      Value: holidayEntryTypeCode,
      $Type: 'UI.DataField'
    },
    {
      Value: generatedSourceCode,
      $Type: 'UI.DataField'
    },
    {
      Value: manualSourceCode,
      $Type: 'UI.DataField'
    }
  ]},
  UI.FieldGroup #UserDefaults         : {Data: [
    {
      Value: fallbackWeeklyHours,
      $Type: 'UI.DataField'
    },
    {
      Value: fallbackWorkingDays,
      $Type: 'UI.DataField'
    },
    {
      Value: fallbackAnnualVacationDays,
      $Type: 'UI.DataField'
    },
    {
      Value: demoUserId,
      $Type: 'UI.DataField'
    }
  ]},
  UI.FieldGroup #BalanceSettings      : {Data: [
    {
      Value: balanceUndertimeCriticalHours,
      $Type: 'UI.DataField'
    },
    {
      Value: recentMonthsDefault,
      $Type: 'UI.DataField'
    },
    {
      Value: balanceYearPastLimit,
      $Type: 'UI.DataField'
    },
    {
      Value: balanceYearFutureLimit,
      $Type: 'UI.DataField'
    },
    {
      Value: balanceFutureMonthBuffer,
      $Type: 'UI.DataField'
    },
    {
      Value: balanceMaxMonths,
      $Type: 'UI.DataField'
    },
    {
      Value: balanceMaxHoursAbsolute,
      $Type: 'UI.DataField'
    },
    {
      Value: balanceMaxWorkingDaysPerMonth,
      $Type: 'UI.DataField'
    }
  ]},
  UI.FieldGroup #VacationSettings     : {Data: [
    {
      Value: vacationWarningRemainingDays,
      $Type: 'UI.DataField'
    },
    {
      Value: vacationCriticalRemainingDays,
      $Type: 'UI.DataField'
    },
    {
      Value: sickLeaveWarningDays,
      $Type: 'UI.DataField'
    },
    {
      Value: sickLeaveCriticalDays,
      $Type: 'UI.DataField'
    }
  ]},
  UI.FieldGroup #IntegrationSettings  : {Data: [
    {
      Value: holidayApiBaseUrl,
      $Type: 'UI.DataField'
    },
    {
      Value: holidayApiCountryParameter,
      $Type: 'UI.DataField'
    },
    {
      Value: locale,
      $Type: 'UI.DataField'
    }
  ]},
  UI.Identification                   : [
    {
      Value: workStartHour,
      $Type: 'UI.DataField'
    },
    {
      Value: locale,
      $Type: 'UI.DataField'
    }
  ]
);

annotate service.Customizing with {
  ID @UI.Hidden;
};
