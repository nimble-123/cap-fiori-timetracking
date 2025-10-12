using TrackService as service from '../../../service-model';

////////////////////////////////////////////////////////////////////////////
//  User Entity - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.Users with {
     ID                    @title                 : '{i18n>title.user.ID}'
                           @Common.Label          : '{i18n>user.ID}'
                           @Common.Text           : name
                           @Common.TextArrangement: #TextFirst;

     name                  @title                 : '{i18n>title.user.name}'
                           @Common.Label          : '{i18n>user.name}';

     active                @title                 : '{i18n>title.user.active}'
                           @Common.Label          : '{i18n>user.active}';

     weeklyHoursDec        @title                 : '{i18n>title.user.weeklyHoursDec}'
                           @Common.Label          : '{i18n>user.weeklyHoursDec}'
                           @Measures.Unit         : 'h';

     workingDaysPerWeek    @title                 : '{i18n>title.user.workingDaysPerWeek}'
                           @Common.Label          : '{i18n>user.workingDaysPerWeek}';

     expectedDailyHoursDec @title                 : '{i18n>title.user.expectedDailyHoursDec}'
                           @Common.Label          : '{i18n>user.expectedDailyHoursDec}'
                           @Measures.Unit         : 'h';
};

////////////////////////////////////////////////////////////////////////////
//  Project Entity - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.Projects with {
     ID       @title                 : '{i18n>title.project.ID}'
              @Common.Label          : '{i18n>project.ID}'
              @Common.Text           : number
              @Common.TextArrangement: #TextOnly;

     number   @title                 : '{i18n>title.project.number}'
              @Common.Label          : '{i18n>project.number}';

     name     @title                 : '{i18n>title.project.name}'
              @Common.Label          : '{i18n>project.name}';

     active   @title                 : '{i18n>title.project.active}'
              @Common.Label          : '{i18n>project.active}';

     billable @title                 : '{i18n>title.project.billable}'
              @Common.Label          : '{i18n>project.billable}';
};

////////////////////////////////////////////////////////////////////////////
//  ActivityTypes Entity - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.ActivityTypes with {
     code @title                 : '{i18n>title.activityType.code}'
          @Common.Label          : '{i18n>activityType.code}'
          @Common.Text           : text
          @Common.TextArrangement: #TextOnly;

     text @title                 : '{i18n>title.activityType.text}'
          @Common.Label          : '{i18n>activityType.text}';
};

////////////////////////////////////////////////////////////////////////////
//  EntryTypes Entity - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.EntryTypes with {
     code @title                 : '{i18n>title.entryType.code}'
          @Common.Label          : '{i18n>entryType.code}'
          @Common.Text           : text
          @Common.TextArrangement: #TextLast;

     text @title                 : '{i18n>title.entryType.text}'
          @Common.Label          : '{i18n>entryType.text}';
};

////////////////////////////////////////////////////////////////////////////
//  TimeEntries Entity - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.TimeEntries with {
     ID                   @title                 : '{i18n>title.timeEntry.ID}'
                          @Common.Label          : '{i18n>timeEntry.ID}';

     user                 @title                 : '{i18n>title.timeEntry.user}'
                          @Common.Label          : '{i18n>timeEntry.user}'
                          @Common.Text           : user.name
                          @Common.TextArrangement: #TextOnly;

     workDate             @title                 : '{i18n>title.timeEntry.workDate}'
                          @Common.Label          : '{i18n>timeEntry.workDate}';

     entryType            @title                 : '{i18n>title.timeEntry.entryType}'
                          @Common.Label          : '{i18n>timeEntry.entryType}'
                          @Common.Text           : entryType.text
                          @Common.TextArrangement: #TextLast;

     project              @title                 : '{i18n>title.timeEntry.project}'
                          @Common.Label          : '{i18n>timeEntry.project}'
                          @Common.Text           : project.number
                          @Common.TextArrangement: #TextOnly;

     activity             @title                 : '{i18n>title.timeEntry.activity}'
                          @Common.Label          : '{i18n>timeEntry.activity}'
                          @Common.Text           : activity.text
                          @Common.TextArrangement: #TextOnly;

     startTime            @title                 : '{i18n>title.timeEntry.startTime}'
                          @Common.Label          : '{i18n>timeEntry.startTime}';

     endTime              @title                 : '{i18n>title.timeEntry.endTime}'
                          @Common.Label          : '{i18n>timeEntry.endTime}';

     breakMin             @title                 : '{i18n>title.timeEntry.breakMin}'
                          @Common.Label          : '{i18n>timeEntry.breakMin}'
                          @Measures.Unit         : 'min';

     durationHoursGross   @title                 : '{i18n>title.timeEntry.durationHoursGross}'
                          @Common.Label          : '{i18n>timeEntry.durationHoursGross}'
                          @Measures.Unit         : 'h';

     durationHoursNet     @title                 : '{i18n>title.timeEntry.durationHoursNet}'
                          @Common.Label          : '{i18n>timeEntry.durationHoursNet}'
                          @Measures.Unit         : 'h';

     overtimeHours        @title                 : '{i18n>title.timeEntry.overtimeHours}'
                          @Common.Label          : '{i18n>timeEntry.overtimeHours}'
                          @Measures.Unit         : 'h';

     undertimeHours       @title                 : '{i18n>title.timeEntry.undertimeHours}'
                          @Common.Label          : '{i18n>timeEntry.undertimeHours}'
                          @Measures.Unit         : 'h';

     note                 @title                 : '{i18n>title.timeEntry.note}'
                          @Common.Label          : '{i18n>timeEntry.note}'
                          @UI.MultiLineText;

     source               @title                 : '{i18n>title.timeEntry.source}'
                          @Common.Label          : '{i18n>timeEntry.source}';

     // Virtual/Calculated Fields
     entryTypeCriticality @title                 : '{i18n>title.timeEntry.entryTypeCriticality}'
                          @Common.Label          : '{i18n>timeEntry.entryTypeCriticality}';

     overtimeCriticality  @title                 : '{i18n>title.timeEntry.overtimeCriticality}'
                          @Common.Label          : '{i18n>timeEntry.overtimeCriticality}';

     undertimeCriticality @title                 : '{i18n>title.timeEntry.undertimeCriticality}'
                          @Common.Label          : '{i18n>timeEntry.undertimeCriticality}';
};

////////////////////////////////////////////////////////////////////////////
//  MonthlyBalances Entity - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.MonthlyBalances with {
     month               @title        : '{i18n>title.balance.month}'
                         @Common.Label : '{i18n>balance.month}';

     year                @title        : '{i18n>title.balance.year}'
                         @Common.Label : '{i18n>balance.year}';

     monthNumber         @title        : '{i18n>title.balance.monthNumber}'
                         @Common.Label : '{i18n>balance.monthNumber}';

     totalOvertimeHours  @title        : '{i18n>title.balance.overtime}'
                         @Common.Label : '{i18n>balance.overtime}'
                         @Measures.Unit: 'h';

     totalUndertimeHours @title        : '{i18n>title.balance.undertime}'
                         @Common.Label : '{i18n>balance.undertime}'
                         @Measures.Unit: 'h';

     balanceHours        @title        : '{i18n>title.balance.balance}'
                         @Common.Label : '{i18n>balance.balance}'
                         @Measures.Unit: 'h';

     workingDays         @title        : '{i18n>title.balance.workingDays}'
                         @Common.Label : '{i18n>balance.workingDays}';

     balanceCriticality  @title        : '{i18n>title.balance.criticality}'
                         @Common.Label : '{i18n>balance.criticality}';
};

////////////////////////////////////////////////////////////////////////////
//  Unbound Actions - Labels & TextArrangements
////////////////////////////////////////////////////////////////////////////
annotate service.generateYearlyTimeEntries with(year  @title: '{i18n>title.generateYearlyTimeEntries.year}'       @Common.Label: '{i18n>generateYearlyTimeEntries.year}',
stateCode                                             @title: '{i18n>title.generateYearlyTimeEntries.stateCode}'  @Common.Label: '{i18n>generateYearlyTimeEntries.stateCode}'
);

annotate service.getMonthlyBalance with(year  @title: '{i18n>title.parameter.year}'   @Common.Label: '{i18n>parameter.year}',
month                                         @title: '{i18n>title.parameter.month}'  @Common.Label: '{i18n>parameter.month}'
);

////////////////////////////////////////////////////////////////////////////
//  Entity and Action Labels (Common.Label)
////////////////////////////////////////////////////////////////////////////
annotate service.Users with @(Common.Label: '{i18n>entity.Users}');
annotate service.Projects with @(Common.Label: '{i18n>entity.Projects}');
annotate service.ActivityTypes with @(Common.Label: '{i18n>entity.ActivityTypes}');
annotate service.EntryTypes with @(Common.Label: '{i18n>entity.EntryTypes}');
annotate service.TimeEntries with @(Common.Label: '{i18n>entity.TimeEntries}');
annotate service.MonthlyBalances with @(Common.Label: '{i18n>entity.MonthlyBalances}');
annotate service.getMonthlyBalance with @(Common.Label: '{i18n>action.getMonthlyBalance}');
annotate service.getCurrentBalance with @(Common.Label: '{i18n>action.getCurrentBalance}');
annotate service.generateYearlyTimeEntries with @(Common.Label: '{i18n>action.generateYearlyTimeEntries}');
annotate service.generateMonthlyTimeEntries with @(Common.Label: '{i18n>action.generateMonthlyTimeEntries}');

////////////////////////////////////////////////////////////////////////////
//  Hinweise zu TextArrangement:
//
//  #TextOnly     - Nur der Text wird angezeigt (Key wird versteckt)
//  #TextFirst    - Text zuerst, dann Key: "Bezeichnung (Code)"
//  #TextLast     - Key zuerst, dann Text: "Code - Bezeichnung"
//  #TextSeparate - Text und Key getrennt in verschiedenen Spalten
//
//  Common.Text definiert welches Feld als Anzeigetext verwendet wird
////////////////////////////////////////////////////////////////////////////
