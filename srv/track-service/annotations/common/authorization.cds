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
    to   : 'TimeTrackingUser',
    where: 'user_ID = $user'
  },
  {
    grant: [
      'READ',
      'markTimeEntryDone',
      'releaseTimeEntry',
      'recalculateTimeEntry'
    ],
    to   : 'TimeTrackingApprover'
  },
  {
    grant: [
      'READ',
      'WRITE',
      'recalculateTimeEntry',
      'markTimeEntryDone',
      'releaseTimeEntry'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Customizing - Authorization (lesen alle, schreiben nur Admin)
////////////////////////////////////////////////////////////////////////////
annotate service.Customizing with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: ['READ'],
    to   : 'TimeTrackingApprover'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Users - Authorization (Read-only für alle)
////////////////////////////////////////////////////////////////////////////
annotate service.Users with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Projects - Authorization (Read-only für alle)
////////////////////////////////////////////////////////////////////////////
annotate service.Projects with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);


////////////////////////////////////////////////////////////////////////////
//  CodeLists - Authorization (lesen alle, schreiben nur Admin)
////////////////////////////////////////////////////////////////////////////
annotate service.ActivityTypes with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

annotate service.EntryTypes with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

annotate service.WorkLocations with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

annotate service.TravelTypes with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

annotate service.TimeEntryStatuses with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

annotate service.Region with @(restrict: [
  {
    grant: ['READ'],
    to   : 'TimeTrackingUser'
  },
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'TimeTrackingAdmin'
  }
]);

////////////////////////////////////////////////////////////////////////////
//  Service-Level Authorization (falls benötigt)
////////////////////////////////////////////////////////////////////////////
// annotate service.TrackService with @(requires: 'TimeTrackingUser');
