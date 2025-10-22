using AdminService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  Region - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.Region with @(
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
    TypeName      : '{i18n>headerInfo.Region.typeName}',
    TypeNamePlural: '{i18n>headerInfo.Region.typeNamePlural}',
    Title         : {Value: name},
    Description   : {Value: descr}
  }
);
