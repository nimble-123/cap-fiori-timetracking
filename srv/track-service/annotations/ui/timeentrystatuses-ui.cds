using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  ActivityTypes - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntryStatuses with @(
  UI.SelectionFields    : [
    code,
    name,
  ],

  UI.LineItem           : [
    {
      Value: code,
      $Type: 'UI.DataField'
    },
    {
      Value: name,
      $Type: 'UI.DataField'
    },
    {
      Value: descr,
      $Type: 'UI.DataField'
    },
    {
      Value: from.code,
      Label: '{i18n>timeEntryStatus.from}',
      $Type: 'UI.DataField'
    },
    {
      Value: to.code,
      Label: '{i18n>timeEntryStatus.to}',
      $Type: 'UI.DataField'
    },
    {
      Value: allowDoneAction,
      Label: '{i18n>timeEntryStatus.allowDoneAction}',
      $Type: 'UI.DataField'
    },
    {
      Value: allowReleaseAction,
      Label: '{i18n>timeEntryStatus.allowReleaseAction}',
      $Type: 'UI.DataField'
    },
    {
      Value: criticality,
      Label: '{i18n>timeEntryStatus.criticality}',
      $Type: 'UI.DataField'
    },
    {
      Value: sortValue,
      Label: '{i18n>timeEntryStatus.sortValue}',
      $Type: 'UI.DataField'
    }
  ],

  UI.PresentationVariant: {
    SortOrder     : [{
      Property  : sortValue,
      Descending: false
    }],
    Visualizations: ['@UI.LineItem']
  },

  UI.HeaderInfo         : {
    TypeName      : '{i18n>headerInfo.activityType.typeName}',
    TypeNamePlural: '{i18n>headerInfo.activityType.typeNamePlural}',
    Title         : {Value: name},
    Description   : {Value: descr}
  }
);
