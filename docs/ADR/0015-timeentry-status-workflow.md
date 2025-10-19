# ADR 0015: TimeEntry Status-Workflow mit CodeList & Customizing

## Status
Akzeptiert – Iteration 11 (Status Lifecycle & Closing Flow)

## Kontext und Problemstellung
TimeEntries konnten bislang beliebig geändert werden. Für Abrechnungsprozesse und Audit-Trails benötigen wir jedoch einen expliziten Status-Lifecycle:

- **Open (O):** neu erfasste oder generierte Buchungen
- **Processed (P):** Buchungen, die manuell angepasst wurden
- **Done (D):** inhaltlich abgeschlossen, aber noch nicht zur Abrechnung freigegeben
- **Released (R):** finale Freigabe (read-only)

Die Lösung muss…
- sowohl **UI** als auch **Backend** vor unerlaubten Statuswechseln schützen,
- Mandanten erlauben, **eigene Codes** zu pflegen,
- **Bulk-Aktionen** für Done/Release bereitstellen,
- Stammdaten-basiert definieren, **welche Transitionen** erlaubt sind.

## Entscheidungsfaktoren
- **Konfigurierbarkeit:** Statuscodes dürfen nicht im Code fest verdrahtet sein (Customizing-Anforderung).
- **Konsistenz über alle Layer:** Datenmodell, Business Logic und UI müssen identische Status-Informationen verwenden.
- **Governance:** Finale Status (`Released`) müssen serverseitig gesperrt werden.
- **UX:** UI soll nur erlaubte Aktionen anbieten (`allowDoneAction`, `allowReleaseAction`).

## Betrachtete Optionen

### Option A – CodeList `TimeEntryStatuses` + Customizing Defaults + Actions **(gewählt)**
- *Vorteile:*
  - Stammdaten erfassen Transitionen (`from_code`, `to_code`) und Action-Verfügbarkeit.
  - Customizing liefert Default-Codes für Open/Processed/Done/Released.
  - Neue Unbound Actions (`markTimeEntriesDone`, `releaseTimeEntries`) ermöglichen Bulk-Statuswechsel mit Server-Validierung.
  - UI-Annotations können direkt auf `status.allowDoneAction` / `allowReleaseAction` zugreifen und Operationen steuern.
- *Nachteile:*
  - Zusätzliche Entität + CSV Seeds müssen gepflegt werden.
  - Mehr Commands/Handler erhöhen Komplexität im ServiceContainer.

### Option B – Harte Kodierung im TimeEntry (Enum/String Switch)
- *Vorteile:*
  - Keine zusätzliche Tabelle nötig.
  - Einfacher initialer Aufwand.
- *Nachteile:*
  - Kein Customizing möglich, Status-Transitionen nur im Code.
  - UI kann Verfügbarkeit nicht aus Stammdaten ableiten.
  - Erweiterungen (weitere Status, Mandanten-spezifische Transitionen) sehr aufwändig.

## Entscheidung
Option A liefert den geforderten Grad an Konfigurierbarkeit und ermöglicht dennoch eine zentrale Steuerung der Business Rules. `TimeEntryStatuses` erweitert das Datenmodell, `Customizing` hält die aktuellen Codes, und zwei neue Commands orchestrieren Bulk-Aktionen mit Repository-Validierung. `TimeEntryHandlers` blockieren Änderungen, sobald `Released` erreicht ist. UI-Annotations nutzen die Stammdaten, um Actions kontextabhängig zu be- oder deaktivieren. Damit erreichen wir fachliche Nachvollziehbarkeit, konsistente Sperrlogik und saubere Erweiterbarkeit.

## Konsequenzen

**Positiv**
- Status-Lifecycle ist transparent in Stammdaten und Dokumentation abgebildet.
- Customizing kann Codes ohne Code-Änderung austauschen.
- UI zeigt nur erlaubte Aktionen an und nutzt Value Helps für Statuswechsel.
- Backend garantiert, dass `Released`-Einträge unveränderbar bleiben.

**Negativ**
- Mehr Initialaufwand: zusätzliche Commands, Tests, Dokumentation.
- Administratoren müssen Stammdaten (CodeList + Customizing) synchron pflegen.

## Verweise
- `db/data-model.cds` – `TimeEntryStatuses` Entity + `TimeEntries.status`.
- `db/data/io.nimble-TimeEntryStatuses.csv` & `db/data/io.nimble-Customizing.csv`.
- `srv/track-service/track-service.cds` – neue Actions, Projektion & FieldControl.
- `srv/track-service/handler/commands/time-entry/*` – neue Status-Commands.
- `srv/track-service/annotations` – UI LineItems, FieldGroups, Action Groups.
- `tests/track-service.test.js` – Integrationstests für Statuswechsel & Freigabe.
- `docs/ARCHITECTURE.md` – Abschnitt 5.3/5.4 (Statusmodell & Commands).
