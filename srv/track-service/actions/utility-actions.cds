// Utility Actions for specific operations

extend service TrackService with {
    /**
     * Upsert TimeEntry for a specific day
     * Creates new entry or updates existing one
     * Useful for form-based UI input
     *
     * @param userEmail - User email address
     * @param workDate - Date of work
     * @param startTime - Start time
     * @param endTime - End time
     * @param breakMin - Break duration in minutes
     * @param note - Optional note
     * @returns Created or updated TimeEntry
     */
    action upsertDay(
        userEmail : String,
        workDate  : Date,
        startTime : Time,
        endTime   : Time,
        breakMin  : Integer,
        note      : String
    ) returns TimeEntries;

    /**
     * Update only break duration for existing entry
     * Useful for quick break adjustments
     *
     * @param entryID - TimeEntry ID
     * @param breakMin - New break duration in minutes
     * @returns Updated TimeEntry
     */
    action setBreak(
        entryID  : String,
        breakMin : Integer
    )            returns TimeEntries;
}
