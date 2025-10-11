// srv/annotations/common/value-helps.cds - Zentrale Value Help Definitionen
using TrackService as service from '../../track-service';

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

////////////////////////////////////////////////////////////////////////////
//  Weitere Value Helps können hier hinzugefügt werden
////////////////////////////////////////////////////////////////////////////
// Beispiele:
// annotate service.Users with {
//   // Falls Users auch Dropdown/ValueHelp benötigen
// };

// annotate service.Projects with {
//   // Falls Projects auch Dropdown/ValueHelp benötigen
// };
