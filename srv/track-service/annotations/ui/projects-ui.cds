using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  Projects - UI Layout
////////////////////////////////////////////////////////////////////////////
annotate service.Projects with @(
  UI.SelectionFields    : [
    number,
    name,
    active,
    billable
  ],

  UI.LineItem           : [
    {
      Value: number,
      $Type: 'UI.DataField'
    },
    {
      Value: name,
      $Type: 'UI.DataField'
    },
    {
      Value: active,
      $Type: 'UI.DataField'
    },
    {
      Value: billable,
      $Type: 'UI.DataField'
    }
  ],

  UI.PresentationVariant: {
    SortOrder     : [{
      Property  : number,
      Descending: false
    }],
    Visualizations: ['@UI.LineItem']
  },

  UI.HeaderInfo         : {
    TypeName      : '{i18n>headerInfo.project.typeName}',
    TypeNamePlural: '{i18n>headerInfo.project.typeNamePlural}',
    Title         : {Value: name},
    Description   : {Value: number}
  }
);
