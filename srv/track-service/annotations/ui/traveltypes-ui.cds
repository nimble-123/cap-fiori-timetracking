using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  TravelTypes - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.TravelTypes with @(
  UI.SelectionFields    : [
    code,
    name
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
    TypeName      : '{i18n>headerInfo.travelType.typeName}',
    TypeNamePlural: '{i18n>headerInfo.travelType.typeNamePlural}',
    Title         : {Value: name},
    Description   : {Value: descr}
  }
);
