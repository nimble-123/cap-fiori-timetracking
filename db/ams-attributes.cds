using { io.nimble as db } from './data-model';

///////////////////////////////////////////////////////////////////////////////
// AMS Attribute Mappings
//  - Map selected domain attributes to AMS attributes for policy evaluation
///////////////////////////////////////////////////////////////////////////////

annotate db.TimeEntries with @ams.attributes: {
  UserID    : (user.ID),
  ProjectID : (project.ID),
  StatusCode: (status.code)
};

annotate db.Users with @ams.attributes: {
  PreferredState: (preferredState.code)
};

annotate db.Projects with @ams.attributes: {
  ProjectNumber: (number)
};
