# ADR 0005: Duale UI5-Strategie fuer Zeiterfassung

## Status

Akzeptiert - Erweiterung um Dashboard-Anforderungen

## Kontext und Problemstellung

Das Projekt soll sowohl eine schnelle Fiori-Elements-Liste fuer Fachanwender als auch ein visuell reiches Dashboard fuer Self-Service bieten. Ein einzelner App-Typ deckte beide Nutzungsfaelle nicht ab: Die List Report App liefert schnelle CRUD-Prozesse, waehrend Planungsfunktionen (Kalender, KPIs) kundenspezifische Steuerung benoetigen.

## Entscheidungsfaktoren

- Wiederverwendung desselben TrackService (`/odata/v4/track/`) fuer beide Clients.
- Gemeinsame OData-Annotationen, aber unterschiedliche Darstellung.
- Moeglichkeit, Custom UI5-Controls (SinglePlanningCalendar) einzubinden.
- Trennung der Build-Konfiguration, damit Generator-Updates sicher eingespielt werden koennen.

## Betrachtete Optionen

### Option A - Eine einzige Fiori-Elements-App mit Erweiterungen

- Nutzung von Extension Points und Side Effects fuer Sonderfaelle.
- Komplexe Custom Controls muessten in FE eingebettet werden.

### Option B - Zwei spezialisierte UI5-Apps auf gemeinsamer Servicebasis

- `app/timetable` als Fiori-Elements List Report mit Annotations (`app/timetable/annotations.cds`).
- `app/timetracking` als Custom-TypeScript-App mit eigenen Controllern (`app/timetracking/webapp/controller/*.ts`).
- Gemeinsame Service-Definition ueber `app/services.cds` und denselben CAP-Service.

## Entscheidung

Wir setzen Option B um. Beide Apps leben als Workspaces, teilen sich die Backend-OData und nutzen spezialisierte UI-Funktionalitaet. Annotations werden pro App gepflegt, wodurch FE-spezifische Einstellungen getrennt vom Custom Frontend bleiben. Das Deployment kann beide Bundles parallel ausliefern.

## Konsequenzen

- Positiv: Fachanwender erhalten eine sofort nutzbare FE-Liste, Entwickler koennen UI5-Funktionen im Dashboard frei gestalten.
- Positiv: Annotations in `app/timetable` und `srv/track-service/annotations/ui` koennen ohne Ruecksicht auf Custom Views optimiert werden.
- Negativ: Zwei Build-Pipelines (ui5.yaml) muessen gepflegt und getestet werden.
- Negativ: Gemeinsame Assets (i18n) muessen bewusst synchronisiert werden.

## Verweise

- `app/timetable/`
- `app/timetracking/`
- `app/services.cds`
- `srv/track-service/annotations/ui/timeentries-ui.cds`
- `srv/track-service/track-service.ts`
