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
}

entity Projects : managed, cuid {
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
  key code : String(1);
      text : localized String(80);
}

entity GermanStates : CodeList {
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

  startTime          : Time not null;
  endTime            : Time not null;
  breakMin           : Integer default 0;

  // Abgeleitete Felder – ausschließlich Server-seitig setzen (berechnet in Service-Logic)
  durationHoursGross : Decimal(5, 2); // 7.50 = 7h30
  durationHoursNet   : Decimal(5, 2);
  overtimeHours      : Decimal(9, 2);
  undertimeHours     : Decimal(9, 2);

  source             : String(20);
  note               : String(500);
}
