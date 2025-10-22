import { wdi5 } from 'wdio-ui5-service';
import {} from '../pageobjects/timeTableListReport.page';
import { describe, it } from 'mocha';
import { expect } from 'expect-webdriverio';

describe('Manage Time Entries', () => {
  it('should log', () => {
    const logger = wdi5.getLogger();
    logger.log('hello world!');
  });

  // intentionally skipping this as you have to adjust things to your UI5 app :)
  it.skip('should retrieve a UI5 control', async () => {
    const appLocator = {
      selector: {
        controlType: 'sap.m.App',
        viewName: 'ui5.typescript.helloworld.view.App',
      },
    };

    // eslint-disable-next-line no-use-before-define
    const app = await browser.asControl(appLocator);
    expect(app).toBeDefined();
  });
});
