# ADR 0013: CAP Attachments Plugin für Dokumentanhänge

## Status
Akzeptiert – Iteration 7 (Introduced Attachment Capability)

## Kontext und Problemstellung
Für die Object Page der TimeEntries sollen Benutzer Belege, Buchungsnachweise oder ergänzende Dokumente hochladen und abrufen können. Die Lösung muss sowohl lokal (SQLite) als auch in der HANA Cloud funktionieren, versionierbar sein und sich in die Fiori Elements Attachments Section integrieren. Gleichzeitig sollen Security-, Streaming- und Metadata-Aspekte konsistent über alle Umgebungen hinweg umgesetzt werden.

## Entscheidungsfaktoren
- **Standardkonformität:** Nutzung offizieller CAP-Erweiterungen statt individueller Implementierungen
- **Wartbarkeit:** Minimaler eigener Code für Medien-Handler, Fokus auf Fachlogik
- **Deployment-Flexibilität:** Funktioniert lokal (SQLite) und in produktiven HANA-Szenarien
- **Integration in Fiori Elements:** Attachment-Facet soll „out-of-the-box“ funktionieren
- **Kosten / Infrastruktur:** Vermeidung zusätzlicher Services oder Lizenzen, wenn nicht zwingend nötig

## Betrachtete Optionen

### Option A – SAP CAP Attachments Plugin (`@cap-js/attachments`) **(gewählt)**
- **Vorteile:**
  - Offizielle CAP-Erweiterung mit automatischen Handlern, Metadaten-Haltung und Streaming-Unterstützung
  - Funktioniert ohne zusätzliche Services sowohl auf SQLite als auch HANA
  - Fiori Attachments Facet kann direkt angebunden werden, inkl. Toggle über Customizing
- **Nachteile:**
  - Persistiert Binärdaten in der Datenbank (kein dediziertes Content Repository)
  - Funktionsumfang auf Standard-Anwendungsfälle beschränkt

### Option B – SAP Document Management Service Plugin (`@cap-js/sdm`)
- **Vorteile:**
  - Auslagerung der Binärdaten in einen dedizierten Content Store mit Versionierung & Sharing-Features
  - Geeignet für große Datenmengen und unternehmensweite Dokumentenverwaltung
- **Nachteile:**
  - Benötigt zusätzlich konfigurierten SAP Document Management Service (Kosten, Setup, Betrieb)
  - Höhere Komplexität (Authentifizierung, Destinations, Lifecycle-Management)
  - Overkill für projektinterne Attachments im MVP

### Option C – Eigenentwicklung (Custom Media Entity / Storage Service)
- **Vorteile:**
  - Maximale Kontrolle über Speicherort (z. B. S3, Azure Blob) und Business Rules
- **Nachteile:**
  - Hoher Entwicklungs- und Wartungsaufwand (Streaming, Security, Metadaten, Clean-up)
  - Risiko von Security- und Compliance-Lücken ohne geprüfte Standardkomponenten
  - Zusätzliche Tests & Dokumentation erforderlich

## Entscheidung
Wir setzen auf **Option A** und integrieren das CAP Attachments Plugin. Die `TimeEntries`-Entity wurde um eine `Composition of many Attachments` erweitert (`db/attachments.cds`). Das Plugin liefert alle notwendigen Handler und OData-Endpunkte, sodass Upload/Download direkt von Fiori Elements aus erfolgen kann. Die Sichtbarkeit steuern wir über das Customizing-Feld `hideAttachmentFacet`.

## Konsequenzen

**Positiv**
- Schnelle Implementierung ohne eigene Media-Handler
- Einheitliches Verhalten in Dev/Prod, Streaming unterstützt große Dateien
- Direkte Fiori Attachments Integration, UI-Toggle über Customizing

**Negativ**
- Binärdaten landen in der Datenbank – zusätzlicher Speicherbedarf
- Erweiterte Anforderungen (Versionierung, Sharing) müssten in Zukunft via DMS oder Custom-Lösung ergänzt werden

## Verweise
- `package.json` – Dependency `@cap-js/attachments`
- `db/attachments.cds` – Composition-Erweiterung für `TimeEntries`
- `srv/track-service/annotations/ui/timeentries-ui.cds` – Attachment-Facet + Hidden-Toggle
- `docs/ARCHITECTURE.md` – Abschnitt [8.8 Dokumentanhänge (Attachments Plugin)](#88-dokumentanhänge-attachments-plugin)
- `README.md` – Abschnitt „Key Features“ (Dokumentenanhänge)
