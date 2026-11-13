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
        bottomNavCount: items.length,
        bottomNavItems: items,
      };
    });
    assert.equal(shell.documentWidth, width, `Horizontal page overflow at ${width}px: ${JSON.stringify(shell)}`);
    assert.ok(shell.brandRight !== null && shell.controlsLeft !== null, "Mobile header brand and controls must render");
    assert.ok(shell.brandRight <= shell.controlsLeft, `Header brand overlaps controls at ${width}px: ${JSON.stringify(shell)}`);
    assert.equal(shell.bottomNavCount, 5, "Bottom navigation must contain Home, Tanks, Vision, Feeding, and More");
    for (const item of shell.bottomNavItems) {
      assert.ok(item.width > 0 && item.left >= 0 && item.right <= width + 1, `Bottom navigation item clips at ${width}px`);
    }
    await page.getByRole("link", { name: "Alerts" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Open profile menu" }).waitFor({ state: "visible" });

    await page.getByRole("button", { name: "More dashboard sections" }).click();
    const drawer = page.getByRole("dialog", { name: "Dashboard menu" });
    await drawer.waitFor({ state: "visible" });
    const drawerMetrics = await drawer.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, width: rect.width, bodyPosition: document.body.style.position, bodyTop: document.body.style.top };
    });
    assert.ok(Math.abs(drawerMetrics.left) <= 1, `Drawer must align to the left edge at ${width}px`);
    assert.ok(drawerMetrics.width <= width, `Drawer exceeds viewport width at ${width}px`);
    assert.equal(drawerMetrics.bodyPosition, "fixed", "Opening the drawer must lock background scrolling");
    assert.ok(drawerMetrics.bodyTop.endsWith("px"), "Scroll lock must preserve the previous scroll offset");

    await page.keyboard.press("Escape");
    await drawer.waitFor({ state: "hidden" });
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute("aria-label")), "More dashboard sections",
      "Closing the drawer with Escape must restore focus to More");
    assert.deepEqual(pageErrors, [], `Browser errors at ${width}px`);
    results.push({ width, horizontalOverflow: false, bottomNavigationItems: shell.bottomNavCount,
      drawerWidth: Math.round(drawerMetrics.width), backgroundScrollLocked: true, pageErrors: pageErrors.length });
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
