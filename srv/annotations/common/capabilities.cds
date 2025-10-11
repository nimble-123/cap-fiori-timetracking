// srv/annotations/common/capabilities.cds - Entity Capabilities
using TrackService as service from '../../track-service';

////////////////////////////////////////////////////////////////////////////
//  TimeEntries - Capabilities
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(Capabilities: {
  DeleteRestrictions: {
    Deletable                       : false,
    NonDeletableNavigationProperties: []
  },
  InsertRestrictions: {Insertable: true},
  UpdateRestrictions: {Updatable: true},
  FilterRestrictions: {FilterExpressionRestrictions: [{
    Property          : 'workDate',
    AllowedExpressions: 'SingleRange' //Other option: SingleValue
  }]}
});

annotate service.TimeEntries with @Aggregation.ApplySupported: {
  Transformations       : [
    'aggregate',
    'topcount',
    'bottomcount',
    'identity',
    'concat',
    'groupby',
    'filter',
    'search'
  ],
  Rollup                : #None,
  PropertyRestrictions  : true,
  GroupableProperties   : [
    activity_code,
    entryType_code,
    project_ID,
    workDate
  ],
  AggregatableProperties: [{Property: durationHoursNet, }],
};

annotate service.TimeEntries with @(Analytics.AggregatedProperty #durationHoursNet_sum: {
  $Type               : 'Analytics.AggregatedPropertyType',
  Name                : 'durationHoursNet_sum',
  AggregatableProperty: durationHoursNet,
  AggregationMethod   : 'sum',
  @Common.Label       : '{i18n>analytics.durationHoursNet.sum}',
});

////////////////////////////////////////////////////////////////////////////
//  Users - Capabilities (Read-only)
////////////////////////////////////////////////////////////////////////////
annotate service.Users with @(Capabilities: {
  DeleteRestrictions: {Deletable: false},
  InsertRestrictions: {Insertable: false},
  UpdateRestrictions: {Updatable: false}
});

////////////////////////////////////////////////////////////////////////////
//  Projects - Capabilities (Read-only)
////////////////////////////////////////////////////////////////////////////
annotate service.Projects with @(Capabilities: {
  DeleteRestrictions: {Deletable: false},
  InsertRestrictions: {Insertable: false},
  UpdateRestrictions: {Updatable: false}
});

////////////////////////////////////////////////////////////////////////////
//  ActivityTypes - Capabilities (Read-only)
////////////////////////////////////////////////////////////////////////////
annotate service.ActivityTypes with @(Capabilities: {
  DeleteRestrictions: {Deletable: false},
  InsertRestrictions: {Insertable: false},
  UpdateRestrictions: {Updatable: false}
});
