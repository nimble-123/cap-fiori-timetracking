# ADR 0002: Command-Pattern fuer Business-Logik

## Status

Akzeptiert - Fruehe Service-Konsolidierung

## Kontext und Problemstellung

Die TimeEntry-Logik umfasst Validierungen, Zeitberechnungen, Abhaengigkeiten zu mehreren Repositories sowie Bound Actions (z.B. Recalculate). Fruehe Iterationen mit Logik in Handlern fuehrten zu schwer testbaren Methoden und doppeltem Code fuer CREATE und UPDATE. Wir benoetigten eine Moeglichkeit, Geschaeftsregeln wiederverwendbar und transaktional einheitlich abzulegen.

## Entscheidungsfaktoren

- Wiederverwendung der gleichen Regelwerke fuer Handler, Aktionen und kuenftige Automatisierungen.
- Explizite Dokumentation, welche Abhaengigkeiten eine Operation benoetigt.
- Einfache Logging-Hooks pro Geschaeftsvorfall (`logger.command*`).
- Testbarkeit durch reine Klassen ohne CAP-spezifisches Binding.

## Betrachtete Optionen

### Option A - Logik direkt in Handlern oder Services

- Handler rufen Repositories und Utilities direkt auf.
- Bound Actions muessen ihre Regeln erneut implementieren.

### Option B - Separates Command-Layer fuer jede Operation

- Command-Klassen kapseln die Ausfuehrung (`srv/track-service/handler/commands/**`).
- Handler uebergeben nur Request und Transaction (`srv/track-service/handler/handlers/TimeEntryHandlers.ts`).
- Abhaengigkeiten werden vom ServiceContainer injiziert.

## Entscheidung

Wir waehlen Option B. Jeder Geschaeftsvorfall erhaelt eine Command-Klasse, die alle Abhaengigkeiten im Konstruktor entgegennimmt. Handler bleiben auf Request-Vorbereitung und Fehlerrueckgabe beschraenkt. Bound Actions wie `handleRecalculate` nutzen dieselben Commands, womit Mehrfachimplementierungen vermieden werden.

## Konsequenzen

- Positiv: Commands lassen sich isoliert unit-testen, da sie nur `Transaction` und Plain Objects benoetigen.
- Positiv: Logging und Fehlerbehandlung folgen einer konsistenten Struktur ueber `logger.commandStart/End`.
- Positiv: Neue Operationen (z.B. `GetVacationBalance`) koennen schnelle ueber Commands angebunden werden, ohne Handler-Logik anzupassen.
- Negativ: Mehr Dateien und Boilerplate pro Anwendungsfall.
- Negativ: Entwickler muessen Abhaengigkeiten im ServiceContainer aktuell halten, sonst schlagen Commands zur Laufzeit fehl.

## Verweise

- `srv/track-service/handler/commands/time-entry/CreateTimeEntryCommand.ts`
- `srv/track-service/handler/commands/time-entry/UpdateTimeEntryCommand.ts`
- `srv/track-service/handler/commands/balance/GetMonthlyBalanceCommand.ts`
- `srv/track-service/handler/handlers/TimeEntryHandlers.ts`
- `srv/track-service/handler/container/ServiceContainer.ts`
