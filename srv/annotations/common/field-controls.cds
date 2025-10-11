// srv/annotations/common/field-controls.cds - Field Controls (@readonly, @mandatory, @UI.Hidden)
using TrackService as service from '../../track-service';

////////////////////////////////////////////////////////////////////////////
//  Berechnete Felder als readonly markieren
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with {
  durationHoursGross @readonly;
  durationHoursNet   @readonly;
  overtimeHours      @readonly;
  undertimeHours     @readonly;
};

////////////////////////////////////////////////////////////////////////////
//  Mandatory Fields (Pflichtfelder)
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with {
  user      @mandatory;
  workDate  @mandatory;
  startTime @mandatory;
  endTime   @mandatory;
};

////////////////////////////////////////////////////////////////////////////
//  Weitere Field Controls können hier hinzugefügt werden
////////////////////////////////////////////////////////////////////////////
// Beispiele:
// annotate service.Users with {
//     expectedDailyHoursDec @UI.Hidden; // Falls berechnet und nicht angezeigt werden soll
// };

// annotate service.Projects with {
//     active @Common.FieldControl: #ReadOnly; // Alternativ zu @readonly
// };
