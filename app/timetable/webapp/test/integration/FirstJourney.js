sap.ui.define(['sap/ui/test/opaQunit', './pages/JourneyRunner'], function (opaTest, runner) {
  'use strict';

  function journey() {
    QUnit.module('First journey');

    opaTest('Start application', function (Given, When, Then) {
      Given.iStartMyApp();

      Then.onTheTimeEntriesList.iSeeThisPage();
    });

    opaTest('Navigate to ObjectPage', function (Given, When, Then) {
      // Note: this test will fail if the ListReport page doesn't show any data

      When.onTheTimeEntriesList.onFilterBar().iExecuteSearch();

      Then.onTheTimeEntriesList.onTable().iCheckRows();

      When.onTheTimeEntriesList.onTable().iPressRow(0);
      Then.onTheTimeEntriesObjectPage.iSeeThisPage();
    });

    opaTest('Teardown', function (Given, When, Then) {
      // Cleanup
      Given.iTearDownMyApp();
    });
  }

  runner.run([journey]);
});
