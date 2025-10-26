# ADR 0009: Source-Feld zur Unterscheidung von UI- und System-generierten Einträgen

## Status

Akzeptiert - Bulk-Generierung-Feature (Iteration 5)

## Kontext und Problemstellung

Die Anwendung unterstützt zwei Modi zur Erstellung von TimeEntries:

1. **Manuelle Erfassung via UI**: Benutzer erstellen einzelne Einträge über Fiori Elements oder Custom UI5 mit spezifischen Zeitangaben (z.B. 8:00-16:30 Uhr).
2. **Automatische Generierung**: Monatliche/Jährliche Bulk-Generierung von Standardeinträgen mit Default-Werten (z.B. 8:00-16:00 Uhr für Arbeitstage, Urlaub/Feiertage).

Ohne Kennzeichnung der Herkunft entstanden folgende Probleme:

1. **Undurchsichtige Datenherkunft**: Bei Rückfragen war nicht klar, ob ein Eintrag manuell erfasst oder automatisch generiert wurde.
2. **Fehlende Audit-Trails**: Keine Möglichkeit, nachzuvollziehen, welche Einträge durch Bulk-Generierung entstanden.
3. **Schwierige Fehlerdiagnose**: Bei falschen Werten war unklar, ob Fehler in der UI-Erfassung oder in der Generation-Logik lagen.
4. **Probleme bei Reports**: Keine Filterung nach Datenherkunft möglich (z.B. "Zeige nur manuell erfasste Einträge").
5. **Inkonsistente Berechtigungslogik**: Keine Unterscheidung zwischen Einträgen, die vom System vorgeschlagen wurden (editierbar) und finalen User-Eingaben.

Wir benötigten ein Feld, das die Herkunft jedes TimeEntries klar dokumentiert und Filterung/Reporting ermöglicht.

## Entscheidungsfaktoren

- **Nachvollziehbarkeit**: Jeder Eintrag muss seine Herkunft (UI vs. System-generiert) dokumentieren.
- **Einfache Implementierung**: Das Feld soll automatisch gesetzt werden, ohne dass Entwickler es manuell pflegen müssen.
- **Filterbarkeit**: UI5-Apps sollen nach Source filtern können (z.B. "Zeige nur generierte Einträge").
- **Audit-Trails**: Reports und Logs sollen Datenherkunft auswerten können.
- **Erweiterbarkeit**: Zukünftige Quellen (z.B. "IMPORTED" für externe Daten) sollen einfach hinzufügbar sein.
- **Performance**: Das Feld darf keine Performance-Einbußen verursachen.

## Betrachtete Optionen

### Option A - Keine Kennzeichnung

- Alle Einträge ohne Source-Feld.
- Vorteil: Einfach, keine zusätzliche Logik.
- Nachteil: Undurchsichtige Datenherkunft, keine Filterung, schwierige Fehlerdiagnose.

### Option B - Boolean-Feld `isGenerated`

- Feld `isGenerated: Boolean` in TimeEntries.
- `true` für generierte, `false` für manuelle Einträge.
- Vorteil: Einfache Filterung via Boolean-Checks.
- Nachteil: Nicht erweiterbar für zukünftige Quellen (z.B. "IMPORTED"), unklare Semantik für neue Entwickler.

### Option C - String-Feld `source` mit Enum-Werten

- Feld `source: String(20)` in TimeEntries.
- Werte: `'UI'` für manuelle Erfassung, `'GENERATED'` für Bulk-Generierung.
- Automatisches Setzen in Commands/Factories.
- Vorteil: Erweiterbar (zukünftig `'IMPORTED'`, `'API'`), klare Semantik, einfache Filterung.
- Nachteil: Zusätzliches Feld in der Datenbank, Entwickler müssen daran denken, es zu setzen.

### Option D - Separate Tabelle für Generierungs-Metadaten

- Eigene Entity `TimeEntryMetadata` mit Herkunft, Generierungszeitpunkt, etc.
- Vorteil: Saubere Trennung, umfangreiche Metadaten möglich.
- Nachteil: Hohe Komplexität, Overhead für einfache Herkunfts-Kennzeichnung, schlechte Performance bei Joins.

## Entscheidung

Wir wählen **Option C** - ein String-Feld `source` mit Enum-Werten. Das Feld wird automatisch in Commands und Factories gesetzt:

### Datenmodell-Erweiterung

```cds
// db/data-model.cds
entity TimeEntries : managed, cuid {
  // ... andere Felder
  source: String(20);  // 'UI' | 'GENERATED' | (zukünftig: 'IMPORTED', 'API')
}
```

### Automatisches Setzen in Commands

**CreateTimeEntryCommand** (UI-Erfassung):

```typescript
async execute(tx: Transaction, entryData: Partial<TimeEntry>): Promise<any> {
  // Kein explizites Setzen von 'source' - wird von UI-Client nicht übergeben
  // Handler setzt später 'UI' als Default (siehe Handler-Implementierung)

  const result = await this.processEntry(tx, entryData);
  logger.commandEnd('CreateTimeEntry', { source: entryData.source || 'UI', entryType: entryData.entryType_code });
  return result;
}
```

**GenerateMonthlyCommand/GenerateYearlyCommand** (Bulk-Generierung):

```typescript
async execute(tx: Transaction, params: GenerationParams): Promise<GenerationResult> {
  const entries = await this.strategy.generate(/* ... */);

  // Jeder generierte Eintrag erhält 'source: GENERATED'
  // Wird in TimeEntryFactory.createDefaultEntry/createWeekendEntry/createHolidayEntry gesetzt

  logger.commandEnd('GenerateMonthly', { source: 'GENERATED', count: entries.length });
  return { entries, count: entries.length };
}
```

### Automatisches Setzen in Factories

**TimeEntryFactory** setzt `source: 'GENERATED'` für alle generierten Einträge:

```typescript
static createDefaultEntry(userID: string, date: Date, user: User): TimeEntry {
  return {
    // ... andere Felder
    source: 'GENERATED',  // <- Automatisch gesetzt
  };
}

static createWeekendEntry(userID: string, date: Date, user: User): TimeEntry {
  return {
    // ... andere Felder
    source: 'GENERATED',  // <- Automatisch gesetzt
  };
}

static createHolidayEntry(userID: string, date: Date, user: User, holidayName: string): TimeEntry {
  return {
    // ... andere Felder
    source: 'GENERATED',  // <- Automatisch gesetzt
  };
}
```

### UI-Filterung

In Fiori Elements können Benutzer nach Source filtern:

```xml
<!-- app/timetable/webapp/annotations.cds -->
<SelectionFields>
  <PropertyRef Property="source"/>
</SelectionFields>
```

## Konsequenzen

### Positiv

- **Nachvollziehbarkeit**: Jeder Eintrag dokumentiert seine Herkunft (`'UI'` vs. `'GENERATED'`), was Audit-Trails und Fehlerdiagnose vereinfacht.
- **Einfache Filterung**: UI5-Apps können nach Source filtern (z.B. "Zeige nur generierte Einträge" für Review vor Freigabe).
- **Erweiterbarkeit**: Zukünftige Quellen (z.B. `'IMPORTED'` für externe Zeiterfassungssysteme) sind einfach hinzufügbar.
- **Automatisches Setzen**: Commands und Factories setzen das Feld automatisch, Entwickler müssen nicht daran denken.
- **Performance**: Einfaches String-Feld ohne Performance-Impact, indizierbar für schnelle Filterung.
- **Logging-Integration**: Logger nutzt Source-Wert in Log-Messages (z.B. `commandEnd('CreateTimeEntry', { source: 'GENERATED' })`).

### Negativ

- **Zusätzliches Feld**: Ein weiteres Feld in der TimeEntries-Entity, was Speicherbedarf leicht erhöht (ca. 20 Bytes pro Eintrag).
- **Nicht-validiert**: String-Feld ist nicht typsicher (keine Enum-Validierung auf DB-Ebene), falsche Werte möglich.
- **Initiale Migration**: Bestehende Einträge haben kein Source-Feld und müssen nachträglich klassifiziert werden (z.B. via Update-Script).

### Trade-offs

Wir akzeptieren das zusätzliche Feld und fehlende DB-Enum-Validierung zugunsten von Nachvollziehbarkeit und Erweiterbarkeit. In TypeScript wird das Feld durch `@cap-js/cds-typer` typisiert, was falsche Werte zur Compile-Zeit verhindert.

## Beispiel-Code

### Erstellung via UI (Handler setzt 'UI')

```typescript
// Handler für manuelle Erstellung
class TimeEntryHandlers {
  async onCreate(req: Request) {
    const data = req.data;

    // 'source' wird nicht vom UI-Client übergeben
    // Setze Default-Wert 'UI' für manuelle Erfassung
    if (!data.source) {
      data.source = 'UI';
    }

    const result = await this.createCommand.execute(req.transaction, data);
    return result;
  }
}
```

### Bulk-Generierung (Factory setzt 'GENERATED')

```typescript
// TimeEntryFactory.createDefaultEntry()
static createDefaultEntry(userID: string, date: Date, user: User): TimeEntry {
  const dateString = DateUtils.toLocalDateString(date);

  return {
    user_ID: userID,
    workDate: dateString,
    entryType_code: 'W',
    startTime: '08:00:00',
    endTime: '16:00:00',
    breakMin: 30,
    source: 'GENERATED',  // <- Kennzeichnung als System-generiert
    note: `Automatisch generiert am ${DateUtils.toGermanDateString(new Date())}`,
  };
}
```

### Filterung in UI5

```typescript
// Fiori Elements Filter
const filter = new Filter('source', FilterOperator.EQ, 'GENERATED');
this.byId('timeEntriesTable').getBinding('items').filter([filter]);
```

### Reporting-Query

```sql
-- SQL-Abfrage für Report
SELECT
  source,
  COUNT(*) as count,
  SUM(durationHoursNet) as totalHours
FROM TimeEntries
WHERE workDate >= '2025-01-01' AND workDate <= '2025-12-31'
GROUP BY source;

-- Ergebnis:
-- source    | count | totalHours
-- UI        | 120   | 960.00
-- GENERATED | 220   | 1760.00
```

## Zukünftige Erweiterungen

Das Source-Feld ist für weitere Quellen erweiterbar:

- `'IMPORTED'` - Aus externem Zeiterfassungssystem importiert (z.B. SAP SuccessFactors)
- `'API'` - Via REST-API von Drittsystem erstellt
- `'MIGRATED'` - Aus Legacy-System migriert
- `'ADJUSTED'` - Vom System automatisch korrigiert (z.B. nach Policy-Änderung)

## Verweise

- `db/data-model.cds` - TimeEntries Entity mit `source`-Feld
- `srv/track-service/handler/factories/TimeEntryFactory.ts` - Automatisches Setzen von `source: 'GENERATED'`
- `srv/track-service/handler/commands/time-entry/CreateTimeEntryCommand.ts` - Logging mit Source-Wert
- `srv/track-service/handler/handlers/TimeEntryHandlers.ts` - Default-Setzen von `source: 'UI'` bei manueller Erfassung
- `.github/copilot-instructions.md` - Source-Feld im AI-Development-Guide

## Hinweise für Entwickler

- **Neue Quelle hinzufügen**: Einfach neuen String-Wert definieren (z.B. `'IMPORTED'`) und in entsprechender Command/Factory setzen.
- **Source prüfen**: Nutze TypeScript-Checks wie `if (entry.source === 'GENERATED')` für bedingungsbasierte Logik.
- **Logging**: Übergebe Source-Wert immer in Log-Context (z.B. `logger.commandEnd('CreateTimeEntry', { source })`).
- **Migration**: Für bestehende Einträge ohne Source kann ein Update-Script ausgeführt werden, das historische Einträge auf `'UI'` setzt.
