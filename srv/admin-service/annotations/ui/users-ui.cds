using AdminService as service from '../../../service-model';

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
    },
    {
      Value: annualVacationDays,
      $Type: 'UI.DataField'
    },
    {
      Value: preferredState_code,
      $Type: 'UI.DataField'
    },
    {
      Value: defaultWorkLocation_code,
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
