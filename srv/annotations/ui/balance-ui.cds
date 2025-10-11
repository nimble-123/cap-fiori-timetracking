using TrackService as service from '../../track-service';

////////////////////////////////////////////////////////////////////////////
//
//	MonthlyBalances List Page
//
annotate service.MonthlyBalances with @(
  UI.LineItem               : [
    {Value: month},
    {Value: workingDays},
    {Value: totalOvertimeHours},
    {Value: totalUndertimeHours},
    {
      Value                    : balanceHours,
      Criticality              : balanceCriticality,
      CriticalityRepresentation: #WithoutIcon
    }
  ],

  UI.SelectionFields        : [
    year,
    monthNumber
  ],

  UI.HeaderInfo             : {
    TypeName      : '{i18n>balance.monthlyBalance}',
    TypeNamePlural: '{i18n>balance.monthlyBalances}',
    Title         : {Value: month},
    Description   : {Value: balanceHours}
  },

  UI.Chart                  : {
    Title              : '{i18n>balance.chart.title}',
    ChartType          : #Column,
    Dimensions         : [month],
    Measures           : [balanceHours],
    MeasureAttributes  : [{
      Measure  : balanceHours,
      Role     : #Axis1,
      DataPoint: '@UI.DataPoint#BalanceChart'
    }],
    DimensionAttributes: [{
      Dimension: month,
      Role     : #Category
    }]
  },

  UI.DataPoint #BalanceChart: {
    Value                    : balanceHours,
    Title                    : '{i18n>balance.balance}',
    Criticality              : balanceCriticality,
    CriticalityRepresentation: #WithColor
  },

  UI.PresentationVariant    : {
    Visualizations: [
      '@UI.Chart',
      '@UI.LineItem'
    ],
    SortOrder     : [{
      Property  : month,
      Descending: true
    }]
  }
);

////////////////////////////////////////////////////////////////////////////
//
//	MonthlyBalances Object Page
//
annotate service.MonthlyBalances with @(
  UI.FieldGroup #Details: {Data: [
    {Value: year},
    {Value: monthNumber},
    {Value: workingDays},
    {Value: totalOvertimeHours},
    {Value: totalUndertimeHours},
    {
      Value                    : balanceHours,
      Criticality              : balanceCriticality,
      CriticalityRepresentation: #WithIcon
    }
  ]},

  UI.Facets             : [{
    $Type : 'UI.ReferenceFacet',
    Label : '{i18n>balance.details}',
    Target: '@UI.FieldGroup#Details'
  }]
);
