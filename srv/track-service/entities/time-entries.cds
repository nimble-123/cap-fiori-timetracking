// TimeEntries Entity with Criticality
using {io.nimble as db} from '../../db/data-model';

extend service TrackService with {
    /**
     * TimeEntries - Main entity for time tracking
     * Draft-enabled for comfortable editing
     * Includes calculated criticality fields for overtime/undertime visualization
     */
    @odata.draft.enabled
    entity TimeEntries as
        projection on db.TimeEntries {
            *,
            // Overtime Criticality: 3 = Positive (Green), 0 = None
            case
                when
                    overtimeHours > 0
                then
                    3 // Positive (Green)
                else
                    0 // None (Default)
            end as overtimeCriticality  : Integer,
            // Undertime Criticality: 1 = Negative (Red), 0 = None
            case
                when
                    undertimeHours > 0
                then
                    1 // Negative (Red)
                else
                    0 // None (Default)
            end as undertimeCriticality : Integer
        };
}
