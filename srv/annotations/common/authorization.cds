using TrackService as service from '../../service-model';

////////////////////////////////////////////////////////////////////////////
//  TimeEntries - Authorization Restrictions
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with @(restrict: [
  {
    grant: [
      'READ',
      'WRITE'
    ],
    to   : 'authenticated-user',
    where: 'user_ID = $user'
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
// annotate service.Users with @(restrict: [
//   {
//     grant: ['READ'],
//     to   : 'authenticated-user'
//   },
//   {
//     grant: [
//       'READ',
//       'WRITE'
//     ],
//     to   : 'Admin'
//   }
// ]);

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
//  ActivityTypes - Authorization (Read-only für alle)
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

////////////////////////////////////////////////////////////////////////////
//  Service-Level Authorization (falls benötigt)
////////////////////////////////////////////////////////////////////////////
// annotate service.TrackService with @(requires: 'authenticated-user');
