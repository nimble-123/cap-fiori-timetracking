sap.ui.define(['sap/fe/test/ObjectPage'], function (ObjectPage) {
  'use strict';

  var CustomPageDefinitions = {
    actions: {},
    assertions: {},
  };

  return new ObjectPage(
    {
      appId: 'io.nimble.timetable',
      componentId: 'TimeEntriesObjectPage',
      contextPath: '/TimeEntries',
    },
    CustomPageDefinitions,
  );
});
