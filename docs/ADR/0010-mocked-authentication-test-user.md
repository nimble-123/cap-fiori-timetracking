# ADR 0010: Mocked Authentication mit Test-Usern für lokale Entwicklung

## Status

Akzeptiert - Projektstart (historisch)

## Kontext und Problemstellung

Für die lokale Entwicklung der Zeiterfassungs-Anwendung benötigten wir ein einfaches Authentication-System, das folgende Anforderungen erfüllt:

1. **Schneller Entwicklungs-Workflow**: Entwickler sollen sich ohne komplexe OAuth2/XSUAA-Konfiguration anmelden können.
2. **Multi-User-Testing**: Testen von User-spezifischen Features (z.B. eigene TimeEntries, User-Präferenzen) erfordert mehrere Test-User.
3. **Realistische User-IDs**: User-IDs sollen E-Mail-Format haben, um Production-ähnliche Daten zu simulieren (z.B. `max.mustermann@test.de` statt `user1`).
4. **Einfache Credentials**: Login-Credentials (Username/Password) sollen einfach merkbar sein für Entwickler und Tester.
5. **Keine externe Abhängigkeit**: Keine Notwendigkeit für externe Identity Provider (z.B. SAP Identity Authentication Service) während lokaler Entwicklung.
6. **Production-Ready Migration**: Das System soll einfach auf echte Authentication (z.B. XSUAA, JWT) umstellbar sein ohne Code-Änderungen in Business-Logik.

Frühe Prototypen nutzten keine Authentication, was zu folgenden Problemen führte:

- User-spezifische Features (z.B. `UserService.getCurrentUserID()`) konnten nicht getestet werden.
- TimeEntries hatten keine realistischen User-Zuordnungen.
- Multi-User-Szenarien (z.B. Team-Lead sieht Einträge von Mitarbeitern) waren nicht testbar.

## Entscheidungsfaktoren

- **Einfachheit**: Entwickler sollen ohne Setup lokale Entwicklung starten können.
- **Multi-User-Support**: Mindestens 2 Test-User für verschiedene Szenarien.
- **Realistische Daten**: User-IDs im E-Mail-Format, deutsche Namen für bessere Lesbarkeit.
- **CAP-native**: Nutzung der CAP-eigenen `auth.kind: mocked` Konfiguration ohne zusätzliche Libraries.
- **Production-Kompatibilität**: Einfacher Wechsel zu echter Authentication in Production.

## Betrachtete Optionen

### Option A - Keine Authentication (Anonymous)

- Kein Login, alle Requests als anonymer User.
- Vorteil: Kein Setup, einfachste Lösung.
- Nachteil: User-spezifische Features nicht testbar, unrealistische Production-Umgebung.

### Option B - Hard-coded User im Code

- `UserService.getCurrentUserID()` gibt Hard-coded User-ID zurück (z.B. `'user123'`).
- Vorteil: Einfach, keine Authentication-Konfiguration.
- Nachteil: Multi-User-Testing unmöglich, unrealistische User-IDs, Code-Änderungen für Production notwendig.

### Option C - CAP Mocked Authentication mit Test-Usern

- Nutzung von CAP's `auth.kind: mocked` in `package.json`.
- Definition von Test-Usern mit Credentials und Rollen.
- Login via Standard-CAP-Login-Seite (`/login`).
- Vorteil: CAP-native, Multi-User-Support, realistische User-IDs, keine Code-Änderungen für Production.
- Nachteil: Zusätzliche Konfiguration in `package.json`.

### Option D - Lokaler OAuth2 Mock-Server

- Separater Mock-Server (z.B. Keycloak, Mock-XSUAA) für lokale Entwicklung.
- Vorteil: Production-nahe Authentication-Flows.
- Nachteil: Hohe Komplexität, zusätzliche Infrastruktur, langsamer Setup.

## Entscheidung

Wir wählen **Option C** - CAP Mocked Authentication mit Test-Usern. Die Konfiguration erfolgt in `package.json` unter `cds.requires.auth`:

### Konfiguration in `package.json`

```json
{
  "cds": {
    "requires": {
      "auth": "ias",
      "[development]": {
        "auth": {
          "kind": "mocked",
          "users": {
            "max.mustermann@test.de": {
              "password": "max",
              "roles": ["TimeTrackingUser", "TimeTrackingAdmin"],
              "policies": ["cap.TimeTrackingUser", "cap.TimeTrackingAdmin"]
            },
            "erika.musterfrau@test.de": {
              "password": "erika",
              "roles": ["TimeTrackingUser"],
              "policies": ["cap.TimeTrackingUser"]
            },
            "frank.genehmiger@test.de": {
              "password": "frank",
              "roles": ["TimeTrackingUser", "TimeTrackingApprover"],
              "policies": ["cap.TimeTrackingUser", "cap.TimeTrackingApprover"]
            }
          }
        }
      }
    }
  }
}
```

### Test-User Details

Wir definieren 3 Test-User mit deutschen Namen und den produktiven Rollenbezeichnungen, damit wir lokal das spätere Autorisierungskonzept simulieren:

#### User 1: Max Mustermann

- **User-ID**: `max.mustermann@test.de` (entspricht E-Mail im User-Profil)
- **Password**: `max` (einfach merkbar)
- **Rollen**: `TimeTrackingUser`, `TimeTrackingAdmin` (Admin-Fall für lokale Tests)
- **Profil**: Referenziert in `db/data/io.nimble-Users.csv` mit vollständigem Profil (Name, weeklyHoursDec, etc.)

#### User 2: Erika Musterfrau

- **User-ID**: `erika.musterfrau@test.de`
- **Password**: `erika`
- **Rolle**: `TimeTrackingUser`
- **Profil**: Referenziert in `db/data/io.nimble-Users.csv`

#### User 3: Frank Genehmiger

- **User-ID**: `frank.genehmiger@test.de`
- **Password**: `frank`
- **Rollen**: `TimeTrackingUser`, `TimeTrackingApprover`
- **Profil**: Referenziert in `db/data/io.nimble-Users.csv`

### Login-Flow

1. Entwickler startet App mit `npm run watch`.
2. Browser öffnet `http://localhost:4004/`.
3. CAP zeigt Standard-Login-Seite mit User-Auswahl.
4. Entwickler wählt User (z.B. "max.mustermann@test.de") und gibt Passwort ("max") ein.
5. Session wird erstellt, `req.user.id` gibt User-ID zurück.

### Integration mit UserService

`UserService.getCurrentUserID()` nutzt `req.user.id` aus CAP-Request-Context:

```typescript
export class UserService {
  static getCurrentUserID(req?: any): string {
    const userId = req?.user?.id || cds.context?.user?.id;
    if (!userId) {
      throw new Error('User nicht authentifiziert');
    }
    return userId;
  }
}
```

## Konsequenzen

### Positiv

- **Einfacher Entwicklungs-Workflow**: Entwickler starten App und loggen sich mit einem Klick ein, keine OAuth2-Konfiguration notwendig.
- **Multi-User-Testing**: Zwei Test-User ermöglichen Tests von User-spezifischen Features (z.B. "Max erstellt Entry, Erika sieht ihn nicht").
- **Realistische User-IDs**: E-Mail-Format (`max.mustermann@test.de`) entspricht Production-User-IDs, was realistischere Test-Daten liefert.
- **Einfache Credentials**: Passwörter wie "max" und "erika" sind leicht merkbar und kommunizierbar im Team.
- **CAP-native Integration**: Keine zusätzlichen Libraries oder Mock-Server notwendig, nutzt CAP-Standard-Features.
- **Production-Ready**: Wechsel zu echter Authentication (z.B. XSUAA) erfordert nur Änderung von `auth.kind` in `package.json`, keine Code-Änderungen in Business-Logik.
- **Rollen-Unterstützung**: Ermöglicht zukünftige Erweiterungen mit Rollen-basierter Authorization (z.B. `admin`, `team-lead`).

### Negativ

- **Nicht Production-geeignet**: Mocked Authentication ist nur für Entwicklung/Testing, nicht für Production.
- **Begrenzte User-Anzahl**: Nur 2 Test-User definiert, mehr User erfordern manuelle Anpassung in `package.json`.
- **Einfache Passwörter**: Passwörter wie "max" sind unsicher, aber akzeptabel für lokale Entwicklung.
- **Keine Passwort-Rotation**: Passwörter sind statisch in `package.json`, keine Rotation/Ablauf-Mechanismen.

### Trade-offs

Wir akzeptieren die begrenzten User und einfachen Passwörter zugunsten von Entwicklungsgeschwindigkeit und Einfachheit. Für Production-Deployment wird `auth.kind` auf `xsuaa` oder `jwt` umgestellt, wodurch echte User-Verwaltung aktiv wird.

## Beispiel-Code

### Login-Seite (automatisch von CAP generiert)

CAP zeigt automatisch eine Login-Seite unter `/login` mit User-Auswahl:

```
┌─────────────────────────────────┐
│  Login                          │
│                                 │
│  Username: [max.mustermann...] │
│  Password: [•••]                │
│                                 │
│  [Login]                        │
└─────────────────────────────────┘
```

### UserService Integration

```typescript
// srv/track-service/handler/services/UserService.ts
export class UserService {
  /**
   * Ermittelt die ID des aktuell angemeldeten Users
   * @param req - Request-Objekt (optional, falls nicht in cds.context verfügbar)
   * @returns User-ID (z.B. 'max.mustermann@test.de')
   */
  static getCurrentUserID(req?: any): string {
    // Versuche User-ID aus Request oder CDS-Context zu ermitteln
    const userId = req?.user?.id || cds.context?.user?.id;

    if (!userId) {
      logger.error('User nicht authentifiziert', null, { context: 'UserService.getCurrentUserID' });
      throw new Error('User nicht authentifiziert');
    }

    logger.userOperation('GetCurrentUserID', `User ${userId} authenticated`, { userId });
    return userId;
  }
}
```

### Handler-Nutzung

```typescript
// srv/track-service/handler/handlers/TimeEntryHandlers.ts
class TimeEntryHandlers {
  async onCreate(req: Request) {
    // User-ID wird automatisch aus Authentication-Context ermittelt
    const userId = UserService.getCurrentUserID(req);

    // Setze User-ID automatisch auf aktuellen User
    req.data.user_ID = userId;

    const result = await this.createCommand.execute(req.transaction, req.data);
    return result;
  }
}
```

## Production-Migration

### Schritt 1: Authentication-Kind ändern

```json
// package.json (Production)
{
  "cds": {
    "requires": {
      "auth": {
        "kind": "xsuaa" // <- Geändert von "mocked"
        // XSUAA-spezifische Config hier
      }
    }
  }
}
```

### Schritt 2: Keine Code-Änderungen notwendig

`UserService.getCurrentUserID()` und alle Commands/Handlers funktionieren unverändert, da sie nur `req.user.id` nutzen, das von CAP bei allen Authentication-Arten bereitgestellt wird.

### Schritt 3: User-Profile migrieren

Test-User-Daten aus `db/data/io.nimble-Users.csv` müssen durch echte User-Profile ersetzt werden, die aus XSUAA oder Identity Provider kommen.

## Verweise

- `package.json` - Mocked Authentication Konfiguration unter `cds.requires.auth`
- `srv/track-service/handler/services/UserService.ts` - `getCurrentUserID()` Implementierung
- `db/data/io.nimble-Users.csv` - User-Profile für Test-User
- `.github/copilot-instructions.md` - Mock-User Details im AI-Development-Guide

## Hinweise für Entwickler

- **Login-Credentials**: `max.mustermann@test.de` / `max` und `erika.musterfrau@test.de` / `erika`
- **User hinzufügen**: Neuen User in `package.json` unter `cds.requires.auth.users` hinzufügen, User-Profil in `db/data/io.nimble-Users.csv` anlegen.
- **Logout**: Browser-Session löschen oder `/logout` aufrufen.
- **Production-Deployment**: `auth.kind` auf `xsuaa` oder `jwt` ändern, keine Code-Änderungen notwendig.
- **Rollen testen**: Neue Rollen in `package.json` definieren (z.B. `"roles": ["TimeTrackingUser", "TimeTrackingAdmin"]`) und via `req.user.is('TimeTrackingAdmin')` prüfen.
