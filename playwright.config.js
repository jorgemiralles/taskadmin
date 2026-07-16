const { defineConfig } = require('@playwright/test');

const chromiumPath = process.env.CHROMIUM_PATH || undefined;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
  },
  webServer: {
    command: 'darkhttpd . --port 8080',
    port: 8080,
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        launchOptions: chromiumPath ? { executablePath: chromiumPath } : {},
      },
    },
  ],
});
