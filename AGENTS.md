# AI Agent Guide

## Purpose and Scope

- Unterstützt Entwickler:innen bei Aufgaben in einem SAP CAP / Fiori Time-Tracking Projekt.
- Liefert kontextsensitives Wissen über Architektur, Richtlinien und Workflows aus der bestehenden Dokumentation.
- Richtet sich an autonome oder halb-autonome Agents, die Code-, Dokumentations- oder Analyseaufgaben übernehmen.

## Projekt-Essentials

- **Domäne**: Zeiterfassung mit Fokus auf Projekterfassung, Saldenberechnung, Feiertagslogik und Bulk-Generierung von Arbeitstagen.
- **Architektur**: Fünfstufige Clean Architecture (Presentation, Application, Business Logic, Data, Infrastructure) mit Command-, Service-, Repository- und Validator-Pattern; konsequente Dependency Injection via `ServiceContainer`.
- **Technologie-Stack**: SAP Cloud Application Programming Model (Node.js), 100 % TypeScript, UI5 ≥ 1.120, SQLite (Dev) / SAP HANA (Prod), Jest für Tests, ESLint/Prettier.
- **Schlüsselartefakte**: `README.md` (Executive Overview), `docs/ARCHITECTURE.md` (arc42-Detail), `GETTING_STARTED.md`, ADRs unter `docs/ADR/`.

## Agent-Verantwortlichkeiten

- Geschäfts- und Architekturkontext aus `README.md`, `docs/ARCHITECTURE.md` und ADRs heranziehen, bevor Änderungen vorgeschlagen werden.
- Änderungen entsprechend der Layer-Trennung platzieren (z. B. Commands im Business-Logic-Layer, Handler im Application-Layer, Repositories im Data-Layer).
- Typensicherheit aufrechterhalten (keine `any`, Interfaces/DTOs bevorzugen, CAP CDS-Definitionen beachten).
- Dokumentation synchron halten (Änderungen an APIs, Verhalten oder Architektur auch in relevanten Markdown-Dateien nachführen).
- Tests berücksichtigen: existierende Jest-Suites respektieren und für neue Businesslogik eigene Tests ergänzen.

## MCP-Server und Tools

- **sap-docs**: Aggregierte SAP-Dokumentation über HTTP-Server (ABAP, CAP, UI5, OpenUI5, SAP Community).
- **cap-js/mcp-server**: Zugriff auf CAP-Dokumentation, API-Referenzen und Best Practices für CAP Node.js/TypeScript.
- **@sap-ux/fiori-mcp-server**: Informationen zu Fiori Elements, UI5 Templates, Annotationen und SAP Fiori Guidelines.
- **@ui5/mcp-server**: Tiefere UI5-API-Referenzen (Controls, MVC, i18n, Routing).

Zusätzliche lokale Werkzeuge:

- `rg` für Code- und Textsuchen (schneller als `grep`).
- `npm run watch` für CAP-Server & UI5 Development Preview.
- `npm test` für Jest-Suites; `npm run lint` falls verfügbar.
- REST-Client-Dateien unter `tests` für manuelle OData-Calls.

## Relevante Wissensquellen

- **Architektur**: `docs/ARCHITECTURE.md` (Bausteinsichten, Laufzeit-Flows, Qualitätsziele).
- **Serviceverhalten**: `srv/track-service/` (Handlers, Commands, Services).
- **Datenmodell**: `db/data-model.cds`, plus CSV-Stammdaten in `db/data/`.
- **UI-Schichten**: `app/timetable` (Fiori Elements) und `app/timetracking` (Custom UI5 mit TypeScript).
- **Integrationen**: Feiertags-API, Attachments Plugin (`@cap-js/attachments`), Logging über Infrastruktur-Layer.

## Arbeitsabläufe für Agents

1. **Anforderung verstehen**: Anforderungen, betroffene Layer und Qualitätsziele identifizieren.
2. **Kontext recherchieren**: CDS-Modelle, bestehende Commands/Services/Handlers prüfen (z. B. mittels `rg`, Projektstruktur, ADRs).
3. **Plan erstellen**: Grobplan mit Schritten für Code, Tests, Dokumentation formulieren, bevor Änderungen umgesetzt werden.
4. **Implementieren**: Layer-Konventionen beachten, DI-Container aktualisieren, Barrel-Exports pflegen, Typsicherheit sicherstellen.
5. **Validieren**: Relevante Tests (`npm test`) und ggf. `npm run lint` ausführen; bei UI-Anpassungen Auto-Previews anpassen.
6. **Dokumentieren**: Release-Notes, README, Architekturzusätze oder ADRs aktualisieren, falls Verhalten oder Struktur sich ändert.
7. **Review vorbereiten**: Zusammenfassung der Änderung, Testergebnisse und offene Punkte bereitstellen.

## Coding- & Architektur-Guidelines

- **TypeScript only**: keine JavaScript-Dateien hinzufügen; CAP-Handler strikt typisieren.
- **Separation of Concerns**: Businesslogik nicht in Handlern, sondern in Commands/Services kapseln.
- **Dependency Injection**: neue Komponenten im `ServiceContainer` registrieren, Unit-Tests über Interfaces und Mocks realisieren.
- **Validation & Error Handling**: bestehende Validator-Pipeline nutzen, Fehler als CAP `ServiceError` mit Codes/Details zurückgeben.
- **Internationalisierung**: UI-Änderungen in `_i18n` prüfen; neue Texte in `i18n.properties` ablegen.
- **Logging**: strukturiertes Logging über bereitgestellte Logger-Utilities nutzen, keine `console.log`.
- **Performance**: Langläufer vermeiden, Caching-Utilities beachten (siehe Abschnitt 8.6 der Architektur-Doku).

## Umgebung & Einschränkungen

- Lokale Laufzeit: Node.js ≥ 18, `npm install` zum Setup; `.env` Dateien niemals einchecken.
- Datenbank: SQLite lokal (`db.sqlite`), Migrationen via `cds deploy`. In Prod ist SAP HANA vorgesehen – SQL-Statements müssen kompatibel sein.
- Netzwerkzugriff ist eingeschränkt; externe Abhängigkeiten nur über freigegebene Schnittstellen (z. B. Feiertags-API) nutzen.

## Domänenspezifische Hinweise

- **Kern-Entities**: `TimeEntries`, `Projects`, `Users`, `ActivityTypes`, `EntryTypes`, `Customizing`.
- **Bulk-Generierung**: Strategien (`Monthly`, `Yearly`) kombinieren API-Abfragen für Feiertage mit Entry-Erzeugung.
- **Saldo-Logik**: Commands transformieren Daten in Monats- und Gesamtsalden; UI zeigt Criticality via Annotations.
- **Attachments**: `@cap-js/attachments` sorgt für Upload/Download; bei Änderungen Konsistenz zwischen Backend und UI prüfen.

## Qualitäts-Checkliste vor Abschluss

- Relevante Tests laufen grün (oder es gibt eine Begründung plus offenen Task).
- Code entspricht Layering-, Typisierung- und Style-Vorgaben.
- Dokumentation/ADR aktualisiert, falls Architektur- oder Prozessentscheidungen betroffen sind.
- Reviewer erhalten klare Beschreibung von Änderung, Tests und offenen Fragen.

## Eskalation & Zusammenarbeit

- Unklare Anforderungen oder Architekturfragen im Zweifel mit Maintainer-Team (Development Team) abstimmen.
- Bei größeren Entscheidungen (z. B. neue Integration, Pattern-Wechsel) einen neuen ADR-Eintrag vorbereiten.
- Offene Risiken oder technische Schulden in `docs/ARCHITECTURE.md` Abschnitt 11 ergänzen.

## Rules for creation or modification of SAP Fiori elements apps

- When asked to create an SAP Fiori elements app check whether the user input can be interpreted as an application organized into one or more pages containing table data or forms, these can be translated into a SAP Fiori elements application, else ask the user for suitable input.
- The application typically starts with a List Report page showing the data of the base entity of the application in a table. Details of a specific table row are shown in the ObjectPage. This first Object Page is therefore based on the base entity of the application.
- An Object Page can contain one or more table sections based on to-many associations of its entity type. The details of a table section row can be shown in an another Object Page based on the associations target entity.
- The data model must be suitable for usage in a SAP Fiori elements frontend application. So there must be one main entity and one or more navigation properties to related entities.
- Each property of an entity must have a proper datatype.
- For all entities in the data model provide primary keys of type UUID.
- When creating sample data in CSV files, all primary keys and foreign keys MUST be in UUID format (e.g., `550e8400-e29b-41d4-a716-446655440001`).
- When generating or modifying the SAP Fiori elements application on top of the CAP service use the Fiori MCP server if available.
- When attempting to modify the SAP Fiori elements application like adding columns you must not use the screen personalization but instead modify the code of the project, before this first check whether an MCP server provides a suitable function.
- When previewing the SAP Fiori elements application use the most specific `npm run watch-*` script for the app in the `package.json`.

## Guidelines for UI5

Use the `get_guidelines` tool of the UI5 MCP server to retrieve the latest coding standards and best practices for UI5 development.
Other UI5 MCP Tools:

- create_ui5_app: Scaffolds a new UI5 application based on a set of templates.
- get_api_reference: Fetches and formats UI5 API documentation.
- get_guidelines: Provides access to UI5 development best practices.
- get_project_info: Extracts metadata and configuration from a UI5 project.
- get_version_info: Retrieves version information for the UI5 framework.
- run_ui5_linter: Integrates with @ui5/linter to analyze and report issues in UI5 code.

## Guidelines for CAP

- You MUST search for CDS definitions, like entities, fields and services (which include HTTP endpoints) with cds-mcp, only if it fails you MAY read \*.cds files in the project.
- You MUST search for CAP docs with cds-mcp EVERY TIME you create, modify CDS models or when using APIs or the `cds` CLI from CAP. Do NOT propose, suggest or make any changes without first checking it.
