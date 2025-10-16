# 🎯 3. Command Pattern (10 Commands!)

**Dateien:** `srv/handler/commands/*.ts`

Commands kapseln komplexe Business Operations:

| Command                      | Zweck                                          |
| ---------------------------- | ---------------------------------------------- |
| `CreateTimeEntryCommand`     | Validierung, User-Lookup, Factory, Calculation |
| `UpdateTimeEntryCommand`     | Change Detection, Recalculation                |
| `GenerateMonthlyCommand`     | Monat generieren mit Stats                     |
| `GenerateYearlyCommand`      | Jahr mit Feiertagen                            |
| `GetDefaultParamsCommand`    | Default-Parameter für Generierung              |
| `GetMonthlyBalanceCommand`   | Monatssaldo mit Criticality                    |
| `GetCurrentBalanceCommand`   | Kumulierter Gesamtsaldo                        |
| `GetRecentBalancesCommand`   | Historische Balances (6 Monate)                |
| `GetVacationBalanceCommand`  | Urlaubssaldo-Berechnung                        |
| `GetSickLeaveBalanceCommand` | Krankheitsstand-Berechnung                     |
