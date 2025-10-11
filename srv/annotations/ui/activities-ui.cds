// srv/annotations/ui/activities-ui.cds - UI Layout für ActivityTypes Entity
using TrackService as service from '../../track-service';

////////////////////////////////////////////////////////////////////////////
//  ActivityTypes - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.ActivityTypes with @(
  UI.SelectionFields    : [
    code,
    text
  ],

  UI.LineItem           : [
    {
      Value: code,
      $Type: 'UI.DataField'
    },
    {
      Value: text,
      $Type: 'UI.DataField'
    }
  ],

  UI.PresentationVariant: {
    SortOrder     : [{
      Property  : code,
      Descending: false
    }],
    Visualizations: ['@UI.LineItem']
  },

  UI.HeaderInfo         : {
    TypeName      : '{i18n>headerInfo.activityType.typeName}',
    TypeNamePlural: '{i18n>headerInfo.activityType.typeNamePlural}',
    Title         : {Value: text},
    Description   : {Value: code}
  }
);
