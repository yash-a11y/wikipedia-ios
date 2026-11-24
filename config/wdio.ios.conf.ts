// iOS config. It runs on GitHub's cloud Mac, where the workflow has already started Appium.
// It does not touch your Android config.
const ART = process.env.ARTIFACT_DIR ?? './artifacts';

export const config: WebdriverIO.Config = {
  runner: 'local',
  hostname: process.env.APPIUM_HOST ?? '127.0.0.1',
  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: '/',

  // Only the iOS tests. Android locators do not work on iOS.
  specs: ['../test/specs/ios/**/*.ts'],

  capabilities: [
    {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:deviceName': process.env.DEVICE_NAME ?? 'iPhone 17',
      'appium:platformVersion': process.env.PLATFORM_VERSION ?? '26.5',
      'appium:udid': process.env.UDID,
      'appium:app': process.env.APP_PATH,
      'appium:wdaLaunchTimeout': 240000,
      'appium:wdaConnectionTimeout': 240000,
      'appium:newCommandTimeout': 300,
      'appium:autoAcceptAlerts': true,
      'appium:isHeadless': true,
      'appium:simulatorStartupTimeout': 600000,
      ...(process.env.USE_PREBUILT_WDA
        ? { 'appium:usePrebuiltWDA': true, 'appium:derivedDataPath': process.env.WDA_DERIVED_DATA }
        : {}),
    },
  ],

  framework: 'mocha',
  mochaOpts: { timeout: 180000 },
  reporters: ['spec'],
  logLevel: 'info',
  waitforTimeout: 20000,
  connectionRetryTimeout: 240000,
  connectionRetryCount: 1,

  // Save a screenshot and the screen's element list when a test fails.
  afterTest: async function (_test, _context, { passed }) {
    if (!passed) {
      const fs = await import('node:fs');
      fs.mkdirSync(`${ART}/screenshots`, { recursive: true });
      await browser.saveScreenshot(`${ART}/screenshots/failed-${Date.now()}.png`);
      fs.writeFileSync(`${ART}/page_source_failed-${Date.now()}.xml`, await browser.getPageSource());
    }
  },
};
