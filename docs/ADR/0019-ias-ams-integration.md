# ADR 0019: Produktive Authentifizierung mit IAS & Authorization Management Service

## Status

Akzeptiert – Implementierung im Repository abgeschlossen, BTP-Konfiguration folgt im Subaccount.

## Kontext und Problemstellung

- Die Zeit­erfassung soll auf SAP BTP Cloud Foundry laufen und über SAP Build Work Zone Standard Edition bereitgestellt werden.
- Bisher nutzten wir lokal `auth.kind = mocked` (ADR-0010) und hatten kein produktionsfähiges Identitäts- und Rollenmodell.
- Anforderungen: SSO über IAS, rollenbasierte Freigaben für Zeit­einträge, vorbereitete Attribute für spätere Policy-Regeln (Projekt, Bundesland).
- Stakeholder: Endanwender:innen (Time Tracking), Teamleitungen (Freigabe), Admins (Stammdaten), Security & Compliance.

## Entscheidungsfaktoren

- **Security & Compliance:** Unternehmensweite Identitäten, zentrale Rollentransporte, Auditierbarkeit.
- **Integration Work Zone:** AFS benötigt IAS-/XSUAA-kompatible JWTs; Fiori Feature-Toggles lesen Shell-Rollen.
- **Attribute-basierte Policies:** AMS soll perspektivisch Projekt-/Standort-Filter steuern.
- **Developer Experience:** Lokale Mock-User müssen weiterhin schnell nutzbar bleiben.

## Betrachtete Optionen

### Option A – Reines XSUAA-Setup

- XSUAA liefert OAuth2 Tokens und Role Templates (`xs-security.json`).
- Vorteile: Bewährt, geringe Zusatzkomplexität, direkte CF-Integration.
- Nachteile: Kein Attribut-Policy-Layer, zusätzliche Kopplung für SAML/Corporate IdP, spätere Migration zu AMS notwendig.

### Option B – IAS + AMS (gewählt)

- IAS übernimmt AuthN, AMS Policies liefern Attribute; XSUAA bleibt Fallback via `xsuaa-cross-consumption`.
- Vorteile: Einheitliche Identity-Provider-Landschaft, vorbereitete Attribute (`db/ams-attributes.cds`), automatische DCL-Deployments (`ams/dcl/basePolicies.dcl`).
- Nachteile: Zwei neue CF-Services, zusätzliche Deploy-Schritte, Service Keys für Policy-Deployment erforderlich.

## Entscheidung

Wir wählen **Option B**. Die Umsetzung umfasst:

- `package.json`: Default `cds.requires.auth = "ias"`, Fallback `xsuaa = true`, Mock-User mit Rollen `TimeTrackingUser/Approver/Admin`.
- `xs-security.json`: Scopes & Role Templates für die drei Produktivrollen.
- `db/ams-attributes.cds`: Mapping von User-, Projekt- und Statusinformationen (inkl. `ProjectNumber`) auf AMS-Attribute.
- `ams/dcl/basePolicies.dcl`: Basis-Policies für AMS, deployt durch `cap-fiori-timetracking-ams-policies-deployer`.
- `mta.yaml`: Bindings für `cap-fiori-timetracking-ias` und `cap-fiori-timetracking-ams`, inkl. Zertifikats-Credentials.

## Konsequenzen

- **Positiv:** Einheitlicher AuthN/A-Z-Stack für Work Zone; Attribute stehen der Business-Logik und AMS Policies zur Verfügung; kein Code-Tausch zwischen Dev & Prod.
- **Negativ:** Zusätzlich zu provisionierende Dienste (kostenrelevant), Deployment scheitert, wenn AMS- oder IAS-Bindings fehlen; lokale Tests benötigen weiterhin Mock-Rollenpflege.
- **Follow-ups:** AMS-Policies pro Fachbereich verfeinern, Role Collections im Subaccount anlegen, End-to-End-Tests mit echten JWTs automatisieren.

## Verweise

- `package.json`, `xs-security.json`
- `mta.yaml` (Module & Ressourcen für IAS/AMS)
- `db/ams-attributes.cds`, `ams/dcl/basePolicies.dcl`
- `docs/ARCHITECTURE.md` Abschnitt 7.4
