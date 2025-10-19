using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  TimeEntries - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(
  UI.SelectionFields               : [
    workDate,
    entryType_code,
    status_code,
    workLocation_code,
    travelType_code,
    project_ID,
    activity_code
  ],

  UI.FilterFacets                  : [
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>filterGroup.projectActivity}',
      Target: '@UI.FieldGroup#ProjectActivity'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Label : '{i18n>filterGroup.locationTravel}',
      Target: '@UI.FieldGroup#LocationTravel'
    }
  ],

  UI.LineItem                      : {
    $value            : [
      // Action Group für Generieren
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.generate}',
        ID     : 'generateActions',
        Actions: [
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/generateMonthlyTimeEntries',
            Label            : '{i18n>action.generateMonthlyTimeEntries}',
            ![@UI.Importance]: #High,
            Inline           : false
          },
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/generateYearlyTimeEntries',
            Label            : '{i18n>action.generateYearlyTimeEntries}',
            ![@UI.Importance]: #High,
            Inline           : false
          }
        ]
      },
      // Action Group für Salden
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.balances}',
        ID     : 'balanceActions',
        Actions: [
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/getMonthlyBalance',
            Label            : '{i18n>action.getMonthlyBalance}',
            ![@UI.Importance]: #Medium,
            Inline           : false
          },
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/getCurrentBalance',
            Label            : '{i18n>action.getCurrentBalance}',
            ![@UI.Importance]: #Medium,
            Inline           : false
          }
        ]
      },
      // Action Group für Statuswechsel
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.status}',
        ID     : 'statusActions',
        Actions: [
          {
            $Type                      : 'UI.DataFieldForAction',
            Action                     : 'TrackService.EntityContainer/markTimeEntriesDone',
            Label                      : '{i18n>action.markTimeEntriesDone}',
            ![@UI.Importance]          : #Medium,
            ![@Core.OperationAvailable]: status.allowDoneAction,
            Inline                     : false
          },
          {
            $Type                      : 'UI.DataFieldForAction',
            Action                     : 'TrackService.EntityContainer/releaseTimeEntries',
            Label                      : '{i18n>action.releaseTimeEntries}',
            ![@UI.Importance]          : #High,
            ![@Core.OperationAvailable]: status.allowReleaseAction,
            Inline                     : false
          }
        ]
      },
      {
        Value: workDate,
        $Type: 'UI.DataField'
      },
      {
        Value                : entryType.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '100px'}
      },
      {
        Value                : status.name,
        $Type                : 'UI.DataField',
        ![@UI.Importance]    : #High,
        ![@HTML5.CssDefaults]: {width: '80px'}
      },
      {
        Value                : workLocation.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '120px'}
      },
      {
        Value                : travelType.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '120px'}
      },
      {
        Value                : project.name,
        ![@UI.Importance]    : #Low,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '10rem'}
      },
      {
        Value                : activity.name,
        ![@UI.Importance]    : #Low,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '14rem'}
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
        Value            : durationHoursGross,
        ![@UI.Importance]: #Low,
        $Type            : 'UI.DataField'
      },
      {
        Value: durationHoursNet,
        $Type: 'UI.DataField'
      },
      {
        Value            : expectedDailyHoursDec,
        $Type            : 'UI.DataField',
        ![@UI.Importance]: #Low
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
        Value                : note,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: 'auto'}
      }
    ],
    ![@UI.Criticality]: entryType.criticality
  },

  // Variant: Simple - Reduced view with essential fields only
  UI.LineItem #Simple              : {
    $value            : [
      // Action Group für Generieren
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.generate}',
        ID     : 'generateActions',
        Actions: [
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/generateMonthlyTimeEntries',
            Label            : '{i18n>action.generateMonthlyTimeEntries}',
            ![@UI.Importance]: #High,
            Inline           : false
          },
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/generateYearlyTimeEntries',
            Label            : '{i18n>action.generateYearlyTimeEntries}',
            ![@UI.Importance]: #High,
            Inline           : false
          }
        ]
      },
      // Action Group für Salden
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.balances}',
        ID     : 'balanceActions',
        Actions: [
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/getMonthlyBalance',
            Label            : '{i18n>action.getMonthlyBalance}',
            ![@UI.Importance]: #Medium,
            Inline           : false
          },
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/getCurrentBalance',
            Label            : '{i18n>action.getCurrentBalance}',
            ![@UI.Importance]: #Medium,
            Inline           : false
          }
        ]
      },
      // Action Group für Statuswechsel
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.status}',
        ID     : 'statusActions',
        Actions: [
          {
            $Type                      : 'UI.DataFieldForAction',
            Action                     : 'TrackService.EntityContainer/markTimeEntriesDone',
            Label                      : '{i18n>action.markTimeEntriesDone}',
            ![@UI.Importance]          : #Medium,
            ![@Core.OperationAvailable]: status.allowDoneAction,
            Inline                     : false
          },
          {
            $Type                      : 'UI.DataFieldForAction',
            Action                     : 'TrackService.EntityContainer/releaseTimeEntries',
            Label                      : '{i18n>action.releaseTimeEntries}',
            ![@UI.Importance]          : #High,
            ![@Core.OperationAvailable]: status.allowReleaseAction,
            Inline                     : false
          }
        ]
      },
      // Essential fields only (6 columns)
      {
        Value: workDate,
        $Type: 'UI.DataField'
      },
      {
        Value                : entryType.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '100px'}
      },
      {
        Value                : status.name,
        $Type                : 'UI.DataField',
        ![@UI.Importance]    : #High,
        ![@HTML5.CssDefaults]: {width: '80px'}
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
      }
    ],
    ![@UI.Criticality]: entryType.criticality
  },

  // Variant: Advanced - Complete view with all fields
  UI.LineItem #Advanced            : {
    $value            : [
      // Action Group für Generieren
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.generate}',
        ID     : 'generateActions',
        Actions: [
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/generateMonthlyTimeEntries',
            Label            : '{i18n>action.generateMonthlyTimeEntries}',
            ![@UI.Importance]: #High,
            Inline           : false
          },
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/generateYearlyTimeEntries',
            Label            : '{i18n>action.generateYearlyTimeEntries}',
            ![@UI.Importance]: #High,
            Inline           : false
          }
        ]
      },
      // Action Group für Salden
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.balances}',
        ID     : 'balanceActions',
        Actions: [
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/getMonthlyBalance',
            Label            : '{i18n>action.getMonthlyBalance}',
            ![@UI.Importance]: #Medium,
            Inline           : false
          },
          {
            $Type            : 'UI.DataFieldForAction',
            Action           : 'TrackService.EntityContainer/getCurrentBalance',
            Label            : '{i18n>action.getCurrentBalance}',
            ![@UI.Importance]: #Medium,
            Inline           : false
          }
        ]
      },
      // Action Group für Statuswechsel
      {
        $Type  : 'UI.DataFieldForActionGroup',
        Label  : '{i18n>actionGroup.status}',
        ID     : 'statusActions',
        Actions: [
          {
            $Type                      : 'UI.DataFieldForAction',
            Action                     : 'TrackService.EntityContainer/markTimeEntriesDone',
            Label                      : '{i18n>action.markTimeEntriesDone}',
            ![@UI.Importance]          : #Medium,
            ![@Core.OperationAvailable]: status.allowDoneAction,
            Inline                     : false
          },
          {
            $Type                      : 'UI.DataFieldForAction',
            Action                     : 'TrackService.EntityContainer/releaseTimeEntries',
            Label                      : '{i18n>action.releaseTimeEntries}',
            ![@UI.Importance]          : #High,
            ![@Core.OperationAvailable]: status.allowReleaseAction,
            Inline                     : false
          }
        ]
      },
      // All fields
      {
        Value: workDate,
        $Type: 'UI.DataField'
      },
      {
        Value                : entryType.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '100px'}
      },
      {
        Value                : status.name,
        $Type                : 'UI.DataField',
        ![@UI.Importance]    : #High,
        ![@HTML5.CssDefaults]: {width: '80px'}
      },
      {
        Value                : workLocation.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '120px'}
      },
      {
        Value                : travelType.name,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '120px'}
      },
      {
        Value                : project.name,
        ![@UI.Importance]    : #Low,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '10rem'}
      },
      {
        Value                : activity.name,
        ![@UI.Importance]    : #Low,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: '14rem'}
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
        Value            : durationHoursGross,
        ![@UI.Importance]: #Low,
        $Type            : 'UI.DataField'
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
        Value            : expectedDailyHoursDec,
        $Type            : 'UI.DataField',
        ![@UI.Importance]: #Low
      },
      {
        Value                : note,
        $Type                : 'UI.DataField',
        ![@HTML5.CssDefaults]: {width: 'auto'}
      }
    ],
    ![@UI.Criticality]: entryType.criticality
  },

  UI.PresentationVariant           : {
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
    MaxItems      : 31,
    Visualizations: ['@UI.LineItem']
  },

  // Variant: Simple Presentation
  UI.PresentationVariant #Simple   : {
    Text          : '{i18n>variant.simple}',
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
    MaxItems      : 31,
    Visualizations: ['@UI.LineItem#Simple']
  },

  // Variant: Advanced Presentation
  UI.PresentationVariant #Advanced : {
    Text          : '{i18n>variant.advanced}',
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
    MaxItems      : 31,
    Visualizations: ['@UI.LineItem#Advanced']
  },

  UI.HeaderInfo                    : {
    TypeName      : '{i18n>headerInfo.timeEntry.typeName}',
    TypeNamePlural: '{i18n>headerInfo.timeEntry.typeNamePlural}',
    Title         : {Value: workDate},
    Description   : {Value: user.name}
  },

  // Facets für Object Page - 5 Gruppen
  UI.Facets                        : [
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#GeneralInfo',
      Label : '{i18n>facet.generalInfo}'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#LocationTravel',
      Label : '{i18n>facet.locationTravel}'
    },
    {
      $Type : 'UI.ReferenceFacet',
      Target: '@UI.FieldGroup#ProjectActivity',
      Label : '{i18n>facet.projectActivity}'
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
    },
    {
      $Type     : 'UI.ReferenceFacet',
      Target    : 'attachments/@UI.LineItem',
      Label     : '{i18n>facet.attachments}',
      @UI.Hidden: {$edmJson: {$Path: '/Customizing/hideAttachmentFacet'}},
    }
  ],

  // Field Groups für Object Page Layout
  UI.FieldGroup #GeneralInfo       : {Data: [
    {
      Value: workDate,
      $Type: 'UI.DataField'
    },
    {
      Value: entryType_code,
      $Type: 'UI.DataField'
    },
    {
      Value      : status_code,
      $Type      : 'UI.DataField',
      Criticality: status.criticality,
    },
    {
      Value: note,
      $Type: 'UI.DataField'
    }
  ]},

  UI.FieldGroup #LocationTravel    : {Data: [
    {
      Value: workLocation_code,
      $Type: 'UI.DataField'
    },
    {
      Value: travelType_code,
      $Type: 'UI.DataField'
    }
  ]},

  UI.FieldGroup #ProjectActivity   : {Data: [
    {
      Value: project_ID,
      $Type: 'UI.DataField'
    },
    {
      Value: activity_code,
      $Type: 'UI.DataField'
    }
  ]},

  UI.FieldGroup #TimeInfo          : {Data: [
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

  UI.FieldGroup #CalculatedInfo    : {Data: [
    {
      $Type : 'UI.DataFieldForAction',
      Action: 'TrackService.recalculateTimeEntry',
      Label : '{i18n>action.recalculateTimeEntry}',
      Inline: true
    },
    {
      Value: durationHoursGross,
      $Type: 'UI.DataField'
    },
    {
      Value: durationHoursNet,
      $Type: 'UI.DataField'
    },
    {
      Value: expectedDailyHoursDec,
      $Type: 'UI.DataField'
    },
    {
      Value: overtimeHours,
      $Type: 'UI.DataField'
    },
    {
      Value: undertimeHours,
      $Type: 'UI.DataField'
    },
  ]},

  UI.FieldGroup #CreationParameters: {Data: [
    {
      Value: workDate,
      $Type: 'UI.DataField'
    },
    {
      Value: entryType_code,
      $Type: 'UI.DataField'
    },
    {
      Value: workLocation_code,
      $Type: 'UI.DataField'
    },
    {
      Value: travelType_code,
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
      Value: note,
      $Type: 'UI.DataField'
    }
  ]},
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

// Variant: Simple - Reduced view
annotate service.TimeEntries with @(UI.SelectionPresentationVariant #Simple: {
  Text               : '{i18n>variant.simple}',
  SelectionVariant   : {
    Text         : '{i18n>variant.simple}',
    SelectOptions: [{
      PropertyName: workDate,
      Ranges      : [{
        Sign  : #I,
        Option: #GE,
        Low   : $now
      }]
    }]
  },
  PresentationVariant: ![@UI.PresentationVariant#Simple]
});

// Variant: Advanced - Complete view
annotate service.TimeEntries with @(UI.SelectionPresentationVariant #Advanced: {
  Text               : '{i18n>variant.advanced}',
  SelectionVariant   : {
    Text         : '{i18n>variant.advanced}',
    SelectOptions: [{
      PropertyName: workDate,
      Ranges      : [{
        Sign  : #I,
        Option: #GE,
        Low   : $now
      }]
    }]
  },
  PresentationVariant: ![@UI.PresentationVariant#Advanced]
});

annotate service.TimeEntries with {
  attachments @Common.Label: '{i18n>facet.attachments}';
};


////////////////////////////////////////////////////////////////////////////
//  Chart Annotations
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(UI.Chart #alpChart: {
  $Type          : 'UI.ChartDefinitionType',
  Title          : '{i18n>title.timeEntry.chart}',
  ChartType      : #Column,
  Dimensions     : [workDate],
  DynamicMeasures: [
    '@Analytics.AggregatedProperty#durationHoursNet_sum',
    '@Analytics.AggregatedProperty#expectedDailyHoursDec_sum'
  ]
});


////////////////////////////////////////////////////////////////////////////
//  Action Annotations
////////////////////////////////////////////////////////////////////////////

// Parameter Field Controls für getMonthlyBalance
//annotate service.getMonthlyBalance with(year @(Common.FieldControl: #Mandatory), month @(Common.FieldControl: #Mandatory));
