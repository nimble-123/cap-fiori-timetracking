using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  TimeEntries - Authorization Restrictions
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(restrict: [
  {
    grant: [
      'READ',
      'WRITE',
      'recalculateTimeEntry',
      'markTimeEntryDone',
      'releaseTimeEntry'
    ],
    to   : 'authenticated-user',
    where: 'user_ID = $user'
  },
  {
    grant: [
      'READ',
      'WRITE',
      'recalculateTimeEntry'
    ],
    to   : 'Admin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Customizing - Authorization (lesen alle, schreiben nur Admin)
////////////////////////////////////////////////////////////////////////////
annotate service.Customizing with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Users - Authorization (Read-only für alle)
////////////////////////////////////////////////////////////////////////////
annotate service.Users with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Projects - Authorization (Read-only für alle)
////////////////////////////////////////////////////////////////////////////
annotate service.Projects with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);


////////////////////////////////////////////////////////////////////////////
//  CodeLists - Authorization (lesen alle, schreiben nur Admin)
////////////////////////////////////////////////////////////////////////////
annotate service.ActivityTypes with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

annotate service.EntryTypes with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

annotate service.WorkLocations with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

annotate service.TravelTypes with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

annotate service.TimeEntryStatuses with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

annotate service.Region with @(restrict: [
  {
    grant: ['READ'],
    to   : 'authenticated-user'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'Admin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Service-Level Authorization (falls benötigt)
////////////////////////////////////////////////////////////////////////////
// annotate service.TrackService with @(requires: 'authenticated-user');
