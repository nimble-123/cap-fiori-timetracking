# ADR 0006: Modularisierung der CDS-Annotationen nach Concerns

## Status

Akzeptiert - Annotations-Refactoring (Iteration 2)

## Kontext und Problemstellung

Zu Beginn des Projekts wurden UI-Annotationen direkt in der Service-Definition oder in einer monolithischen Annotations-Datei abgelegt. Mit wachsenden Anforderungen an UI5-Konfigurationen (Field Controls, Value Helps, Capabilities, Entity-spezifische Layouts) wurde diese Datei schnell unübersichtlich. Änderungen an einer Entity erforderten Navigation durch hunderte Zeilen irrelevanter Annotationen. Wir benötigten eine klare Struktur, die unterschiedliche Concerns (Sicherheit, UI-Layout, Field Controls) voneinander trennt und gleichzeitig Team-Collaboration ermöglicht.

## Entscheidungsfaktoren

- Separation of Concerns: UI-Layout, Field Controls, Capabilities und Authorization sollen unabhängig voneinander wartbar sein.
- Team-Arbeit: Mehrere Entwickler sollen parallel an unterschiedlichen Annotation-Bereichen arbeiten können, ohne Merge-Konflikte zu verursachen.
- Wiederverwendbarkeit: Common-Patterns (z.B. `@readonly`, `@mandatory`) sollen zentral definiert und über alle Entities anwendbar sein.
- Übersichtlichkeit: Entity-spezifische UI-Layouts sollen in separaten Dateien liegen, um schnelles Auffinden zu ermöglichen.
- Tooling-Kompatibilität: Die Struktur muss mit Fiori Elements, SAP Business Application Studio und VS Code Extension kompatibel sein.

## Betrachtete Optionen

### Option A - Monolithische Annotations-Datei

- Alle Annotationen in einer Datei `srv/track-service/annotations.cds`.
- Alphabetische oder Entity-basierte Sortierung.
- Vorteil: Eine Datei zu pflegen.
- Nachteil: Schnell unübersichtlich (>1000 Zeilen), schwierig zu navigieren, hohe Merge-Konflikt-Wahrscheinlichkeit.

### Option B - Aufteilung nach Entity (flat)

- Je eine Datei pro Entity: `users-annotations.cds`, `projects-annotations.cds`, `timeentries-annotations.cds`.
- Alle Annotationen einer Entity in einer Datei.
- Vorteil: Entity-fokussierte Struktur.
- Nachteil: Duplizierung von Common-Patterns, schwierige Wiederverwendung von Field Controls und Capabilities.

### Option C - Zwei-Ebenen-Struktur: common/ und ui/

- `common/` - Shared Concerns über alle Entities: `labels.cds`, `field-controls.cds`, `capabilities.cds`, `value-helps.cds`, `authorization.cds`, `actions.cds`.
- `ui/` - Entity-spezifische UI-Layouts: `users-ui.cds`, `projects-ui.cds`, `activities-ui.cds`, `timeentries-ui.cds`, `balance-ui.cds`.
- Master-Import in `srv/track-service/annotations.cds` bindet alle Dateien ein.
- Vorteil: Klare Trennung, hohe Wiederverwendbarkeit, Team-Collaboration-freundlich.
- Nachteil: Höhere Datei-Anzahl, initiale Lernkurve für neue Entwickler.

## Entscheidung

Wir wählen **Option C** - die Zwei-Ebenen-Struktur mit `common/` und `ui/`. Die Struktur ist wie folgt organisiert:

```
srv/track-service/annotations/
├── annotations.cds           # Master Import (importiert alle Dateien)
├── common/                   # Shared Concerns
│   ├── labels.cds            # @Common.Text, @Common.TextArrangement, Titles
│   ├── field-controls.cds    # @readonly, @mandatory, @UI.Hidden
│   ├── capabilities.cds      # @Capabilities (InsertRestrictions, UpdateRestrictions)
│   ├── value-helps.cds       # @Common.ValueList (Dropdowns, F4-Hilfen)
│   ├── authorization.cds     # @restrict (Security, Roles)
│   └── actions.cds           # @Common.SideEffects, @Core.OperationAvailable
└── ui/                       # Entity-spezifische UI Layouts
    ├── users-ui.cds          # Users UI (LineItem, SelectionFields, HeaderInfo)
    ├── projects-ui.cds       # Projects UI Layout
    ├── activities-ui.cds     # ActivityTypes UI Layout
    ├── timeentries-ui.cds    # TimeEntries UI Layout (Hauptentity)
    └── balance-ui.cds        # MonthlyBalances UI Layout
```

Die Master-Datei `annotations.cds` importiert alle Dateien mit `using from './annotations/common/...'` und `using from './annotations/ui/...'`, wodurch eine zentrale Einstiegspunkt für die Annotation-Verwaltung gewährleistet wird.

## Konsequenzen

### Positiv

- **Separation of Concerns**: Field Controls (`@readonly`, `@mandatory`) sind zentral in `common/field-controls.cds` definiert und werden über alle Entities angewendet. Änderungen an Field Controls erfordern nur eine Datei-Anpassung.
- **Team-Collaboration**: UI-Experten arbeiten an `ui/`-Dateien, Security-Experten an `authorization.cds`, ohne sich gegenseitig zu blockieren.
- **Wiederverwendbarkeit**: Common-Patterns wie `@Common.Text` für Associations werden einmalig definiert und überall angewendet.
- **Schnelles Auffinden**: Entity-spezifische UI-Layouts sind in separaten Dateien, z.B. `timeentries-ui.cds` für alle TimeEntries-UI-Konfigurationen.
- **IDE-Support**: VS Code und SAP Business Application Studio können die Struktur gut navigieren und Auto-Completion liefert präzise Vorschläge.

### Negativ

- **Höhere Datei-Anzahl**: 11 Dateien statt 1 (6 in `common/`, 5 in `ui/`). Neue Entwickler müssen die Struktur erst verstehen.
- **Initiale Lernkurve**: Entwickler müssen wissen, wo welche Annotation-Art gepflegt wird (z.B. `@readonly` in `field-controls.cds`, UI-Layout in `ui/*.cds`).
- **Master-Import erforderlich**: Die `annotations.cds` muss bei neuen Dateien aktualisiert werden (alternativ Wildcard-Import, aber schlechter für explizite Kontrolle).

### Trade-offs

Wir akzeptieren die höhere Datei-Anzahl zugunsten von Wartbarkeit und Team-Collaboration. Die initiale Lernkurve wird durch klare Dokumentation in der Master-Datei und in `.github/copilot-instructions.md` kompensiert.

## Verweise

- `srv/track-service/annotations.cds` - Master Import mit Struktur-Dokumentation
- `srv/track-service/annotations/common/field-controls.cds` - Beispiel für Common-Patterns
- `srv/track-service/annotations/ui/timeentries-ui.cds` - Beispiel für Entity-spezifische UI-Layouts
- `.github/copilot-instructions.md` - Annotations-Struktur im AI-Development-Guide

## Hinweise für Entwickler

- **Field Controls hinzufügen**: In `common/field-controls.cds` annotieren
- **UI-Layout anpassen**: In `ui/<entity>-ui.cds` anpassen
- **Value Helps definieren**: In `common/value-helps.cds` definieren
- **Neue Annotation-Datei**: In Master-Import `annotations.cds` registrieren mit `using from './annotations/...'`
