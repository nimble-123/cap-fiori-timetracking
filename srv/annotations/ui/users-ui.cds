// srv/annotations/ui/users-ui.cds - UI Layout für Users Entity
using TrackService as service from '../../track-service';

////////////////////////////////////////////////////////////////////////////
//  Users - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.Users with @(
  UI.SelectionFields    : [
    name,
    active
  ],

  UI.LineItem           : [
    {
      Value: name,
      $Type: 'UI.DataField'
    },
    {
      Value: active,
      $Type: 'UI.DataField'
    },
    {
      Value: weeklyHoursDec,
      $Type: 'UI.DataField'
    },
    {
      Value: workingDaysPerWeek,
      $Type: 'UI.DataField'
    },
    {
      Value: expectedDailyHoursDec,
      $Type: 'UI.DataField'
    }
  ],

  UI.PresentationVariant: {
    SortOrder     : [{
      Property  : name,
      Descending: false
    }],
    Visualizations: ['@UI.LineItem']
  },

  UI.HeaderInfo         : {
    TypeName      : '{i18n>headerInfo.user.typeName}',
    TypeNamePlural: '{i18n>headerInfo.user.typeNamePlural}',
    Title         : {Value: name}
  }
);
