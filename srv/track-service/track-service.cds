// srv/track.cds
using {io.nimble as db} from '../../db/data-model';

@impl: './track-service.ts'
service TrackService {

    /**
     * Type: Default-Parameter für generateYearlyTimeEntries Action
     */
    type DefaultParamsForGenerateYearly {
        year      : Integer;
        stateCode : db.GermanStates:code;
    }

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

    @readonly
    entity WorkLocations as projection on db.WorkLocations;

    @readonly
    entity TravelTypes   as projection on db.TravelTypes;

    @odata.draft.enabled
    entity TimeEntries   as
        projection on db.TimeEntries {
            *,
            case
                entryType.code
                when 'W'
                     then 0 // Neutral (keine Färbung) - Arbeit
                when 'B'
                     then 0 // Neutral - Dienstreise (wie Arbeit)
                when 'H'
                     then 5 // Information (blau) - Feiertag
                when 'O'
                     then 3 // Information (blau) - Frei/Wochenende
                when 'V'
                     then 2 // Critical (orange) - Urlaub
                when 'F'
                     then 2 // Critical (orange) - Flexzeitabbau (wie Urlaub)
                when 'G'
                     then 2 // Critical (orange) - Gleitzeitabbau (wie Urlaub)
                when 'S'
                     then 1 // Negative (rot) - Krankheit
                else 0
            end as entryTypeCriticality : Integer,
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
                       note: String)                                                                                                   returns TimeEntries;

    // Optional: Nur Pause ändern
    action   setBreak(entryID: String, breakMin: Integer)                                                                              returns TimeEntries;

    // Unbound Action: Generiere leere TimeEntries für aktuellen Monat (für aktuellen User)
    @Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']}
    action   generateMonthlyTimeEntries()                                                                                              returns array of TimeEntries;

    // Unbound Action: Generiere TimeEntries für ein ganzes Jahr inkl. Wochenenden und Feiertage
    @Common.SideEffects: {TargetEntities: ['/TrackService.EntityContainer/TimeEntries']}
    action   generateYearlyTimeEntries(year: DefaultParamsForGenerateYearly:year, stateCode: DefaultParamsForGenerateYearly:stateCode) returns array of TimeEntries;

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
     * Action: Saldo für einen bestimmten Monat abrufen
     * @param year - Jahr (z.B. 2025)
     * @param month - Monat (1-12)
     */
    action   getMonthlyBalance(year: Integer, month: Integer)                                                                          returns MonthlyBalances;

    /**
     * Action: Aktueller kumulierter Gesamtsaldo
     */
    action   getCurrentBalance()                                                                                                       returns Decimal(9, 2);

    // ========================================
    // Urlaubssaldo-Funktionalität
    // ========================================

    /**
     * Virtuelle Entity für Urlaubssaldo
     */
    @readonly
    entity VacationBalances {
        key year               : Integer;
            totalDays          : Decimal(4, 1); // Gesamturlaub
            takenDays          : Decimal(4, 1); // Genommene Tage
            remainingDays      : Decimal(4, 1); // Noch offen
            balanceCriticality : Integer; // 3=viel übrig, 2=mittel, 1=wenig
    }

    /**
     * Action: Urlaubssaldo für aktuelles Jahr abrufen
     */
    action   getVacationBalance()                                                                                                      returns VacationBalances;

    // ========================================
    // Krankheitssaldo-Funktionalität
    // ========================================

    /**
     * Virtuelle Entity für Krankheitssaldo
     */
    @readonly
    entity SickLeaveBalances {
        key year        : Integer;
            totalDays   : Decimal(4, 1); // Kranktage im Jahr
            criticality : Integer; // 0=ok, 1=viel, 2=sehr viel
    }

    /**
     * Action: Krankheitssaldo für aktuelles Jahr abrufen
     */
    action   getSickLeaveBalance()                                                                                                     returns SickLeaveBalances;

    /**
     * Function: Liefert Default-Werte für generateYearlyTimeEntries Action
     * Wird automatisch vom UI aufgerufen wenn die Action-Dialog geöffnet wird
     */
    function getDefaultParamsForGenerateYearly()                                                                                       returns DefaultParamsForGenerateYearly;
}
