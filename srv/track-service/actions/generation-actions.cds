// Generation Actions for bulk TimeEntry creation

extend service TrackService with {
    /**
     * Generate missing TimeEntries for current month
     * Creates entries only for days without existing entries
     * Uses current user's expected daily hours
     *
     * @returns Array of all TimeEntries for current month (new + existing)
     */
    @Common.SideEffects : {TargetEntities : ['/TrackService.EntityContainer/TimeEntries']}
    action generateMonthlyTimeEntries() returns array of TimeEntries;

    /**
     * Generate TimeEntries for complete year
     * Includes workdays, weekends, and holidays
     * Fetches holidays from feiertage-api.de for specified state
     *
     * @param year - Target year (e.g. 2025)
     * @param stateCode - German federal state code (e.g. "BY" for Bavaria)
     * @returns Array of all TimeEntries for specified year
     */
    @Common.SideEffects : {TargetEntities : ['/TrackService.EntityContainer/TimeEntries']}
    action generateYearlyTimeEntries(
        year      : Integer,
        stateCode : GermanStates : code
    )                                   returns array of TimeEntries;
}
