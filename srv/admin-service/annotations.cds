// srv/annotations.cds - Master Import für alle Annotation-Dateien
// Diese Datei importiert alle anderen Annotation-Dateien und stellt die zentrale Einbindung sicher

////////////////////////////////////////////////////////////////////////////
//  Common Annotations (Shared across all entities)
////////////////////////////////////////////////////////////////////////////
using from './annotations/common/actions'; // Action Annotations (@Common.SideEffects, @Core.OperationAvailable)
using from './annotations/common/authorization'; // @restrict
using from './annotations/common/capabilities'; // @Capabilities
using from './annotations/common/field-controls'; // @readonly, @mandatory, @UI.Hidden
using from './annotations/common/labels'; // Labels & Titles, @Common.Text, @Common.TextArrangement
using from './annotations/common/value-helps'; // @Common.ValueList

////////////////////////////////////////////////////////////////////////////
//  UI Layout Annotations (Per Entity)
////////////////////////////////////////////////////////////////////////////
using from './annotations/ui/activities-ui'; // ActivityTypes UI Layout
using from './annotations/ui/customizing-ui'; // Customizing UI Layout
using from './annotations/ui/entrytypes-ui'; // EntryTypes UI Layout
using from './annotations/ui/projects-ui'; // Projects UI Layout
using from './annotations/ui/states-ui'; // Region UI Layout
using from './annotations/ui/timeentrystatuses-ui'; // TimeEntryStatuses UI Layout
using from './annotations/ui/traveltypes-ui'; // TravelTypes UI Layout
using from './annotations/ui/users-ui'; // Users UI Layout
using from './annotations/ui/worklocations-ui'; // WorkLocations UI Layout

////////////////////////////////////////////////////////////////////////////
//  Hinweis zur Struktur:
//
//  common/          - Geteilte Concerns über alle Entities
//    ├── labels.cds           - Zentrale Labels & Titles
//    ├── field-controls.cds   - Field Controls (@readonly, @mandatory)
//    ├── capabilities.cds     - Entity Capabilities (CRUD permissions)
//    ├── value-helps.cds      - Value Help Definitionen
//    ├── text-arrangements.cds - TextArrangement für bessere Anzeige
//    └── authorization.cds    - Security & Authorization
//
//  ui/              - Entity-spezifische UI Layouts
//    ├── users-ui.cds       - Users UI (LineItem, SelectionFields, etc.)
//    ├── projects-ui.cds    - Projects UI Layout
//    ├── activities-ui.cds  - ActivityTypes UI Layout
//    └── timeentries-ui.cds - TimeEntries UI Layout (Hauptentity)
//
//  Vorteile:
//  - Getrennte Concerns für bessere Wartbarkeit
//  - Teamarbeit-freundlich (verschiedene Experten)
//  - Wiederverwendbare Common-Patterns
//  - Saubere Trennung von UI und Business Logic
////////////////////////////////////////////////////////////////////////////
