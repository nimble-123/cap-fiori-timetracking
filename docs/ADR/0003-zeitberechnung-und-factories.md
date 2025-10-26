# ADR 0003: Zentralisierte Zeitberechnung ueber Factory und Services

## Status

Akzeptiert - Nach ersten TimeEntry-Prototypen

## Kontext und Problemstellung

Zeitwerte wie `durationHoursNet`, `overtimeHours` und `expectedDailyHoursDec` muessen serverseitig konsistent bleiben, egal ob Eintraege manuell oder automatisiert entstehen. In fruehen Tests kam es zu Abweichungen, weil Handler verschiedene Berechnungen nutzten oder UI-Werte durchrutschten. Zudem benoetigen generierte Eintraege (Wochenende, Feiertage, Default) gemeinsame Regeln.

## Entscheidungsfaktoren

- Einmalige Definition der Arbeitszeitberechnung inklusive Rundung und Fehlerfaelle.
- Wiederverwendbare Erstellung von generierten Eintraegen fuer Monats- und Jahreslauf.
- Strikte Kontrolle, dass UI-Clients berechnete Felder nicht manipulieren.
- Zugriff auf User-bezogene Sollstunden in jeder Operation.

## Betrachtete Optionen

### Option A - Berechnungen in Handlern oder Commands duplizieren

- Jeder Handler berechnet Dauer, Pause, Ueberstunden selbst.
- Generierung erstellt Objekte ad hoc.

### Option B - TimeEntryFactory plus TimeCalculationService als zentrale Quelle

- `TimeEntryFactory` erstellt Work-, Non-Work-, Default-, Wochenend- und Feiertags-Eintraege (`srv/track-service/handler/factories/TimeEntryFactory.ts`).
- `TimeCalculationService` uebernimmt Umrechnungen und Rundungen (`srv/track-service/handler/services/TimeCalculationService.ts`).
- Commands rufen Factory-Methoden auf und uebernehmen nur Rueckgabewerte (`srv/track-service/handler/commands/time-entry/CreateTimeEntryCommand.ts`).

## Entscheidung

Wir setzen Option B um. Alle Zeitberechnungen laufen durch TimeCalculationService, waehrend TimeEntryFactory Domain-Objekte erzeugt. Commands validieren Eingaben, fragen Sollstunden ueber den UserService ab und uebernehmen berechnete Werte in den Request. Generationsstrategien nutzen dieselbe Factory fuer konsistente UI-Werte.

## Konsequenzen

- Positiv: Einheitliche Rundung auf zwei Dezimalstellen und einheitliche Fehlertexte.
- Positiv: Bereits berechnete Werte aus automatischen Eintraegen koennen unveraendert uebernommen werden (siehe `CreateTimeEntryCommand.execute`).
- Positiv: Tests muessen nur Factory und Calculation Service pruefen, nicht jede Handler-Variante.
- Negativ: Entwickler muessen neue Felder zuerst in Factory und Service einfuehren, bevor sie in Commands nutzbar sind.
- Negativ: Starke Kopplung an den UserService fuer Sollstunden, dadurch Abhaengigkeit auf `Transaction`.

## Verweise

- `srv/track-service/handler/factories/TimeEntryFactory.ts`
- `srv/track-service/handler/services/TimeCalculationService.ts`
- `srv/track-service/handler/services/UserService.ts`
- `srv/track-service/handler/commands/time-entry/CreateTimeEntryCommand.ts`
- `srv/track-service/handler/strategies/YearlyGenerationStrategy.ts`
