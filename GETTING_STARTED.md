# 🚀 Getting Started - CAP Fiori Time Tracking

Willkommen! Diese Anleitung hilft dir, die Time Tracking App in weniger als **5 Minuten** auf deinem Rechner zum Laufen zu bringen.

---

## 📋 Prerequisites

Stelle sicher, dass folgende Software installiert ist:

### Erforderlich

| Tool           | Version                                 | Download                            | Zweck                    |
| -------------- | --------------------------------------- | ----------------------------------- | ------------------------ |
| **Node.js**    | ≥22.x (laut `.nvmrc` 22.20.0)           | [nodejs.org](https://nodejs.org/)   | Runtime für CAP & UI5    |
| **npm**        | ≥10.x                                   | (kommt mit Node.js)                 | Package Manager          |
| **Java (JDK)** | ≥17 (Temurin empfohlen)                 | [Adoptium](https://adoptium.net/)   | Build von `@sap/ams-dev` |
| **TypeScript** | ≥5.0                                    | `npm install -g typescript`         | Compiler                 |
| **Git**        | Latest                                  | [git-scm.com](https://git-scm.com/) | Version Control          |

> Tipp: Falls du `nvm` verwendest, kannst du mit `nvm use` automatisch die in `.nvmrc` definierte Node-Version (22.20.0) aktivieren. Bei Bedarf installiert `nvm install` die Version einmalig. Für das Java-Requirement empfiehlt sich Temurin 17 (Adoptium); die GitHub Actions richten dieselbe Version via `actions/setup-java` ein.

#### Zusatz-Tools für SAP BTP Deployments

| Tool                         | Version | Installationsschritt                                                              | Zweck                              |
| ---------------------------- | ------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| **Cloud Foundry CLI (`cf`)** | ≥8.8    | [docs.cloudfoundry.org](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html) | Deployments, Service-Management    |
| **CF MultiApps Plugin**      | Latest  | `cf install-plugin multiapps`                                                     | `cf deploy` für MTA-Unterstützung  |
| **MBT (`mbt`)**              | Latest  | `npm install -g mbt`                                                              | Baut `.mtar` für Multi-Target Apps |

### Empfohlen

| Tool                         | Version | Download                                                | Zweck                   |
| ---------------------------- | ------- | ------------------------------------------------------- | ----------------------- |
| **VS Code**                  | Latest  | [code.visualstudio.com](https://code.visualstudio.com/) | IDE                     |
| **SAP CDS Language Support** | Latest  | VS Code Extension                                       | CDS Syntax Highlighting |
| **ESLint**                   | Latest  | VS Code Extension                                       | Linting                 |
| **Prettier**                 | Latest  | VS Code Extension                                       | Code Formatting         |

### Prüfen der Installation

```bash
node --version    # sollte v22.x.x sein
npm --version     # sollte 10.x.x oder höher sein
tsc --version     # sollte Version 5.x.x oder höher sein
git --version     # sollte installiert sein
cf --version      # sollte installiert sein
mbt --version     # sollte installiert sein
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

> Dank `.npmrc` schlägt die Installation fehl, wenn deine Node-Version nicht zu den definierten Engines passt (`engine-strict=true`) – so bleiben alle Umgebungen konsistent. `npm audit` ist dabei standardmäßig aktiv.

### 3. Environment konfigurieren

Kopiere das Beispiel und passe Werte bei Bedarf an (für lokale Entwicklung reichen die Default-Werte):

```bash
cp .env.example .env
```

**Wichtige Variablen:**

- `NODE_ENV`, `CDS_LOG_LEVELS_TRACK_SERVICE`, `CDS_LOG_FORMAT` – steuern Logging und Laufzeitverhalten.
- `HOLIDAY_API_BASE_URL`, `HOLIDAY_API_TIMEOUT_MS` – Konfiguration für die Feiertags-API.
- `CAP_AUTH_STRATEGY` – legt die lokale Authentifizierungsstrategie fest (Standard: `mocked`).

Alle Variablen sind optional. Nicht gesetzte Werte fallen auf die Defaults aus `Customizing` bzw. den Services zurück.

### 4. TypeScript-Typen & Entry Points

- **Typen:** `@cap-js/cds-typer` läuft automatisch (über `npm run watch`, `npm run build` oder `cds-typer --watch`) und aktualisiert `@cds-models/*` bei jeder `.cds`-Änderung – kein manueller Befehl erforderlich.
- **Optionale Entry Points:** Falls du `dev-cap-tools` Skripte nutzt (z. B. für CLI-Aufrufe), kannst du optional `npm run generate-entry-point` ausführen, um aktualisierte Entry Points zu erzeugen. Das beeinflusst die generierten Typen nicht.

---

## 🧭 Repository-Guidelines & Meta-Dateien

Damit alle Contributors dieselben Standards nutzen, bringt das Projekt mehrere Meta-Dateien mit:

- `.nvmrc` – definiert Node.js 22.20.0. `nvm use` stellt sicher, dass du exakt diese Version nutzt.
- `.npmrc` – erzwingt kompatible Node-Versionen (`engine-strict=true`) und aktiviert Sicherheitsprüfungen (`audit=true`).
- `.editorconfig` – legt Formatierungsregeln fest (2 Spaces, LF, keine trailing spaces), passend zu Prettier.
- `.env.example` – Beispielkonfiguration für lokale Umgebungsvariablen. Kopiere sie wie oben beschrieben nach `.env`.
- `@cap-js/console` – aktiviert das CAP-Console-Plugin für Monitoring & Log-Level-Switches innerhalb der [SAP CAP Console](https://cap.cloud.sap/docs/tools/console) (Desktop-App).
- `CODE_OF_CONDUCT.md` & `SECURITY.md` – beschreiben Verhaltensregeln sowie den Ablauf für Sicherheitsmeldungen.
- `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/dependabot.yml`, `.github/CODEOWNERS` – sorgen für saubere Issues/PRs, automatische Dependency-Updates und klar zugewiesene Reviews.
- `release-please-config.json` & `.release-please-manifest.json` – steuern die automatisierte Release-PR-Erstellung; vor produktiven Läufen empfiehlt sich ein lokaler Dry-Run (`npx release-please release-pr --config-file release-please-config.json --manifest-file .release-please-manifest.json --dry-run`, Details in der README). Die Versionsnummern der UI5-Apps werden dabei über `extra-files` mitgezogen.

Bitte beachte diese Richtlinien, bevor du einen PR erstellst.

---

## 🤖 AI Prompts & LLM Workflows

Das Repository enthält kuratierte Prompts für GitHub Models & CoPilot (`.github/prompts/*.prompt.yml`), um Product Owner, Entwickler:innen und QA bei CAP-spezifischen Aufgaben zu unterstützen.

### Nutzung

1. **Prompt auswählen:** Inhalte der YAML-Dateien lesen (z. B. `product-owner-feature-brief.prompt.yml`) und an dein Vorhaben anpassen (`{{...}}` Placeholder ersetzen).
2. **LLM starten:** Prompt in GitHub Models UI, GitHub CLI (`gh models`), oder kompatible IDE-Integrationen laden.
3. **Kontext teilen:** Relevante Artefakte/Änderungen als Input beschreiben (Summary, Diff, Incident etc.).
4. **Ergebnisse prüfen:** Output durchgehen, offene Punkte klären und Entscheidungen dokumentieren (README, ARCHITECTURE, ADRs).

### Typische Workflows

- **Discovery (Product Owner):** `product-owner-feature-brief` für Anforderungs-Gathering → `product-owner-story-outline` für Story-Bundle.
- **Code Review:** `review-coach` für Findings, Test-Impact und Doku-Hinweise.
- **Architecture Enablement:** `architecture-deep-dive` erklärt Module/Flows; `adr-drafting-assistant` unterstützt neue Entscheidungen.
- **Support & Releases:** `bug-triage-investigator` strukturiert Fehlermeldungen, `release-notes-curator` erstellt Stakeholder-Updates.
- **Qualitätssicherung:** `test-strategy-designer` definiert Testpakete (Unit, CAP-Integration, UI5 E2E, Performance).

### MCP-Server & Wissensquellen

- `.vscode/mcp.json` konfiguriert drei Server, die in kompatiblen IDEs sofort nutzbar sind:
  - `cds-mcp` → SAP CAP Referenzen & Best Practices.
  - `@sap-ux/fiori-mcp-server` → Fiori Elements Patterns, UX Guidelines und Annotation-Hilfen.
  - `@ui5/mcp-server` → UI5 Control API, MVC, Routing.
- **Installation:** Für `cds-mcp` muss die CLI einmal global installiert werden, z. B. `npm install -g @cap-js/mcp-server`. Prüfe die Installation mit `cds-mcp --help`. Die beiden anderen Server werden bei Bedarf über `npx …` gestartet.
- In Kombination mit den Prompts können MCP-Server als „Knowledge Provider“ dienen, um technische Details während der Anforderungs- oder Review-Phase abzufragen.

> Tipp: Ergänze bei Bedarf projektspezifische Details (z. B. betroffene Entities, Handler, Commands), damit das LLM zielgerichtet antwortet.

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

### Swagger UI & OpenAPI (nur Entwicklung)

Beim Start über `npm run watch` oder `cds watch` registriert das Plugin `cds-swagger-ui-express` automatisch eine Swagger UI für den TrackService:

- **Swagger UI:** `http://localhost:4004/$api-docs/odata/v4/track/`
- **OpenAPI JSON:** `http://localhost:4004/$api-docs/odata/v4/track/openapi.json`

Die Oberfläche ist ausschließlich für lokale Entwicklung gedacht und wird nicht im produktiven Build ausgeliefert.

---

## 🧪 Test-User verwenden

Die App nutzt **Mocked Authentication** für lokale Entwicklung. Drei Test-User mit den produktiven Rollennamen sind vorkonfiguriert:

### User 1: Max Mustermann

- **E-Mail:** `max.mustermann@test.de`
- **Passwort:** `max`
- **Rollen:** `TimeTrackingUser`, `TimeTrackingAdmin`

### User 2: Erika Musterfrau

- **E-Mail:** `erika.musterfrau@test.de`
- **Passwort:** `erika`
- **Rolle:** `TimeTrackingUser`

### User 3: Frank Genehmiger

- **E-Mail:** `frank.genehmiger@test.de`
- **Passwort:** `frank`
- **Rollen:** `TimeTrackingUser`, `TimeTrackingApprover`

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
├── .github/                  # 🤖 Templates, Dependabot, CODEOWNERS
├── @cds-models/              # 🔧 Generierte TypeScript-Typen
├── test/                     # 🧪 Tests (Jest + REST Client)
├── .env.example              # ⚙️ Beispiel-Umgebungsvariablen
├── .editorconfig             # 🧹 Formatierungsregeln (2 Spaces, LF)
├── .nvmrc                    # 🟦 Node-Version 22.20.0
├── .npmrc                    # 📦 npm Richtlinien (engine-strict, audit)
├── CODE_OF_CONDUCT.md        # 🤝 Community Guidelines
├── SECURITY.md               # 🔐 Responsible Disclosure
└── package.json              # npm Scripts & Dependencies
```

---

## 🛠️ Wichtige npm Scripts

| Befehl                         | Zweck                                | Wann verwenden?                 |
| ------------------------------ | ------------------------------------ | ------------------------------- |
| `npm run watch`                | Dev-Server mit Auto-Reload           | **Hauptbefehl für Development** |
| `npm run build`                | TypeScript kompilieren               | Vor Commit (prüft Syntax)       |
| `npm run format`               | Prettier Formatierung                | **Vor jedem Commit (Pflicht!)** |
| `npm run generate-entry-point` | Service Entry Points (dev-cap-tools) | Optional bei neuen Services     |
| `npm test`                     | Jest Tests ausführen                 | Nach Code-Änderungen            |
| `npm start`                    | Production-like Serve                | Finaler Check vor Deployment    |

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
http://localhost:4004/io.nimble.timetable/index.html
```

Features: List Report, Object Page, Drafts, F4 Value Helps

**Manage Activity Types (Fiori Elements Basic V4):**

```
http://localhost:4004/io.nimble.manageactivitytypes/index.html
```

Features: Stammdatenpflege der Activity Types, Tabellenfilter, Inline-Edit; alternativ über Launchpad-Vorschau `http://localhost:4004/fiori.html` erreichbar.

**Custom UI5 Dashboard:**

```
http://localhost:4004/io.nimble.timetracking/index.html
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

### 5. SAP CAP Console einrichten

Die [SAP CAP Console](https://cap.cloud.sap/docs/tools/console) ist eine native Desktop-App (Windows/macOS), inspiriert vom CAP Developer Dashboard & OpenLens, die lokale Entwicklung, BTP-Deployments und Monitoring in einer Oberfläche bündelt.

1. **Download & Installation**
   Lade die Anwendung über [SAP Tools](https://tools.hana.ondemand.com/#cloud-capconsole) herunter und installiere sie. Vor dem Start unseres Projekts optional `npm run watch`, damit die Konsole das lokale CAP-Backend erkennt.

2. **Projekt hinzufügen**
   Beim Start scannt die Konsole laufende CAP-Prozesse (Java/JS). Unser Projekt erscheint automatisch in der Liste; über das Menü (`…`) kannst du „Remember Project“ wählen, um es dauerhaft anzuzeigen. Alternativ `Add Project` → Root-Ordner wählen.

3. **Monitoring & Struktur**
   Die App visualisiert die `mta.yaml`, zeigt pro Modul Status, CPU/RAM und Live-Logs. Durch das im Projekt installierte Plugin `@cap-js/console` lassen sich Log-Level ohne Neustart anpassen. Ohne laufenden Service fallen die Live-Metriken weg, aber Metadaten bleiben sichtbar.

4. **Environments & Deployment**
   Environment-Konfigurationen liegen als `.cds/*.yaml` in deinem Projekt (siehe Beispiel `.cds/trial.yaml.example`). Wechsel per Top-Bar zwischen `local`, `dev`, `prod`. Für Cloud Foundry Deployments führt ein Wizard durch Authentifizierung, Entitlement-Check und Service-Anlage – wahlweise komplett „In-App“ (mit gebundleten CLIs) oder als Befehlssammlung für dein Terminal.

5. **Security & SSH**
   Für Plugin-Features in BTP erzeugt die Konsole bei Bedarf einen SSH-Tunnel zum Applikations-Container. Stelle sicher, dass du und dein Team die Implikationen kennen (siehe „Security“-Kapitel in der Produktdoku) und SSH nur so lange aktiviert ist wie nötig.

> Hinweis: Derzeit unterstützt die CAP Console keine µ-Services, kein MTX und keine Kyma-Deployments. Fokus liegt auf CAP-Projekten Richtung SAP BTP Cloud Foundry.

---

## ☁️ Attachments auf SAP BTP konfigurieren (optional)

Standardmäßig speichert das Attachments Plugin (`@cap-js/attachments`) Binärdaten in der angebundenen Datenbank. Für produktive Szenarien mit größeren Dateien oder Compliance-Anforderungen kannst du zusätzliche SAP BTP Services anbinden:

1. **SAP Object Store** – lagert die Dateien in ein S3-kompatibles Storage aus.
2. **SAP Malware Scanning Service** – prüft Uploads automatisiert auf Viren/Malware.

**Beispielhafte Schritte (Cloud Foundry):**

```bash
# Object Store für Attachments
cf create-service objectstore standard cap-fiori-timetracking-attachments

# Malware Scanner für Uploads
cf create-service malwarescanning standard cap-fiori-timetracking-malware-scanner

# Application Logging Service für zentrale Logs
cf create-service application-logs standard cap-fiori-timetracking-logging

# Service-Bindings übernimmt die mta.yaml beim cf deploy

# Connectivity + Destination für Holiday API
cf create-service connectivity lite cap-fiori-timetracking-connectivity
cf create-service destination lite cap-fiori-timetracking-destination
```

> Konkrete Konfigurationsdetails (Binding-Names, Destinations, Environment Variables) findest du in der offiziellen Plugin-Dokumentation: [SAP Object Store](https://github.com/cap-js/attachments#using-sap-object-store) und [Malware Scanning Service](https://github.com/cap-js/attachments#using-sap-malware-scanning-service).

---

## ☁️ Deploy auf SAP BTP (Cloud Foundry)

1. **Voraussetzungen:** Installiere das Cloud Foundry CLI mit MultiApps Plugin (`cf install-plugin multiapps`) sowie das Cloud MTA Build Tool (`npm install -g mbt` oder via Binary).
2. **Services vorbereiten:** Lege einmalig pro Subaccount die Services aus dem Abschnitt oben an (`hana`, `objectstore`, `malwarescanning`, `application-logs`, `connectivity`, `destination`) **plus** `identity` (IAS) und `identity-authorization` (AMS). Benenne sie gemäß `mta.yaml` (`cap-fiori-timetracking-ias`, `cap-fiori-timetracking-ams`).
3. **IAS konfigurieren:** Erzeuge ein Service-Key für `cap-fiori-timetracking-ias`, aktiviere `xsuaa-cross-consumption` und lege Role-Collections an, die die Templates aus `xs-security.json` referenzieren.
4. **AMS vorbereiten:** Vergib die Rolle `Identity_Provisioner` für dein technisches Deployment-User und stelle sicher, dass die AMS-API erreichbar ist (Service-Key für `cap-fiori-timetracking-ams`). Policies werden später vom Deployer-Modul hochgeladen.
5. _(Optional)_ **Aufräumen:** `npm run clean` entfernt vorhandene Build-Artefakte (`gen/`, `mta_archives/`, UI5-`dist/`) vor einem frischen Build.
6. **Build ausführen:** `npm run build:mta` (setzt voraus, dass vorher `npm ci` aufgerufen wurde). Das erzeugte MTAR findest du anschließend unter `gen/mta.tar`.
7. **Deploy:** `npm run deploy:cf`
8. **Bindings prüfen:** `cf services` sollte zeigen, dass `cap-fiori-timetracking-srv` an DB, Attachments, Malware-Scanner, Connectivity, Destination, Application Logging **sowie** IAS & AMS gebunden ist. Zusätzlich erscheint das Task-Modul `cap-fiori-timetracking-ams-policies-deployer`, das die DCL-Dateien (`ams/dcl`) automatisiert ausrollt.

> Tipp: `npm run build:mta` erzeugt standardmäßig einen Produktions-Build. Für schnelle Iterationen kannst du bei Bedarf `npx mbt build -p cf --dev -t gen --mtar mta.tar` ausführen, um Optimierungen zu überspringen.

Durch die Kombination aus `mta.yaml`, klar getrennten Build-/Run-Phasen und externen Service-Bindings erfüllt die Lösung zentrale [12-Factor-Prinzipien](https://12factor.net/) und lässt sich als cloud-native Applikation klassifizieren.

---

## 🐛 Troubleshooting

### Problem: `Cannot find module '#cds-models/TrackService'`

**Lösung:**

> TypeScript-Typen werden durch `@cap-js/cds-typer` beim Speichern/Build automatisch erzeugt. `npm run generate-entry-point` ist nur erforderlich, wenn Tooling (z. B. dev-cap-tools) neue Entry Points benötigt.

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

- [ ] Node.js ≥22.x installiert (`node --version`)
- [ ] Java ≥17 installiert (`java -version`)
- [ ] npm ≥10.x installiert (`npm --version`)
- [ ] Repository geklont
- [ ] `npm install` erfolgreich durchgelaufen
- [ ] Optional: `npm run generate-entry-point` (falls dev-cap-tools Entry Points benötigt)
- [ ] `npm run watch` läuft ohne Fehler
- [ ] Browser öffnet `http://localhost:4004`
- [ ] Login mit Test-User funktioniert
- [ ] Fiori Apps erreichbar (`/io.nimble.timetable/`, `/io.nimble.timetracking/`, `/io.nimble.manageactivitytypes/`)
- [ ] VS Code Extensions installiert (CDS, ESLint, Prettier)

**Alles ✅? Perfekt! Du bist bereit zu starten!** 🚀

---

---

## 🔁 Inner Loop Checklist

| Schritt                           | Ziel                                 | Empfehlung / Command                                  |
| --------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| **1. Watch starten**              | CAP + UI5 Hot Reload, lokale Mocks   | `npm run watch` nutzt `cds watch` (Mock Auth, SQLite) |
| **2. Coding & Docs**              | Feature bauen, ADR prüfen            | Editor + `docs/ARCHITECTURE.md`/ADRs im Blick         |
| **3. Tests ausführen**            | Regression vermeiden                 | `npm test` oder `npm run test:watch`                  |
| **4. Lint & Format**              | Style & Quality sichern              | `npx eslint …`, `npx prettier --check …`              |
| **5. Manual Check / CAP Console** | UI/Service Smoke-Test, Monitoring    | REST Client (`tests/*.http`), Swagger UI, CAP Console |
| **6. Optional Entry Points**      | Dev-Tool Generierung (dev-cap-tools) | `npm run generate-entry-point` bei Bedarf             |
| **7. Commit & PR**                | Änderung teilen                      | Conventional Commit, PR Template nutzen               |

> Tipp: Halte die inner loop Schleife klein (<15 Minuten). Erst wenn Code & Tests lokal stabil sind, geht’s in den äußeren Loop (PR, Review, CI, Deployment).

---

## 🆘 Hilfe benötigt?

Wenn du hier nicht weitergekommen bist:

1. **Prüfe Known Issues:** [docs/ARCHITECTURE.md → Kapitel 11](docs/ARCHITECTURE.md#11-risiken-und-technische-schulden)
2. **Erstelle ein GitHub Issue:** [GitHub Issues](https://github.com/nimble-123/cap-fiori-timetracking/issues)
3. **SAP Community:** [SAP Community - CAP Forum](https://community.sap.com)

---

**Happy Coding! 🎉**

_Nächster Schritt: Lies die [Architektur-Dokumentation](docs/ARCHITECTURE.md) für Deep-Dive._
