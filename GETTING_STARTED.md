# 🚀 Getting Started - CAP Fiori Time Tracking

Willkommen! Diese Anleitung hilft dir, die Time Tracking App in weniger als **5 Minuten** auf deinem Rechner zum Laufen zu bringen.

---

## 📋 Prerequisites

Stelle sicher, dass folgende Software installiert ist:

### Erforderlich

| Tool           | Version   | Download                            | Zweck                 |
| -------------- | --------- | ----------------------------------- | --------------------- |
| **Node.js**    | ≥20.x LTS | [nodejs.org](https://nodejs.org/)   | Runtime für CAP & UI5 |
| **npm**        | ≥10.x     | (kommt mit Node.js)                 | Package Manager       |
| **TypeScript** | ≥5.0      | `npm install -g typescript`         | Compiler              |
| **Git**        | Latest    | [git-scm.com](https://git-scm.com/) | Version Control       |

### Empfohlen

| Tool                         | Version | Download                                                | Zweck                   |
| ---------------------------- | ------- | ------------------------------------------------------- | ----------------------- |
| **VS Code**                  | Latest  | [code.visualstudio.com](https://code.visualstudio.com/) | IDE                     |
| **SAP CDS Language Support** | Latest  | VS Code Extension                                       | CDS Syntax Highlighting |
| **ESLint**                   | Latest  | VS Code Extension                                       | Linting                 |
| **Prettier**                 | Latest  | VS Code Extension                                       | Code Formatting         |

### Prüfen der Installation

```bash
node --version    # sollte v20.x.x oder höher sein
npm --version     # sollte 10.x.x oder höher sein
tsc --version     # sollte Version 5.x.x oder höher sein
git --version     # sollte installiert sein
```

---

## 📦 Installation

### 1. Repository klonen

```bash
git clone https://github.com/nimble-123/cap-fiori-timetracking.git
cd cap-fiori-timetracking
```

### 2. Dependencies installieren

```bash
npm install
```

Dies installiert:

- **CAP Framework** (`@sap/cds`)
- **TypeScript** Tooling (`typescript`, `@cap-js/cds-typer`)
- **UI5 Tooling** (`@sap/ux-ui5-tooling`, `cds-plugin-ui5`)
- **Dev Tools** (`prettier`, `eslint`, `@sap/dev-cap-tools`)
- Alle Frontend-App-Dependencies (via Workspaces)

**Hinweis:** Das Projekt nutzt npm Workspaces – `app/timetable` und `app/timetracking` werden automatisch verlinkt.

### 3. TypeScript-Typen generieren

```bash
npm run generate-entry-point
```

Dies erzeugt:

- `@cds-models/` Verzeichnis mit TypeScript-Typen
- Entry Points für alle CDS-Entities
- Import-Aliases (`#cds-models/TrackService`)

---

## 🏃 Development Server starten

### Variante 1: Watch Mode (empfohlen für Development)

```bash
npm run watch
```

Dieser Befehl:

- Startet CAP Server mit **Auto-Reload**
- Nutzt `cds-tsx` (TypeScript ohne Kompilierung)
- Überwacht Änderungen in `srv/`, `db/`, `app/`
- Öffnet automatisch Browser auf `http://localhost:4004`

**Server Output:**

```
[cds] - loaded model from 3 file(s):
  db/data-model.cds
  srv/track-service/track-service.cds
  app/services.cds

[cds] - connect to db > sqlite { database: ':memory:' }
[cds] - serving TrackService { path: '/odata/v4/track' }

[cds] - server listening on { url: 'http://localhost:4004' }
[cds] - launched at 16/10/2025, 10:23:45, version: 9.x.x, in: 1.234s
```

### Variante 2: Build & Serve (für Production-Check)

```bash
npm run build
npm start
```

---

## 🧪 Test-User verwenden

Die App nutzt **Mocked Authentication** für lokale Entwicklung. Zwei Test-User sind vorkonfiguriert:

### User 1: Max Mustermann

- **E-Mail:** `max.mustermann@test.de`
- **Passwort:** `max`
- **Rolle:** `authenticated-user`

### User 2: Erika Musterfrau

- **E-Mail:** `erika.musterfrau@test.de`
- **Passwort:** `erika`
- **Rolle:** `authenticated-user`

**Login-Flow:**

1. Öffne `http://localhost:4004/`
2. Wähle eine der beiden Apps:
   - `timetable/` - Fiori Elements List Report
   - `timetracking/` - Custom UI5 Dashboard
3. Logge dich mit einem der Test-User ein

**Alternative:** Direkter OData-Zugriff ohne UI:

```bash
# GET Requests (im Browser oder mit curl)
http://localhost:4004/odata/v4/track/TimeEntries
http://localhost:4004/odata/v4/track/Users
http://localhost:4004/odata/v4/track/Projects
```

---

## 📂 Projekt-Struktur (Kurzübersicht)

```
cap-fiori-timetracking/
├── app/                      # 📱 UI5 Frontend Apps
│   ├── timetable/            # Fiori Elements (Annotations-basiert)
│   └── timetracking/         # Custom UI5 (TypeScript)
├── db/                       # 💾 Data Model & CSV Test Data
│   ├── data-model.cds
│   └── data/*.csv
├── srv/                      # ⚙️ CAP Backend (100% TypeScript!)
│   └── track-service/
│       ├── track-service.ts  # Service Orchestrator
│       ├── handler/          # Commands, Validators, Services
│       └── annotations/      # UI Annotations
├── docs/                     # 📚 Dokumentation
│   ├── ARCHITECTURE.md       # arc42 Architektur-Dokumentation
│   └── ADR/                  # Architecture Decision Records
├── @cds-models/              # 🔧 Generierte TypeScript-Typen
├── test/                     # 🧪 Tests (Jest + REST Client)
└── package.json              # npm Scripts & Dependencies
```

---

## 🛠️ Wichtige npm Scripts

| Befehl                         | Zweck                      | Wann verwenden?                 |
| ------------------------------ | -------------------------- | ------------------------------- |
| `npm run watch`                | Dev-Server mit Auto-Reload | **Hauptbefehl für Development** |
| `npm run build`                | TypeScript kompilieren     | Vor Commit (prüft Syntax)       |
| `npm run format`               | Prettier Formatierung      | **Vor jedem Commit (Pflicht!)** |
| `npm run generate-entry-point` | CDS-Typen generieren       | Nach CDS-Model-Änderungen       |
| `npm test`                     | Jest Tests ausführen       | Nach Code-Änderungen            |
| `npm start`                    | Production-like Serve      | Finaler Check vor Deployment    |

### Typischer Development-Workflow

```bash
# 1. Server starten
npm run watch

# 2. In anderem Terminal: Code ändern
# ... editiere Dateien in srv/, db/, app/ ...

# 3. Vor Commit: Code formatieren
npm run format

# 4. TypeScript-Check
npm run build

# 5. Optional: Tests
npm test

# 6. Commit & Push
git add .
git commit -m "feat: neue Feature XYZ"
git push
```

---

## 🎯 Erste Schritte nach Installation

### 1. Backend erkunden (CAP Service)

**Service Endpoints:**

- **Index Page:** http://localhost:4004
- **OData Service:** http://localhost:4004/odata/v4/track
- **Service Metadata:** http://localhost:4004/odata/v4/track/$metadata
- **Fiori Preview:** http://localhost:4004/fiori.html

**Tipp:** Öffne `test/track-service.http` in VS Code (benötigt REST Client Extension) für vorgefertigte HTTP-Requests.

### 2. Frontend Apps testen

**Fiori Elements Timetable:**

```
http://localhost:4004/timetable/webapp/index.html
```

Features: List Report, Object Page, Drafts, F4 Value Helps

**Custom UI5 Dashboard:**

```
http://localhost:4004/timetracking/webapp/index.html
```

Features: Dashboard, SinglePlanningCalendar, Charts

### 3. Datenbank inspizieren

**SQLite In-Memory DB:**

Die App nutzt per Default eine **In-Memory-Datenbank**. Daten gehen beim Server-Neustart verloren. Test-Daten werden aus `db/data/*.csv` automatisch geladen.

**Persistente DB (optional):**

```json
// package.json → cds.requires.db
"db": {
  "kind": "sqlite",
  "credentials": {
    "database": "db.sqlite"
  }
}
```

Dann:

```bash
cds deploy --to sqlite:db.sqlite
npm run watch
```

### 4. Code-Änderungen testen

**Beispiel: Neue Validierung hinzufügen**

1. Öffne `srv/track-service/handler/validators/TimeEntryValidator.ts`
2. Füge neue Regel hinzu
3. Server lädt automatisch neu (Watch Mode!)
4. Teste mit `test/track-service.http`

---

## 🐛 Troubleshooting

### Problem: `Cannot find module '#cds-models/TrackService'`

**Lösung:**

```bash
npm run generate-entry-point
```

Die TypeScript-Typen müssen nach jedem CDS-Model-Update regeneriert werden.

---

### Problem: Port 4004 bereits belegt

**Lösung 1: Anderen Port verwenden**

```bash
PORT=4005 npm run watch
```

**Lösung 2: Bestehenden Prozess killen**

```bash
# Windows
netstat -ano | findstr :4004
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4004 | xargs kill -9
```

---

### Problem: TypeScript-Fehler im Editor

**Symptome:**

- Rote Wellenlinien in `.ts`-Dateien
- "Cannot find module" Errors

**Lösung:**

1. VS Code neustarten: `Ctrl+Shift+P` → "Reload Window"
2. TypeScript-Server neustarten: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. Dependencies neu installieren:

```bash
rm -rf node_modules package-lock.json
npm install
```

---

### Problem: UI5 Apps laden nicht

**Symptome:**

- Blank page oder 404 bei `/timetable/` oder `/timetracking/`

**Lösung:**

```bash
# UI5 Workspaces neu installieren
npm install --workspaces

# Server neu starten
npm run watch
```

---

### Problem: CDS-Fehler "Cannot load model"

**Symptome:**

```
[cds] - failed to load model from db/data-model.cds
Syntax error: Unexpected token...
```

**Lösung:**

1. Prüfe CDS-Syntax in `db/data-model.cds` oder `srv/track-service/track-service.cds`
2. Nutze CDS Language Support Extension für Syntax-Highlighting
3. Teste mit:

```bash
cds compile db/data-model.cds
```

---

### Problem: Prettier formatiert nicht

**Lösung:**

```bash
# Prettier global installieren
npm install -g prettier

# Manuell formatieren
npm run format

# VS Code: Format on Save aktivieren
# settings.json:
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

### Problem: Login-Loop / 401 Unauthorized

**Symptome:**

- Endlos-Redirect zu Login-Seite
- "401 Unauthorized" bei OData-Requests

**Lösung:**

Prüfe `package.json` → `cds.requires.auth`:

```json
"auth": {
  "kind": "mocked",  // MUSS "mocked" sein für lokale Dev
  "users": { ... }
}
```

Wenn `"kind": "xsuaa"` oder `"jwt"` → auf `"mocked"` ändern und Server neu starten.

---

## 📚 Weiterführende Ressourcen

### Interne Dokumentation

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Vollständige arc42-Architekturdokumentation
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Guidelines für Contributors
- **[ADR-Verzeichnis](docs/ADR/)** - Alle Architekturentscheidungen (11 ADRs)
- **[README.md](README.md)** - Executive Summary & Features

### Externe Links

- **[SAP CAP Documentation](https://cap.cloud.sap)** - Offizielles CAP Framework
- **[SAPUI5 SDK](https://ui5.sap.com)** - UI5 API Reference
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript Docs
- **[Feiertage-API](https://feiertage-api.de)** - Genutzte Holiday API

### Video Tutorials (extern)

- [SAP CAP in 100 Seconds](https://www.youtube.com/results?search_query=sap+cap+tutorial)
- [SAPUI5 Crash Course](https://www.youtube.com/results?search_query=sapui5+tutorial)

---

## ✅ Quick Checklist - Ist alles bereit?

Prüfe diese Punkte, bevor du mit Development startest:

- [ ] Node.js ≥20.x installiert (`node --version`)
- [ ] npm ≥10.x installiert (`npm --version`)
- [ ] Repository geklont
- [ ] `npm install` erfolgreich durchgelaufen
- [ ] `npm run generate-entry-point` ausgeführt
- [ ] `npm run watch` läuft ohne Fehler
- [ ] Browser öffnet `http://localhost:4004`
- [ ] Login mit Test-User funktioniert
- [ ] Fiori Apps erreichbar (`/timetable/`, `/timetracking/`)
- [ ] VS Code Extensions installiert (CDS, ESLint, Prettier)

**Alles ✅? Perfekt! Du bist bereit zu starten!** 🚀

---

## 🆘 Hilfe benötigt?

Wenn du hier nicht weitergekommen bist:

1. **Prüfe Known Issues:** [docs/ARCHITECTURE.md → Kapitel 11](docs/ARCHITECTURE.md#11-risiken-und-technische-schulden)
2. **Erstelle ein GitHub Issue:** [GitHub Issues](https://github.com/nimble-123/cap-fiori-timetracking/issues)
3. **SAP Community:** [SAP Community - CAP Forum](https://community.sap.com)

---

**Happy Coding! 🎉**

_Nächster Schritt: Lies die [Architektur-Dokumentation](docs/ARCHITECTURE.md) für Deep-Dive._
