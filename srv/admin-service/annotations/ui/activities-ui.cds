using AdminService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  ActivityTypes - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.ActivityTypes with @(
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
    TypeName      : '{i18n>headerInfo.activityType.typeName}',
    TypeNamePlural: '{i18n>headerInfo.activityType.typeNamePlural}',
    Title         : {Value: name},
    Description   : {Value: descr}
  }
);
