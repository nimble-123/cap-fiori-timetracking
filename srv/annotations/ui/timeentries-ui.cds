// srv/annotations/ui/timeentries-ui.cds - UI Layout für TimeEntries Entity
using TrackService as service from '../../track-service';

////////////////////////////////////////////////////////////////////////////
//  TimeEntries - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(
  UI.SelectionFields           : [
    user_ID,
    workDate,
    entryType_code,
    project_ID,
    activity_code
  ],

  UI.LineItem                  : [
    // Action Button für Monatsgenerierung
    {
      $Type            : 'UI.DataFieldForAction',
      Action           : 'TrackService.EntityContainer/generateMonthlyTimeEntries',
      Label            : '{i18n>action.generateMonthlyTimeEntries}',
      ![@UI.Importance]: #High,
      Inline           : false
    },
    // Action Button für Jahresgenerierung
    {
      $Type            : 'UI.DataFieldForAction',
      Action           : 'TrackService.EntityContainer/generateYearlyTimeEntries',
      Label            : '{i18n>action.generateYearlyTimeEntries}',
      ![@UI.Importance]: #High,
      Inline           : false
    },
    {
      Value: workDate,
      $Type: 'UI.DataField'
    },
    {
      Value: entryType.text,
      $Type: 'UI.DataField'
    },
    {
      Value: project.name,
      $Type: 'UI.DataField'
    },
    {
      Value: activity.text,
      $Type: 'UI.DataField'
    },
    {
      Value: startTime,
      $Type: 'UI.DataField'
    },
    {
      Value: endTime,
      $Type: 'UI.DataField'
    },
    {
      Value: breakMin,
      $Type: 'UI.DataField'
    },
    {
      Value: durationHoursNet,
      $Type: 'UI.DataField'
    },
    {
      Value      : overtimeHours,
      $Type      : 'UI.DataField',
      Criticality: overtimeCriticality
    },
    {
      Value      : undertimeHours,
      $Type      : 'UI.DataField',
      Criticality: undertimeCriticality,
    },
    {
      Value: note,
      $Type: 'UI.DataField'
    }
  ],

  UI.PresentationVariant       : {
    SortOrder     : [
      {
        Property  : workDate,
        Descending: true
      },
      {
        Property  : startTime,
        Descending: false
      }
    ],
    Visualizations: ['@UI.LineItem']
  },

  UI.HeaderInfo                : {
    TypeName      : '{i18n>headerInfo.timeEntry.typeName}',
    TypeNamePlural: '{i18n>headerInfo.timeEntry.typeNamePlural}',
    Title         : {Value: workDate},
    Description   : {Value: user.name}
  },

  // Facets für Object Page
  UI.Facets                    : [
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#GeneralInfo',
      Label : '{i18n>facet.generalInfo}'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#TimeInfo',
      Label : '{i18n>facet.timeInfo}'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#CalculatedInfo',
      Label : '{i18n>facet.calculatedInfo}'
    }
  ],

  // Field Groups für Object Page Layout
  UI.FieldGroup #GeneralInfo   : {Data: [
    {
      Value: workDate,
      $Type: 'UI.DataField'
    },
    {
      Value: user_ID,
      $Type: 'UI.DataField'
    },
    {
      Value: entryType_code,
      $Type: 'UI.DataField'
    },
    {
      Value: project_ID,
      $Type: 'UI.DataField'
    },
    {
      Value: activity_code,
      $Type: 'UI.DataField'
    },
    {
      Value: note,
      $Type: 'UI.DataField'
    }
  ]},

  UI.FieldGroup #TimeInfo      : {Data: [
    {
      Value: startTime,
      $Type: 'UI.DataField'
    },
    {
      Value: endTime,
      $Type: 'UI.DataField'
    },
    {
      Value: breakMin,
      $Type: 'UI.DataField'
    }
  ]},

  UI.FieldGroup #CalculatedInfo: {Data: [
    {
      Value: durationHoursGross,
      $Type: 'UI.DataField'
    },
    {
      Value: durationHoursNet,
      $Type: 'UI.DataField'
    },
    {
      Value: overtimeHours,
      $Type: 'UI.DataField'
    },
    {
      Value: undertimeHours,
      $Type: 'UI.DataField'
    }
  ]}
);

////////////////////////////////////////////////////////////////////////////
//  Selection and Presentation Variants
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(UI.SelectionPresentationVariant: {
  SelectionVariant   : {SelectOptions: [{
    PropertyName: workDate,
    Ranges      : [{
      Sign  : #I,
      Option: #GE,
      Low   : $now
    }]
  }]},
  PresentationVariant: ![@UI.PresentationVariant]
});

annotate service.TimeEntries with @(UI.SelectionPresentationVariant #HoursPerDay: {
  Text               : 'Arbeitsstunden pro Tag',
  PresentationVariant: {Visualizations: ['@UI.Chart#HoursPerDayChart']}
});

////////////////////////////////////////////////////////////////////////////
//  Chart Annotations
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(UI.Chart #HoursPerDayChart: {
  Title            : 'Arbeitsstunden pro Tag',
  ChartType        : #Column,
  Dimensions       : [workDate],
  Measures         : [durationHoursNet],
  MeasureAttributes: [{
    Measure: durationHoursNet,
    Role   : #Axis1
  }]
});

annotate service.TimeEntries with @(UI.Chart #alpChart: {
  $Type          : 'UI.ChartDefinitionType',
  ChartType      : #Column,
  Dimensions     : [workDate, ],
  DynamicMeasures: ['@Analytics.AggregatedProperty#durationHoursNet_sum',
  ]
});


////////////////////////////////////////////////////////////////////////////
//  Action Annotations
////////////////////////////////////////////////////////////////////////////
