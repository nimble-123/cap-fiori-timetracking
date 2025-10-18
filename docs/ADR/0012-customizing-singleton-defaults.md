# ADR 0012: Customizing-Singleton für globale Defaults

## Status
Akzeptiert – Iteration 6 (Global Defaults Refactoring)

## Kontext und Problemstellung
Bislang waren zahlreiche globale Standardwerte direkt im Code oder als CDS-`default` hinterlegt. Dazu zählen u. a. Arbeitsbeginn (08:00), Pausenlänge, EntryType-Codes (`W`, `O`, `H`), Source-Codes (`UI`, `GENERATED`), Fallback-Werte für Wochenstunden/Arbeitstage sowie Schwellenwerte für Salden-, Urlaubs- und Krankenstandsberechnungen. Diese harte Kodierung führte zu folgenden Schwierigkeiten:

1. **Hoher Änderungsaufwand:** Jede fachliche Anpassung erforderte einen Code-Change samt Deployment.
2. **Inkonsistenzen:** Verschiedene Komponenten hielten eigene Defaults vor (Factory, Commands, Validatoren, Services, UI).
3. **Fehlende Transparenz:** Es gab keinen zentralen Ort, an dem Key User Defaults prüfen oder pflegen konnten.
4. **Testing Pain:** Unit-Tests mussten Werte mocken oder Duplikate pflegen; Integrationstests hatten keine kontrollierte Quelle.
5. **Internationalisierung & Locale:** `DateUtils` war fest auf `de-DE` eingestellt, obwohl andere Mandanten denkbar sind.

Wir benötigen eine zentrale, pflegbare Quelle für alle nicht user-spezifischen Defaults mit konsistentem Zugriff.

## Entscheidungsfaktoren
- **Single Source of Truth:** Alle Komponenten sollen denselben Default-Wert nutzen.
- **Konfigurierbarkeit zur Laufzeit:** Key User sollen Defaults ohne Deployment ändern können.
- **Performanter Zugriff:** Werte sollen einmal geladen und mehrfach verwendet werden (Caching).
- **Testbarkeit:** Unit-Tests müssen Defaults einfach mocken können; Integrationstests brauchen initiale Seed-Daten.
- **Sicherheit:** Pflege der Defaults soll rollenbasiert eingeschränkt werden.
- **Übersichtlichkeit:** Lösung soll ohne redundante Tabellen oder komplexe Migrationspfade auskommen.

## Betrachtete Optionen

### Option A – Harte Kodierung im Code/Schema (Status quo)
- **Vorteile:** Kein zusätzlicher Aufwand, bekannte Implementierung.
- **Nachteile:** Keine Konfigurierbarkeit, Inkonsistenzen, erhöhter Test- und Pflegeaufwand.

### Option B – Mehrere Konfigurationstabellen pro Bereich
- z. B. separate Entities für Zeit-Defaults, Balances, UI usw.
- **Vorteile:** Hohe Granularität, theoretisch explizite Ownership je Bereich.
- **Nachteile:** Fragmentierte Pflege, hoher Overhead (mehrere Tabellen, Services, Authorization-Regeln).

### Option C – Singleton-Entität `Customizing` mit Service-Layer (gewählt)
- Eine Entity hält alle globalen Default-Werte; `CustomizingService` cached die Daten und stellt Typsicherheit bereit.
- **Vorteile:** Single Source of Truth, einfacher Zugriff via Service, klare Berechtigung, geringer Codelärm.
- **Nachteile:** Größere Entity mit vielen Feldern, Validierung der Inhalte muss im Service erfolgen.

## Entscheidung
Wir implementieren **Option C**. Die Entity `Customizing` wird als Singleton im Datenmodell (`db/data-model.cds`) definiert und initial per CSV (`db/data/io.nimble-Customizing.csv`) geladen. Ein neuer `CustomizingService` liest den Datensatz beim Service-Start, cached ihn und stellt Typsichere Getter (TimeEntry-, User-, Balance-, Vacation-/Sick-Leave-, Holiday-API-Defaults). `TrackService.init()` ruft `customizingService.initialize()` auf und konfiguriert anschließend `DateUtils`. Business-Komponenten (Factories, Commands, Validators, Services) beziehen ihre Defaults ausschließlich über `CustomizingService`.

## Konsequenzen

**Positiv**
- Single Source of Truth für alle globalen Defaults.
- Änderungen können ohne Deployment vorgenommen werden (Fiori Elements Object Page für Key User).
- Tests können Defaults zentral mocken; Integrationstests erhalten deterministische Seed-Daten.
- `DateUtils` und HolidayService verwenden konfigurierbare Locale und API-Parameter.
- Autorisierung differenziert zwischen Lesezugriff (alle) und Pflege (Admin).

**Negativ**
- Zusätzliche Entity/Felder erhöhen den Pflegeaufwand (Validierung, Dokumentation).
- Falsche Werte im Customizing können Systemverhalten brechen; daher Monitoring/Validierung erforderlich.
- Migration bestehender Hardcodings auf den Service verursachte initialen Refactorings-Aufwand.

## Verweise
- `db/data-model.cds` – Definition der `Customizing`-Entity
- `db/data/io.nimble-Customizing.csv` – Initiale Seed-Daten
- `srv/track-service/handler/services/CustomizingService.ts` – Zugriff & Caching
- `srv/track-service/handler/container/ServiceContainer.ts` – Wiring & Berechtigungen
- `srv/track-service/track-service.ts` – Initialisierung & DateUtils-Konfiguration
- `srv/track-service/annotations/ui/customizing-ui.cds` – Fiori Elements Object Page
