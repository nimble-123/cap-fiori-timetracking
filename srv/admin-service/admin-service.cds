using {io.nimble as db} from '../../db';

service AdminService {

  entity Users             as projection on db.Users;

  entity Projects          as projection on db.Projects;

  entity ActivityTypes     as projection on db.ActivityTypes;

  entity EntryTypes        as projection on db.EntryTypes;

  entity Region            as projection on db.Region;

  entity WorkLocations     as projection on db.WorkLocations;

  entity TravelTypes       as projection on db.TravelTypes;

  entity TimeEntryStatuses as projection on db.TimeEntryStatuses;

  @odata.singleton
  entity Customizing       as projection on db.Customizing;
}
