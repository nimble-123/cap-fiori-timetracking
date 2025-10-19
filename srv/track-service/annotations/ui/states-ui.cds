using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  GermanStates - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.GermanStates with @(
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
    TypeName      : '{i18n>headerInfo.germanStates.typeName}',
    TypeNamePlural: '{i18n>headerInfo.germanStates.typeNamePlural}',
    Title         : {Value: name},
    Description   : {Value: descr}
  }
);
