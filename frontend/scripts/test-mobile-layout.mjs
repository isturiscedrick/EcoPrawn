import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { setTimeout } from "node:timers/promises";
import { productionApp } from "./test-server.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const data = { success: true, tanks: [], waterTrend: [], growthTrend: [], visionScanLog: [], feedSchedule: [], bioflocMetrics: [], effluentLog: [], alertsLog: [], resolvedAlerts: 0 };
const backend = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/api/auth/session") {
    await setTimeout(100);
    response.statusCode = 200;
    response.end(JSON.stringify({ user: { id: "mobile-layout-test" } }));
  } else if (request.url === "/api/dashboard" && request.method === "GET") {
    response.end(JSON.stringify(data));
  } else if (request.url === "/api/demo" && request.method === "GET") {
    response.end(JSON.stringify({ heroReadouts: [], feedSchedule: [], tankFormDefaults: { pl: "TEST" } }));
  } else {
    response.statusCode = 404;
    response.end("{}");
  }
});

let app;
let browser;
try {
  backend.listen(0, "127.0.0.1");
  await once(backend, "listening");
  const backendUrl = `http://127.0.0.1:${backend.address().port}`;
  app = await productionApp(backendUrl);
  browser = await chromium.launch({
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}),
    headless: true,
  });

  const results = [];
  for (const width of [320, 360, 390, 430]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`${app.origin}/dashboard`);
    await page.getByRole("heading", { name: "Tank Overview", exact: true }).waitFor();

    const shell = await page.evaluate(() => {
      const headerRow = document.querySelector("#site-header")?.firstElementChild;
      const brand = headerRow?.children[0]?.getBoundingClientRect();
      const controls = headerRow?.children[1]?.getBoundingClientRect();
      const bottomNav = document.querySelector('nav[aria-label="Quick dashboard navigation"]');
      const items = bottomNav ? Array.from(bottomNav.children).map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      }) : [];
      return {
        viewport: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        brandRight: brand?.right ?? null,
        controlsLeft: controls?.left ?? null,
        alertsRect: (() => {
          const rect = document.querySelector('#site-header a[href="/dashboard/alerts"]')?.getBoundingClientRect();
          return rect ? { left: rect.left, right: rect.right, width: rect.width } : null;
        })(),
        avatarRect: (() => {
          const rect = document.querySelector('#site-header button[aria-label="Open profile menu"]')?.getBoundingClientRect();
          return rect ? { left: rect.left, right: rect.right, width: rect.width } : null;
        })(),
        mobileMenuCount: document.querySelectorAll('#site-header [aria-controls="mobile-nav-panel"]').length,
        bottomNavCount: items.length,
        bottomNavItems: items,
        bottomNavLabels: bottomNav ? Array.from(bottomNav.querySelectorAll("a,button")).map(item => item.textContent?.trim()) : [],
        bottomNavDestinations: bottomNav ? Array.from(bottomNav.querySelectorAll("a")).map(item => new URL(item.href).pathname) : [],
      };
    });
    assert.equal(shell.documentWidth, width, `Horizontal page overflow at ${width}px: ${JSON.stringify(shell)}`);
    assert.ok(shell.brandRight !== null && shell.controlsLeft !== null, "Mobile header brand and controls must render");
    assert.ok(shell.brandRight <= shell.controlsLeft, `Header brand overlaps controls at ${width}px: ${JSON.stringify(shell)}`);
    assert.equal(shell.bottomNavCount, 5, "Bottom navigation must contain five primary modules");
    assert.deepEqual(shell.bottomNavLabels, ["Home", "Tanks", "Vision", "Feeding", "Water Quality"], "Bottom navigation labels must match the mobile information architecture");
    assert.deepEqual(shell.bottomNavDestinations, ["/dashboard", "/dashboard/tanks", "/dashboard/analytics", "/dashboard/feeding", "/dashboard/water"], "Bottom navigation links must open their matching modules");
    for (const item of shell.bottomNavItems) {
      assert.ok(item.width > 0 && item.left >= 0 && item.right <= width + 1, `Bottom navigation item clips at ${width}px`);
    }
    const alertsLink = page.getByRole("link", { name: "Alerts" });
    const profileButton = page.getByRole("button", { name: "Open profile menu" });
    await alertsLink.waitFor({ state: "visible" });
    await profileButton.waitFor({ state: "visible" });
    assert.ok(shell.alertsRect && shell.avatarRect, "Alerts and avatar controls must render in the mobile header");
    assert.ok(shell.alertsRect.width >= 40 && shell.avatarRect.width >= 40,
      `Alerts and avatar must retain thumb-friendly hit targets at ${width}px: ${JSON.stringify(shell)}`);
    assert.ok(shell.alertsRect.right <= shell.avatarRect.left,
      `Alerts must sit immediately to the left of the avatar at ${width}px: ${JSON.stringify(shell)}`);
    assert.equal(shell.mobileMenuCount, 0, "The dashboard mobile header must not render a hamburger menu");

    assert.equal(await page.getByRole("button", { name: "More dashboard sections" }).count(), 0,
      "The More drawer shortcut must not appear in mobile bottom navigation");
    await page.getByRole("button", { name: "Open profile menu" }).click();
    const profileMenu = page.getByRole("menu", { name: "Profile menu" });
    await profileMenu.getByRole("menuitem", { name: "View profile" }).waitFor({ state: "visible" });
    await profileMenu.getByRole("menuitem", { name: "Settings" }).waitFor({ state: "visible" });
    const profileActionMetrics = await profileMenu.locator('[role="menuitem"]').evaluateAll((items) =>
      items.slice(0, 2).map((item) => {
        const rect = item.getBoundingClientRect();
        return { width: rect.width, right: rect.right, text: item.textContent?.trim() };
      }),
    );
    assert.ok(profileActionMetrics.every((item) => item.width > 90 && item.right <= width + 1),
      `Profile actions must fit side by side at ${width}px: ${JSON.stringify(profileActionMetrics)}`);
    await page.keyboard.press("Escape");
    assert.deepEqual(pageErrors, [], `Browser errors at ${width}px`);
    results.push({ width, horizontalOverflow: false, bottomNavigationItems: shell.bottomNavCount,
      alertsLeftOfAvatar: true, dashboardMenuHidden: true,
      profileActionsSideBySide: true, pageErrors: pageErrors.length });
    await page.close();
  }

  console.log(JSON.stringify(results, null, 2));
  console.log("Mobile layout regression passed at 320, 360, 390, and 430 pixels.");
} finally {
  if (browser) await browser.close();
  await app?.close();
  backend.closeAllConnections();
  await new Promise((resolve) => backend.close(resolve));
}
