using TrackService as service from '../../service-model';

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
