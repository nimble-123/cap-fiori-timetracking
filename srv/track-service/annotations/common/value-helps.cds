using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  TimeEntries - Value Help Annotations
////////////////////////////////////////////////////////////////////////////

// User Value Help
annotate service.TimeEntries with {
  user @(
    Common.ValueList               : {
      CollectionPath: 'Users',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: user_ID,
          ValueListProperty: 'ID'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    },
    Common.ValueListWithFixedValues: false
  )
};

// Project Value Help
annotate service.TimeEntries with {
  project @(
    Common.ValueList               : {
      CollectionPath: 'Projects',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: project_ID,
          ValueListProperty: 'ID'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'number'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'name'
        }
      ]
    },
    Common.ValueListWithFixedValues: false
  )
};

// Activity Value Help
annotate service.TimeEntries with {
  activity @(
    Common.ValueList               : {
      CollectionPath: 'ActivityTypes',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: activity_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};

// EntryType Value Help
annotate service.TimeEntries with {
  entryType @(
    Common.ValueList               : {
      CollectionPath: 'EntryTypes',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: entryType_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};

// WorkLocation Value Help
annotate service.TimeEntries with {
  workLocation @(
    Common.ValueList               : {
      CollectionPath: 'WorkLocations',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: workLocation_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};

// TravelType Value Help
annotate service.TimeEntries with {
  travelType @(
    Common.ValueList               : {
      CollectionPath: 'TravelTypes',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: travelType_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};

// Status Value Help
annotate service.TimeEntries with {
  status @(
    Common.ValueList               : {
      CollectionPath: 'TimeEntryStatuses',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: status_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};

////////////////////////////////////////////////////////////////////////////
//  Action Parameter - Value Helps
////////////////////////////////////////////////////////////////////////////

// generateYearlyTimeEntries Action - Parameter Annotations
annotate service.generateYearlyTimeEntries with(stateCode @(
  Common.ValueList               : {
    CollectionPath: 'Region',
    Parameters    : [
      {
        $Type            : 'Common.ValueListParameterInOut',
        LocalDataProperty: stateCode,
        ValueListProperty: 'code'
      },
      {
        $Type            : 'Common.ValueListParameterDisplayOnly',
        ValueListProperty: 'name'
      }
    ]
  },
  Common.ValueListWithFixedValues: true
) );

////////////////////////////////////////////////////////////////////////////
//  Weitere Value Helps
////////////////////////////////////////////////////////////////////////////

// Users - defaultWorkLocation Value Help
annotate service.Users with {
  defaultWorkLocation @(
    Common.ValueList               : {
      CollectionPath: 'WorkLocations',
      Parameters    : [
        {
          $Type            : 'Common.ValueListParameterInOut',
          LocalDataProperty: defaultWorkLocation_code,
          ValueListProperty: 'code'
        },
        {
          $Type            : 'Common.ValueListParameterDisplayOnly',
          ValueListProperty: 'text'
        }
      ]
    },
    Common.ValueListWithFixedValues: true
  )
};
