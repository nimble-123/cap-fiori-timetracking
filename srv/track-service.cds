// srv/track.cds
using {io.nimble as db} from '../db/data-model';

service TrackService {
    @readonly
    entity Users         as projection on db.Users;

    @readonly
    entity Projects      as projection on db.Projects;

    @readonly
    entity ActivityTypes as projection on db.ActivityTypes;

    @readonly
    entity EntryTypes    as projection on db.EntryTypes;

    @odata.draft.enabled
    entity TimeEntries   as
        projection on db.TimeEntries {
            *,
            case
                when overtimeHours > 0
                     then 3 // Positive (Green)
                else 0 // None (Default)
            end as overtimeCriticality  : Integer,
            case
                when undertimeHours > 0
                     then 1 // Negative (Red)
                else 0 // None (Default)
            end as undertimeCriticality : Integer
        };

    // Upsert für einen Tag (UI füllt ein Formular)
    action upsertDay(userEmail: String,
                     workDate: Date,
                     startTime: Time,
                     endTime: Time,
                     breakMin: Integer,
                     note: String)                      returns TimeEntries;

    // Optional: Nur Pause ändern
    action setBreak(entryID: String, breakMin: Integer) returns TimeEntries;

    // Unbound Action: Generiere leere TimeEntries für aktuellen Monat (für aktuellen User)
    @Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']}
    action generateMonthlyTimeEntries()                 returns array of TimeEntries;
}
