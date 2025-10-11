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

    @readonly
    entity GermanStates  as projection on db.GermanStates;

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
    action   upsertDay(userEmail: String,
                       workDate: Date,
                       startTime: Time,
                       endTime: Time,
                       breakMin: Integer,
                       note: String)                                                returns TimeEntries;

    // Optional: Nur Pause ändern
    action   setBreak(entryID: String, breakMin: Integer)                           returns TimeEntries;

    // Unbound Action: Generiere leere TimeEntries für aktuellen Monat (für aktuellen User)
    @Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']}
    action   generateMonthlyTimeEntries()                                           returns array of TimeEntries;

    // Unbound Action: Generiere TimeEntries für ein ganzes Jahr inkl. Wochenenden und Feiertage
    @Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']}
    action   generateYearlyTimeEntries(year: Integer, stateCode: GermanStates:code) returns array of TimeEntries;

    // ========================================
    // Monatssaldo-Funktionalität
    // ========================================

    /**
     * Virtuelle Entity für Monatssaldo-Übersicht
     * Zeigt die letzten Monate mit aggregierten Über-/Unterstunden
     */
    @readonly
    entity MonthlyBalances {
        key month               : String(7); // Format: YYYY-MM
            year                : Integer;
            monthNumber         : Integer;
            totalOvertimeHours  : Decimal(9, 2);
            totalUndertimeHours : Decimal(9, 2);
            balanceHours        : Decimal(9, 2);
            balanceCriticality  : Integer; // 0=neutral, 1=negativ(rot), 2=kritisch(gelb), 3=positiv(grün)
            workingDays         : Integer;
    }

    /**
     * Function: Saldo für einen bestimmten Monat abrufen
     * @param year - Jahr (z.B. 2025)
     * @param month - Monat (1-12)
     */
    function getMonthlyBalance(year: Integer, month: Integer)                       returns MonthlyBalances;

    /**
     * Function: Aktueller kumulierter Gesamtsaldo
     */
    function getCurrentBalance()                                                    returns Decimal(9, 2);
}
