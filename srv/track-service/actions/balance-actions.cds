// Balance Actions for overtime/undertime calculations

extend service TrackService with {
    /**
     * Get balance for specific month
     * Calculates aggregated overtime/undertime for given month
     *
     * @param year - Year (e.g. 2025)
     * @param month - Month (1-12)
     * @returns Monthly balance with criticality
     */
    action getMonthlyBalance(
        year  : Integer,
        month : Integer
    ) returns MonthlyBalances;

    /**
     * Get current cumulative balance
     * Calculates total balance across all months
     *
     * @returns Total balance in hours (positive = overtime, negative = undertime)
     */
    action getCurrentBalance() returns Decimal(9, 2);
}
