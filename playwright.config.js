const { defineConfig } = require('@playwright/test');

const chromiumPath = process.env.CHROMIUM_PATH || undefined;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:8080',
    headless: true,
    viewport: { width: 1280, height: 1200 },
  },
  webServer: [
    {
      command: 'darkhttpd . --port 8080',
      port: 8080,
      reuseExistingServer: true,
    },
    {
      command: 'node server.js',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
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
