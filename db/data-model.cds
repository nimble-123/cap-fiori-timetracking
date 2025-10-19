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

      weeklyHoursDec        : Decimal(4, 2);
      workingDaysPerWeek    : Integer;

      // Server berechnet/aktualisiert in Service-Logic
      expectedDailyHoursDec : Decimal(4, 2);

      // Bevorzugtes Bundesland für Feiertage
      preferredState        : Association to GermanStates;

      // Urlaubstage pro Jahr
      annualVacationDays    : Decimal(4, 1);

      // Standard-Arbeitsort (Dienstsitz)
      defaultWorkLocation   : Association to WorkLocations;
}

entity Projects : managed, cuid {
  number   : String(40);
  name     : String(111);
  active   : Boolean default true;
  billable : Boolean default true;
}

entity ActivityTypes : CodeList {
  key code : String(20);
}

entity EntryTypes : CodeList {
  key code        : String(1);
      criticality : Integer default 0; // UI5 Criticality: 0=neutral, 1=negative(red), 2=critical(orange), 3=positive(green), 5=information(blue)
}

entity GermanStates : CodeList {
  key code : String(2);
}

entity WorkLocations : CodeList {
  key code : String(10);
}

entity TravelTypes : CodeList {
  key code : String(2);
}

entity TimeEntryStatuses : CodeList {
  key code               : String(1);
      ![from]            : Association to TimeEntryStatuses;
      ![to]              : Association to TimeEntryStatuses;
      allowDoneAction    : Boolean default false;
      allowReleaseAction : Boolean default false;
      criticality        : Integer default 0; // UI5 Criticality: 0=neutral, 1=negative(red), 2=critical(orange), 3=positive(green), 5=information(blue)
      sortValue          : Integer;
}

entity TimeEntries : managed, cuid {
  user                  : Association to Users not null;
  workDate              : Date not null;
  entryType             : Association to EntryTypes not null;
  status                : Association to TimeEntryStatuses not null;

  // Optional: Zuordnung
  project               : Association to Projects;
  activity              : Association to ActivityTypes;

  // Optional: Arbeitsort & Reiseart
  workLocation          : Association to WorkLocations;
  travelType            : Association to TravelTypes;

  startTime             : Time not null;
  endTime               : Time not null;
  breakMin              : Integer;

  // Abgeleitete Felder – ausschließlich Server-seitig setzen (berechnet in Service-Logic)
  durationHoursGross    : Decimal(4, 2); // 7.50 = 7h30
  durationHoursNet      : Decimal(4, 2);
  overtimeHours         : Decimal(4, 2);
  undertimeHours        : Decimal(4, 2);

  // Sollstunden (Target Hours) - aus User-Profil beim Anlegen kopiert
  expectedDailyHoursDec : Decimal(4, 2);

  source                : String(20);
  note                  : String(500);
}

entity Customizing : managed {
  key ID                            : Integer default 1;

      // Time entry generation defaults
      workStartHour                 : Integer default 8;
      workStartMinute               : Integer default 0;
      defaultBreakMinutes           : Integer default 30;
      generatedSourceCode           : String(20) default 'GENERATED';
      manualSourceCode              : String(20) default 'UI';
      workEntryTypeCode             : String(1) default 'W';
      weekendEntryTypeCode          : String(1) default 'O';
      holidayEntryTypeCode          : String(1) default 'H';

      // Time entry status defaults
      timeEntryStatusOpenCode       : String(1) default 'O';
      timeEntryStatusProcessedCode  : String(1) default 'P';
      timeEntryStatusDoneCode       : String(1) default 'D';
      timeEntryStatusReleasedCode   : String(1) default 'R';

      // User fallback defaults
      fallbackWeeklyHours           : Decimal(4, 2) default 36.00;
      fallbackWorkingDays           : Integer default 5;
      fallbackAnnualVacationDays    : Decimal(4, 1) default 30.0;
      demoUserId                    : String(255) default 'max.mustermann@test.de';

      // Balance settings
      balanceUndertimeCriticalHours : Decimal(4, 2) default 5.00;
      recentMonthsDefault           : Integer default 6;
      balanceYearPastLimit          : Integer default 10;
      balanceYearFutureLimit        : Integer default 1;
      balanceFutureMonthBuffer      : Integer default 2;
      balanceMaxMonths              : Integer default 24;
      balanceMaxHoursAbsolute       : Integer default 500;
      balanceMaxWorkingDaysPerMonth : Integer default 23;

      // Vacation & sick leave thresholds
      vacationWarningRemainingDays  : Decimal(4, 1) default 10.0;
      vacationCriticalRemainingDays : Decimal(4, 1) default 5.0;
      sickLeaveWarningDays          : Integer default 10;
      sickLeaveCriticalDays         : Integer default 30;

      // UI toggles
      hideAttachmentFacet           : Boolean default false;

      // Integrations & locale
      holidayApiBaseUrl             : String(255) default 'https://feiertage-api.de/api/';
      holidayApiCountryParameter    : String(20) default 'nur_land';
      locale                        : String(10) default 'de-DE';
}
