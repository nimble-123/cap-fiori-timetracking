namespace io.nimble;

using {
                         cuid,
                         managed,
  sap.common.CodeList as CodeList
} from '@sap/cds/common';

entity Users : managed {
  key ID                    : String(255);
      name                  : String(111);
      active                : Boolean default true;

      weeklyHoursDec        : Decimal(4, 2) default 36.00;
      workingDaysPerWeek    : Integer default 5;

      // Server berechnet/aktualisiert in Service-Logic
      expectedDailyHoursDec : Decimal(4, 2);

  // Bevorzugtes Bundesland für Feiertage
  preferredState        : Association to GermanStates;

  // Urlaubstage pro Jahr
  annualVacationDays    : Decimal(4, 1) default 30.0;

  // Standard-Arbeitsort (Dienstsitz)
  defaultWorkLocation   : Association to WorkLocations;
}entity Projects : managed, cuid {
  number   : String(40);
  name     : String(111);
  active   : Boolean default true;
  billable : Boolean default true;
}

entity ActivityTypes : CodeList {
  key code : String(20);
      text : localized String(80);
}

entity EntryTypes : CodeList {
  key code        : String(1);
      text        : localized String(80);
      criticality : Integer default 0; // UI5 Criticality: 0=neutral, 1=negative(red), 2=critical(orange), 3=positive(green), 5=information(blue)
}

entity GermanStates : CodeList {
  key code : String(2);
      text : localized String(80);
}

entity WorkLocations : CodeList {
  key code : String(10);
      text : localized String(80);
}

entity TravelTypes : CodeList {
  key code : String(2);
      text : localized String(80);
}

entity TimeEntries : managed, cuid {
  user               : Association to Users not null;
  workDate           : Date not null;
  entryType          : Association to EntryTypes not null;

  // Optional: Zuordnung
  project            : Association to Projects;
  activity           : Association to ActivityTypes;

  // Optional: Arbeitsort & Reiseart
  workLocation       : Association to WorkLocations;
  travelType         : Association to TravelTypes;

  startTime          : Time not null;
  endTime            : Time not null;
  breakMin           : Integer default 0;

  // Abgeleitete Felder – ausschließlich Server-seitig setzen (berechnet in Service-Logic)
  durationHoursGross : Decimal(4, 2); // 7.50 = 7h30
  durationHoursNet   : Decimal(4, 2);
  overtimeHours      : Decimal(4, 2);
  undertimeHours     : Decimal(4, 2);

  source             : String(20);
  note               : String(500);
}
