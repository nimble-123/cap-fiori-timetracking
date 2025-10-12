// Virtual Entities for calculated data

extend service TrackService with {
    /**
     * MonthlyBalances - Virtual Entity for monthly balance overview
     * Shows aggregated overtime/undertime per month
     * Not persisted in DB, calculated on-the-fly
     */
    @readonly
    entity MonthlyBalances {
        /**
         * Month in format YYYY-MM (e.g. "2025-01")
         */
        key month               : String(7);

        /**
         * Year as integer (e.g. 2025)
         */
            year                : Integer;

        /**
         * Month number (1-12)
         */
            monthNumber         : Integer;

        /**
         * Total overtime hours for this month (positive values only)
         */
            totalOvertimeHours  : Decimal(9, 2);

        /**
         * Total undertime hours for this month (positive values only)
         */
            totalUndertimeHours : Decimal(9, 2);

        /**
         * Net balance: overtimeHours - undertimeHours
         * Positive = more overtime, Negative = undertime
         */
            balanceHours        : Decimal(9, 2);

        /**
         * Criticality for UI visualization:
         * 0 = neutral (balanced)
         * 1 = negative/red (undertime > 5h)
         * 2 = critical/yellow (some undertime < 5h)
         * 3 = positive/green (overtime)
         */
            balanceCriticality  : Integer;

        /**
         * Number of working days in this month
         */
            workingDays         : Integer;
    }
}
