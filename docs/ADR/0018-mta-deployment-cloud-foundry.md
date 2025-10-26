# ADR 0018: MTA-Deployment für SAP BTP Cloud Foundry

## Status

Akzeptiert – mta.yaml liegt vor, Deployment-Pipeline folgt

## Kontext und Problemstellung

- Die Anwendung soll produktiv auf der SAP Business Technology Platform (BTP) im Cloud-Foundry-Umfeld betrieben werden.
- Neben dem CAP-Service müssen weitere Service-Instanzen (HANA HDI, Object Store, Malware Scanning, Application Logging) konsistent gebunden werden.
- Ein einfaches `cf push` mit Manifest stößt an Grenzen (kein DB-Deployer-Build, keine geordneten Service-Abhängigkeiten, kein Mehrmodul-Support).
- Für CI/CD ist ein reproduzierbares Packaging notwendig, das Build- und Deploy-Schritte klar trennt.

## Entscheidungsfaktoren

- **Cloud-native Principles** – Infrastrukturabhängigkeiten sollen deklarativ beschrieben werden (Infrastructure-as-Code).
- **Mehrmodul-Support** – CAP-Service (`gen/srv`) und HDI-Deployer (`gen/db`) müssen in richtiger Reihenfolge gebaut und gebunden werden.
- **Service-Bindings** – Attachments, Malware-Scanner, Logging und HANA benötigen identische Namen zwischen Build und Deploy.
- **CI/CD-Fähigkeit** – Artefakt (`.mtar`) soll sich in Pipelines einfach transportieren lassen (Promotion zu Test/Prod).
- **Standardkonformität** – Orientierung an SAP-Best-Practices für BTP Deployments (Multi-Target Applications).

## Betrachtete Optionen

### Option A – `cf push` mit `manifest.yaml`

- **Vorteile**: Einfaches Setup, schnelle Iteration lokal.
- **Nachteile**: Keine Build Hooks, keine Mehrmodul-Pakete, Services müssen manuell vorab erstellt werden, Risiken bei Reihenfolge (HDI Deployment).

### Option B – `cf deploy` mit `mta.yaml`

- **Vorteile**: Deklarativer Build/Deploy-Flow, Module + Ressourcen klar getrennt, Service-Bindings inklusive, unterstützt by default CI/CD (MTAR-Artifact).
- **Nachteile**: Benötigt zusätzlichen Build-Schritt (`mbt build`), initial höhere Komplexität.

### Option C – Kyma / Helm Charts

- **Vorteile**: Kubernetes-native, erweitert Skalierungsoptionen.
- **Nachteile**: Hoher Umstellungsaufwand, keine unmittelbare Notwendigkeit, zusätzliche Betriebs-Komplexität.

## Entscheidung

- Wir übernehmen **Option B – Multi-Target Application (MTA)** als Standard-Deployment-Strategie.
- `mta.yaml` beschreibt zwei Module (`cap-fiori-timetracking-srv`, `cap-fiori-timetracking-db-deployer`) sowie Ressourcen (HANA HDI, Object Store, Malware Scanning, Application Logging).
- Build Hook `before-all` führt `npm ci` und `cds build --production` aus; `mbt build` erzeugt ein transportierbares `.mtar`.
- Deployments erfolgen via `cf deploy mta_archives/cap-fiori-timetracking_<version>.mtar`, womit Build und Deploy klar getrennt bleiben.

## Konsequenzen

- **Positiv**: Cloud-native, reproduzierbare Deployments; Service-Abhängigkeiten deklarativ; HDI-Deployment automatisiert.
- **Negativ/Risiken**: `mbt`-Tooling als zusätzliche Voraussetzung in CI/CD; Versionierung des MTAR muss zur App-Version passen.
- **Follow-ups**:
  - Integration des MTA-Builds in die Release-Pipeline (Anschluss an ADR-0017).
  - Pflege der Service-Namen in `mta.yaml` und `package.json → cds.requires` synchron halten.
  - Bewertung eines optionalen Kyma-Deployments, sobald Anforderungen es erfordern.

## Verweise

- `mta.yaml`
- `README.md` Abschnitt „☁️ Cloud Deployment (SAP BTP)“
- `GETTING_STARTED.md` Abschnitt „☁️ Deploy auf SAP BTP (Cloud Foundry)“
- `docs/ARCHITECTURE.md` Kapitel 7.3 (Deployment-Szenarien) und 9 (ADR)
