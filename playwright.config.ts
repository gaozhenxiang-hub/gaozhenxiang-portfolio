import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true,
  },
  projects: [
    {
      name: "chrome-1440",
      use: {
        browserName: "chromium",
        channel: "chrome",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "edge-1080p",
      use: {
        browserName: "chromium",
        channel: "msedge",
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],
});
