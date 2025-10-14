# ADR 0001: Clean-Architecture-Layer fuer TrackService

## Status
Akzeptiert - Projektstart (historisch)

## Kontext und Problemstellung
Das Backend musste von Beginn an komplexe Zeitwirtschaftsregeln, externe Feiertagsdaten sowie mehrere UI5-Clients bedienen. Die Standard-CAP-Praxis, Event-Handler direkt im Service zu definieren, fuehrte bei fruehen Prototypen zu starken Abhaengigkeiten zwischen Datenzugriff, Validierung und Orchestrierung. Wir brauchten eine Struktur, die Testbarkeit, Wiederverwendung und klare Verantwortlichkeiten sicherstellt.

## Entscheidungsfaktoren
- Konsistente Trennung von Infrastruktur, Anwendung und Domain-Logik (Clean Architecture).
- Austauschbarkeit von Implementierungen fuer Repositories, Services und Commands ohne Code-Duplikation.
- Moeglichkeit, Handler kontrolliert zu registrieren und spaeter automatisiert zu validieren oder testen.
- Einfache Beobachtbarkeit durch zentrale Initialisierung und Logging.

## Betrachtete Optionen
### Option A  CAP-Standard mit direkt registrierten Handlern
- Handler werden per `this.before(...)` im Service verteilt abgelegt.
- Abhaengigkeiten werden ueber direkte Importe verdrahtet.

### Option B  Eigenes Clean-Architecture-Layer mit Container und Registry
- ServiceContainer baut Repositories, Services, Validatoren, Strategien, Factories und Commands auf (`srv/track-service/handler/container/ServiceContainer.ts`).
- HandlerRegistry und HandlerSetup registrieren Handler gruppiert und nachvollziehbar (`srv/track-service/handler/registry/HandlerRegistry.ts`, `srv/track-service/handler/setup/HandlerSetup.ts`).
- `srv/track-service/track-service.ts` orchestriert den Aufbau vor `super.init()`.

## Entscheidung
Wir waehlen Option B. Der TrackService initialisiert zuerst den ServiceContainer und nutzt dann HandlerSetup, um saemtliche Handlergruppen anzubinden. Dadurch bleibt der ApplicationService schlank, und neue Komponenten koennen ueber den Container eingebunden werden, ohne Aufrufer anzupassen.

## Konsequenzen
- Positiv: Saubere Layer-Trennung, konsistentes Logging via `logger.service*`, einfache Wiederverwendung in Tests.
- Positiv: Neue Handlergruppen lassen sich per `.with...Handlers()` aktivieren, ohne bestehende Registrierung anzufassen.
- Negativ: Hoeherer Initialaufwand, da alle Abhaengigkeiten im Container gepflegt werden muessen.
- Negativ: Entwickler muessen sich mit dem fluenten Setup vertraut machen, bevor neue Events bedient werden koennen.

## Verweise
- `srv/track-service/track-service.ts`
- `srv/track-service/handler/container/ServiceContainer.ts`
- `srv/track-service/handler/setup/HandlerSetup.ts`
- `srv/track-service/handler/registry/HandlerRegistry.ts`
- `srv/track-service/handler/index.ts`
