// Reference Data Entities (Read-only)
using {io.nimble as db} from '../../db/data-model';

service TrackService {
    /**
     * Users - Registered users in the system
     * Read-only projection on db.Users
     */
    @readonly
    entity Users as projection on db.Users;

    /**
     * Projects - Available projects for time tracking
     * Read-only projection on db.Projects
     */
    @readonly
    entity Projects as projection on db.Projects;

    /**
     * ActivityTypes - Types of activities (Development, Meeting, etc.)
     * Read-only projection on db.ActivityTypes
     * Localized text supported
     */
    @readonly
    entity ActivityTypes as projection on db.ActivityTypes;

    /**
     * EntryTypes - Types of time entries (Work, Vacation, Sick Leave, Holiday, Off)
     * Read-only projection on db.EntryTypes
     * Localized text supported
     */
    @readonly
    entity EntryTypes as projection on db.EntryTypes;

    /**
     * GermanStates - German federal states for holiday calculation
     * Read-only projection on db.GermanStates
     * Localized text supported
     */
    @readonly
    entity GermanStates as projection on db.GermanStates;
}
