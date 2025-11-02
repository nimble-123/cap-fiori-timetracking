# ADR 0020: Holiday API Integration via BTP Destination + Connectivity

## Status

Akzeptiert – November 2025

## Kontext und Problemstellung

Die Feiertags-API (feiertage-api.de) wird für die automatische Jahresgenerierung von Zeiteinträgen benötigt, um deutsche Feiertage korrekt zu erkennen und als nicht-arbeitende Tage zu markieren. Lokal erfolgt der Zugriff per direktem HTTP-Call via `fetch()`, produktiv soll die Integration über SAP BTP Destination + Connectivity Service erfolgen.

Die zentrale Frage war: Wie integrieren wir eine externe REST-API sowohl in der lokalen Entwicklung als auch in der BTP-Produktionsumgebung, ohne Credentials im Code zu speichern und gleichzeitig eine einfache Developer Experience zu gewährleisten?

## Entscheidungsfaktoren

- Security: Keine hardcoded URLs oder Credentials in Code oder Repository
- Ops-Friendly: URL-Änderungen ohne Code-Deployment möglich
- Developer Experience: Lokale Entwicklung ohne BTP-Setup funktionsfähig
- Cloud-Native: Nutzung von SAP BTP Standard-Services (Destination, Connectivity)
- Proxy-Support: Corporate Firewalls und On-Premise-Integration über Connectivity Service
- Audit Trail: Logging aller externen API-Calls in BTP

## Betrachtete Optionen

### Option A - Direct Fetch überall

- Direkter HTTP-Call via `fetch()` in allen Umgebungen
- URL-Konfiguration über Environment Variables (`.env`)
- Keine BTP-Services notwendig

### Option B - CAP Remote Services

- Definition der Holiday-API als CAP Remote Service mit OData-Metadaten
- Nutzung von `cds.requires` für Service-Binding
- Integration über CAP-Standard-Patterns

### Option C - Hybrid-Ansatz mit Destination + Connectivity (gewählt)

- Lokal: Direct HTTP via `fetch()` mit `HOLIDAY_API_BASE_URL` aus `.env`
- BTP: Destination-basiert via `@sap-cloud-sdk/connectivity` und `@sap-cloud-sdk/http-client`
- Environment-Detection über `NODE_ENV` und `VCAP_SERVICES`

## Entscheidung

Wir wählen **Option C** – einen Hybrid-Ansatz mit zwei Code-Pfaden im `HolidayService`:

```typescript
async getHolidays(year: number, stateCode: string): Promise<Map<string, Holiday>> {
  if (this.isProduction()) {
    return await this.fetchViaDestination(year, stateCode);
  } else {
    return await this.fetchDirectly(year, stateCode);
  }
}

private isProduction(): boolean {
  return process.env.NODE_ENV === 'production' || !!process.env.VCAP_SERVICES;
}
```

### Implementierung

#### Lokal (Development)

- Direct HTTP-Call via `fetch()` mit konfigurierter Base-URL
- URL aus `.env`: `HOLIDAY_API_BASE_URL=https://feiertage-api.de`
- Timeout: 5 Sekunden via `AbortSignal.timeout(5000)`

#### BTP (Production)

- Destination `holiday-api` definiert in `mta.yaml` mit:
  - URL: `https://feiertage-api.de`
  - ProxyType: `Internet`
  - Authentication: `NoAuthentication`
- HTTP-Calls via `@sap-cloud-sdk/http-client.executeHttpRequest()`
- Automatisches Routing über Connectivity Service

#### Cache-Strategie

- Cache pro Jahr + Bundesland (Key: `${year}-${stateCode}`)
- Lifetime: Service-Runtime (Feiertage sind statisch)
- Invalidierung: Bei Server-Restart

#### Error Handling

- Graceful Degradation: Bei API-Fehlern wird leere Map zurückgegeben
- Yearly Generation funktioniert auch ohne Feiertage (markiert alle Werktage als Work-Entries)
- Strukturiertes Logging via `logger.serviceCall()` und `logger.error()`

## Konsequenzen

### Positiv

- **Security**: Keine Credentials im Code – Destination wird in BTP Cockpit verwaltet
- **Ops-Friendly**: URL-Änderungen ohne Deployment (nur Destination-Update im Cockpit)
- **Developer Experience**: Lokale Entwicklung mit `npm run watch` ohne BTP-Setup
- **Proxy Support**: Corporate Firewalls und On-Premise-Szenarien via Connectivity Service
- **Audit Trail**: Alle API-Calls werden in BTP Application Logs erfasst
- **Testbarkeit**: Unit Tests können beide Code-Pfade über Environment Variables testen

### Negativ

- **Komplexität**: Zwei Code-Pfade (Direct + Destination) erhöhen Wartungsaufwand
- **Testing**: Mocking von `executeHttpRequest()` nötig für Unit Tests
- **Dependencies**: Zusätzliche NPM-Pakete (`@sap-cloud-sdk/connectivity`, `@sap-cloud-sdk/http-client`)
- **Betriebskosten**: BTP Destination + Connectivity Services (Lite-Plan kostenlos, aber Service-Overhead)

### Neutral

- **Caching**: Cache-Strategie ist unabhängig von der Fetch-Methode
- **API-Stabilität**: Feiertags-API ist public und stabil (seit 2015 verfügbar)

## Alternativen und warum verworfen

### Option A verworfen

- ❌ Keine Unterstützung für Corporate Proxy/Firewall
- ❌ Credentials/URLs im Code oder Umgebungsvariablen (nicht Cloud-Native)
- ❌ Keine Audit Logs in BTP

### Option B verworfen

- ❌ feiertage-api.de ist REST-API ohne OData-Metadaten
- ❌ CAP Remote Services sind primär für SAP-OData-Services (S/4HANA, SuccessFactors) konzipiert
- ❌ Overhead für einfache GET-Requests ohne komplexes Entity-Modell

## Verweise

- `srv/track-service/handler/services/HolidayService.ts` – Hybrid-Implementierung
- `mta.yaml` – Destination-Konfiguration unter `resources.cap-fiori-timetracking-destination`
- `tests/track-service.test.js` – Integration Tests für Holiday API (Describe-Block: `TrackService - HolidayService Integration`)
- `.env.example` – `HOLIDAY_API_BASE_URL` Environment Variable
- [SAP Cloud SDK Connectivity Docs](https://sap.github.io/cloud-sdk/docs/js/features/connectivity/destinations)
- [Feiertage-API Dokumentation](https://feiertage-api.de)

## Erweiterungsmöglichkeiten

- **Rate Limiting**: Implementierung eines Rate-Limit-Trackers für API-Calls
- **Fallback auf lokale Daten**: JSON-File mit deutschen Feiertagen 2020-2030 als Offline-Fallback
- **Multi-Country Support**: Erweiterung auf andere Länder (aktuell nur Deutschland)
- **Custom Holiday Management**: Admin-UI für manuelle Feiertags-Pflege (Company-specific)
