using {io.nimble as db} from '../../db';

@impl: './track-service.ts'
service TrackService {
  /**
   * Type: Default-Parameter für generateYearlyTimeEntries Action
   */
  type DefaultParamsForGenerateYearly {
    year      : Integer;
    stateCode : db.Region:code;
  }

  @readonly
  entity Users             as projection on db.Users;

  @readonly
  entity Projects          as projection on db.Projects;

  @readonly
  entity ActivityTypes     as projection on db.ActivityTypes;

  @readonly
  entity EntryTypes        as projection on db.EntryTypes;

  @readonly
  entity Region            as projection on db.Region;

  @readonly
  entity WorkLocations     as projection on db.WorkLocations;

  @readonly
  entity TravelTypes       as projection on db.TravelTypes;

  @readonly
  entity TimeEntryStatuses as projection on db.TimeEntryStatuses;

  @odata.singleton
  entity Customizing       as projection on db.Customizing;

  @odata.draft.enabled
  entity TimeEntries       as
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
    }
    actions {
      /**
       * Bound Action: Berechnet alle Zeitwerte neu
       * Nutzt aktuelle User-Sollstunden und berechnet Über-/Unterstunden
       * Nur im Display Mode verfügbar (nicht im Draft/Edit Mode)
      */
      action recalculateTimeEntry() returns TimeEntries;
      /**
       * Bound Action: Setzt TimeEntry auf Status "Done"
       * Führt Statuswechsel pro ausgewähltem Eintrag durch
      */
      action markTimeEntryDone()    returns TimeEntries;
      /**
       * Bound Action: Setzt TimeEntry auf Status "Released"
       * Führt Statuswechsel pro ausgewähltem Eintrag durch
      */
      action releaseTimeEntry()     returns TimeEntries;
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

  /**
   * Unbound Action: Generiere leere TimeEntries für aktuellen Monat (für aktuellen User)
   */
  action   generateMonthlyTimeEntries()                                                                                              returns array of TimeEntries;

  /**
   * Unbound Action: Generiere TimeEntries für ein ganzes Jahr inkl. Wochenenden und Feiertage
   */
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
