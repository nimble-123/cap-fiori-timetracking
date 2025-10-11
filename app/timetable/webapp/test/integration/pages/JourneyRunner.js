sap.ui.define(
  [
    'sap/fe/test/JourneyRunner',
    'io/nimble/timetable/test/integration/pages/TimeEntriesList',
    'io/nimble/timetable/test/integration/pages/TimeEntriesObjectPage',
  ],
  function (JourneyRunner, TimeEntriesList, TimeEntriesObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
      launchUrl: sap.ui.require.toUrl('io/nimble/timetable') + '/test/flp.html#app-preview',
      pages: {
        onTheTimeEntriesList: TimeEntriesList,
        onTheTimeEntriesObjectPage: TimeEntriesObjectPage,
      },
      async: true,
    });

    return runner;
  },
);
