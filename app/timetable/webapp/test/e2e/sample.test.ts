import { wdi5 } from 'wdio-ui5-service';

describe('samples', () => {
  it('should log', () => {
    const logger = wdi5.getLogger();
    logger.log('hello world!');
  });

  it('should retrieve a UI5 control', async () => {
    // eslint-disable-next-line no-use-before-define
    const app = await browser.asControl({
      selector: {
        controlType: 'sap.m.Button',
        viewName: 'sap.fe.templates.ListReport.ListReport',
        viewId: 'io.nimble.timetable::TimeEntriesList',
        bindingPath: {
          path: '',
          propertyPath: '/_valid',
          modelName: '$valueHelp',
        },
        searchOpenDialogs: true,
      },
    });
    expect(app).toBeDefined();
  });
});
