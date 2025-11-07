# ADR 0021: Devcontainer und GitHub Codespaces Integration

## Status

**Akzeptiert** – Implementiert als vollständige Entwicklungsumgebung für Cloud-native Entwicklung

## Kontext und Problemstellung

Die CAP Fiori Time Tracking Anwendung hat komplexe Entwicklungsanforderungen:

- **Node.js 22.20.0** (spezifische Version aus `.nvmrc`)
- **Java 17** (Temurin) für `@sap/ams-dev` Builds
- **SAP-spezifische Tools** (`@sap/cds-dk`, `mbt`, Cloud Foundry CLI)
- **TypeScript-Tooling** mit Auto-Generierung von CDS-Typen
- **Multiple UI5-Apps** mit Workspace-Struktur

**Herausforderungen für neue Entwickler:**

1. ⏱️ **Time-to-First-Commit**: 30-60 Minuten Setup-Zeit für lokale Umgebung
2. 🔧 **Tool-Versionen**: Unterschiedliche Node/Java-Versionen auf Entwickler-Rechnern
3. 📦 **Dependency Hell**: Komplexe Installation von `cf` CLI, `mbt`, MultiApps Plugin
4. 🐛 **"Works on my machine"**: Inkonsistente Entwicklungsumgebungen
5. 🆕 **Onboarding**: Hohe Einstiegshürde für neue Contributors
6. 🌍 **Remote Work**: Keine Cloud-IDE-Option für Remote-Entwicklung

**Betroffene Stakeholder:**

- Neue Contributors (höchste Priorität)
- Externe Entwickler ohne SAP-Tooling-Erfahrung
- Teams mit heterogenen Entwicklungsumgebungen
- Remote-Teams ohne Zugriff auf leistungsstarke lokale Hardware

## Entscheidungsfaktoren

1. **Developer Experience (DX)**
   - Onboarding-Zeit: < 5 Minuten bis "Hello World"
   - Zero-Config: Keine manuellen Installationsschritte
   - Consistency: Identische Umgebung für alle Entwickler

2. **Tool-Vollständigkeit**
   - Alle SAP CAP Dependencies
   - Cloud Foundry CLI + MultiApps Plugin
   - VS Code Extensions für optimale IDE-Erfahrung

3. **Wartbarkeit**
   - Deklarative Konfiguration (Infrastructure as Code)
   - Versionskontrolle für Dev-Umgebung
   - Einfache Updates bei Dependency-Changes

4. **Performance**
   - Schnelle Container-Builds (< 5 Minuten)
   - Caching von Node-Modules
   - Port-Forwarding für lokales Testing

5. **Kosteneffizienz**
   - GitHub Codespaces: 60 Stunden/Monat gratis (2-core)
   - VS Code Dev Containers: Vollständig kostenlos (lokal)

6. **Security & Compliance**
   - Secrets-Management via GitHub Codespaces Secrets
   - Keine Credentials in Container-Images
   - Isolierte Entwicklungsumgebungen

## Betrachtete Optionen

### Option A – Ausführliche Dokumentation (Status Quo)

**Beschreibung**: Manuelle Installation aller Tools gemäß `GETTING_STARTED.md`

**Vorteile**:

- ✅ Keine zusätzliche Infrastruktur
- ✅ Volle Kontrolle über lokale Umgebung
- ✅ Bereits dokumentiert

**Nachteile**:

- ❌ 30-60 Minuten Setup-Zeit
- ❌ Plattform-spezifische Probleme (Windows/macOS/Linux)
- ❌ Versionskonflikte (Node 20 vs. 22, Java 11 vs. 17)
- ❌ "Works on my machine" Syndrome
- ❌ Hohe Einstiegshürde für Contributors

### Option B – Docker Compose

**Beschreibung**: `docker-compose.yml` für vollständigen Stack (CAP + DB + Tools)

**Vorteile**:

- ✅ Reproduzierbare Umgebung
- ✅ Production-ähnliches Setup
- ✅ Multi-Container für Services

**Nachteile**:

- ❌ Komplexere Orchestrierung
- ❌ Keine IDE-Integration (VS Code Extensions fehlen)
- ❌ Kein Hot-Reload für Code-Änderungen
- ❌ Networking-Probleme bei Port-Forwarding
- ❌ Overhead für einfache Entwicklungsaufgaben

### Option C – GitHub Codespaces + VS Code Dev Containers (Gewählt)

**Beschreibung**: `.devcontainer/devcontainer.json` mit:

- Base Image: `mcr.microsoft.com/devcontainers/typescript-node:22-bookworm`
- Features: Node 22.20.0, Java 17 (Temurin)
- Tools: `cds-dk`, `mbt`, `cf` CLI, TypeScript, Prettier
- VS Code Extensions: CDS, ESLint, Prettier, REST Client
- Automatisches Setup via `setup.sh` (postCreateCommand)

**Vorteile**:

- ✅ **Zero-Config**: 1-Click-Start in Codespaces
- ✅ **Consistency**: Identische Umgebung für alle Entwickler
- ✅ **IDE-Integration**: Native VS Code Extensions
- ✅ **Performance**: Caching + Pre-builds möglich
- ✅ **Dual-Use**: Lokal (Dev Containers) + Cloud (Codespaces)
- ✅ **Hot-Reload**: `npm run watch` funktioniert out-of-the-box
- ✅ **Port-Forwarding**: Automatische HTTPS-URLs für Testing
- ✅ **Secrets**: GitHub Codespaces Secrets für CF-Credentials

**Nachteile**:

- ⚠️ Codespaces: 60 Std/Monat gratis, danach kostenpflichtig
- ⚠️ Erfordert Docker Desktop für lokale Dev Containers
- ⚠️ Container-Build: ~3-5 Minuten beim ersten Start

### Option D – GitPod

**Beschreibung**: Alternative Cloud-IDE mit `.gitpod.yml`

**Vorteile**:

- ✅ Ähnliche Features wie Codespaces
- ✅ 50 Stunden/Monat gratis

**Nachteile**:

- ❌ Weniger GitHub-Integration
- ❌ Separate Plattform-Vendor-Lock-in
- ❌ Keine native VS Code Dev Containers Unterstützung

## Entscheidung

**Wir wählen Option C: GitHub Codespaces + VS Code Dev Containers**

### Begründung

1. **Developer Experience First**: Neue Contributors können innerhalb von **3-5 Minuten** produktiv arbeiten
2. **Best of Both Worlds**: Lokale Entwicklung (Dev Containers) + Cloud-IDE (Codespaces)
3. **GitHub-native**: Perfekte Integration mit unserem Git-Workflow
4. **Industry Standard**: Devcontainer Spec ist offen und wird von Microsoft, GitHub, GitLab unterstützt
5. **Maintainability**: Deklarative Konfiguration in `devcontainer.json` (IaC-Prinzip)
6. **Cost-Effective**: 60 Std/Monat Codespaces gratis ausreichend für meiste Contributors

### Implementierung

**Verzeichnisstruktur**:

```
.devcontainer/
├── devcontainer.json    # Hauptkonfiguration
├── setup.sh             # Automatisches Setup-Skript
└── README.md            # Devcontainer-Dokumentation
```

**Kernkomponenten**:

1. **Base Image**: `typescript-node:22-bookworm` mit Node 22.20.0
2. **Features**:
   - `java:1` (Version 17, Temurin Distribution)
   - `node:1` (Version 22.20.0)
   - `git:1` (Latest)
   - `github-cli:1` (Latest)

3. **Post-Create Setup** (`setup.sh`):

   ```bash
   - npm install -g @sap/cds-dk typescript tsx mbt prettier @cap-js/mcp-server
   - cf CLI v8 Installation + MultiApps Plugin
   - npm ci (Project Dependencies)
   - .env Creation (from .env.example)
   - cds-typer Type Generation
   ```

4. **Port Forwarding**:
   - `4004`: CAP Server (Auto-notify)
   - `8080`: UI Testing (Silent)

5. **VS Code Extensions** (Auto-Install):
   - `SAPSE.vscode-cds` - SAP CDS Language Support
   - `dbaeumer.vscode-eslint` - ESLint
   - `esbenp.prettier-vscode` - Prettier
   - `humao.rest-client` - REST Client
   - `eamodio.gitlens` - GitLens
   - `ms-azuretools.vscode-docker` - Docker

6. **Editor Settings**:
   - Format on Save: Enabled
   - Default Formatter: Prettier
   - ESLint Auto-fix: On Save
   - Line Endings: LF (Unix-Style)

## Konsequenzen

### Positive Effekte

1. ✅ **Onboarding**: Zeit von 60min → **3-5min** für neue Contributors
2. ✅ **Consistency**: "Works on my machine" Probleme eliminiert
3. ✅ **Documentation**: Setup-Prozess ist Code (IaC)
4. ✅ **Remote-First**: Teams können komplett remote entwickeln
5. ✅ **CI/CD Alignment**: Container-Setup ähnelt GitHub Actions Runner
6. ✅ **Accessibility**: Niedrigere Hardware-Anforderungen (Codespaces in Cloud)

### Negative Effekte / Risiken

1. ⚠️ **Container Overhead**: 3-5min beim ersten Start
   - **Mitigation**: Pre-builds in Codespaces aktivieren (Repository Settings)

2. ⚠️ **Codespaces Limits**: 60 Std/Monat gratis
   - **Mitigation**: Lokale Dev Containers als Fallback
   - **Mitigation**: Codespaces automatisch stoppen nach 30min Inaktivität

3. ⚠️ **Wartungsaufwand**: Devcontainer bei Major-Updates pflegen
   - **Mitigation**: Versionierung in `devcontainer.json` (Node, Java)
   - **Mitigation**: Setup-Skript testen bei Dependency-Updates

4. ⚠️ **Docker Requirement**: Lokale Dev Containers benötigen Docker Desktop
   - **Mitigation**: Weiterhin vollständige Doku in `GETTING_STARTED.md`

5. ⚠️ **Network Dependencies**: Setup benötigt Internetzugang
   - **Mitigation**: Caching von npm-Paketen (`node_modules` Volume)

### Nachgelagerte Aufgaben

1. **Dokumentation**:
   - [x] `.devcontainer/README.md` mit Troubleshooting
   - [x] `README.md` Update mit Codespaces-Badge
   - [x] `GETTING_STARTED.md` mit Codespaces-Anleitung
   - [x] `ARCHITECTURE.md` Update (Kap. 7: Verteilungssicht)

2. **Optimierung**:
   - [ ] Pre-builds aktivieren in Repository Settings (nach Merge)
   - [ ] `.dockerignore` für schnellere Builds
   - [ ] Caching-Strategie für npm-Dependencies

3. **Testing**:
   - [ ] Frischer Codespace erstellen und alle Workflows testen
   - [ ] Lokale Dev Container mit Docker Desktop testen
   - [ ] `npm run watch` → `npm test` → `npm run build:mta` Flow verifizieren

4. **Governance**:
   - [ ] Devcontainer-Updates in CONTRIBUTING.md dokumentieren
   - [ ] ADR-Referenzen in relevanten Docs hinzufügen

## Verweise

### Projektdateien

- `.devcontainer/devcontainer.json` - Hauptkonfiguration
- `.devcontainer/setup.sh` - Setup-Skript
- `.devcontainer/README.md` - Devcontainer-Dokumentation
- `.nvmrc` - Node-Version (Quelle für Container)
- `package.json` → `engines` - Tool-Versions-Requirements

### Externe Dokumentation

- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [GitHub Codespaces Docs](https://docs.github.com/en/codespaces)
- [Dev Container Specification](https://containers.dev/)
- [Dev Container Features](https://containers.dev/features)

### Verwandte ADRs

- [ADR-0004: TypeScript Tooling und Workflow](0004-typescript-tooling-und-workflow.md)
- [ADR-0016: Repository Meta-Dateien und Governance](0016-repository-meta-dateien-und-governance.md)
- [ADR-0018: MTA Deployment Cloud Foundry](0018-mta-deployment-cloud-foundry.md)

### GitHub Issues/PRs

- Initial Implementation: PR #[TBD]
- Pre-builds Activation: Issue #[TBD]
