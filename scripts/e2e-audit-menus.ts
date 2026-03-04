import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const SCREENSHOT_DIR = "e:/Dev/Amuri-Audit/tmp/images";
const BASE_URL = "http://localhost:5173";

async function runTest() {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });

  // Bypass Turnstile
  await context.addInitScript(() => {
    localStorage.setItem("AMURI_AUTOMATION_BYPASS", "true");
  });

  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("BROWSER ERROR:", msg.text());
  });
  page.on("pageerror", (error) => {
    console.error("PAGE ERROR:", error.message);
  });

  try {
    console.log("1. Navigating to login page...");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    await page.waitForTimeout(3000);

    // Debug: capture what the page looks like
    const pageTitle = await page.title();
    const bodyHTML = await page.evaluate(
      () => document.body?.innerHTML?.substring(0, 500) || "EMPTY BODY",
    );
    console.log("Page title:", pageTitle);
    console.log("Body preview:", bodyHTML.substring(0, 300));

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "menu_01_initial.png"),
    });

    // Try to find email input with retry
    console.log("2. Looking for login form...");
    const emailInput = page.locator("#email");
    const count = await emailInput.count();
    console.log("Email input count:", count);

    if (count === 0) {
      // Maybe already logged in or redirected
      const url = page.url();
      console.log("Current URL:", url);

      if (url.includes("/dashboard")) {
        console.log("Already logged in! Proceeding to menu tests...");
      } else {
        console.log("Login form not found. Checking page content...");
        const fullHTML = await page.evaluate(() =>
          document.documentElement.outerHTML.substring(0, 2000),
        );
        console.log("Full HTML:", fullHTML.substring(0, 1000));
        await browser.close();
        return;
      }
    } else {
      // Fill login form
      console.log("3. Filling login credentials...");
      await emailInput.fill("teste@cogitari.com");
      await page.locator("#password").fill("Cogitari@2026!Dev");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "menu_02_login_filled.png"),
      });

      // Click submit
      await page.locator('button[type="submit"]').click();
      console.log("4. Submitted login, waiting for redirect...");
      await page.waitForTimeout(4000);
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "menu_03_after_login.png"),
      });
    }

    const currentUrl = page.url();
    console.log("Current URL after login:", currentUrl);

    // Navigate to each menu and take screenshots
    const menuRoutes = [
      { name: "Governance Dashboard", route: "/dashboard" },
      { name: "Audit Dashboard", route: "/auditorias" },
      { name: "Audit Programs", route: "/auditorias/programas" },
      { name: "Audit Findings", route: "/auditorias/achados" },
      { name: "Audit Action Plans", route: "/auditorias/planos" },
      { name: "Audit Reports Builder", route: "/auditorias/relatorio" },
      { name: "Audit Reports List", route: "/auditorias/relatorios" },
      { name: "Audit Analytics", route: "/auditorias/metricas" },
      { name: "Burn Rate", route: "/financas/burn-rate" },
      { name: "Compliance Overview", route: "/conformidade" },
    ];

    for (let i = 0; i < menuRoutes.length; i++) {
      const menu = menuRoutes[i];
      console.log(`${i + 5}. Navigating to ${menu.name} (${menu.route})...`);

      await page.goto(`${BASE_URL}${menu.route}`, {
        waitUntil: "domcontentloaded",
        timeout: 15000,
      });
      await page.waitForTimeout(2000);

      const screenshotName = `menu_${String(i + 4).padStart(2, "0")}_${menu.name.replace(/ /g, "_").toLowerCase()}.png`;
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, screenshotName),
      });

      // Check if page has content (not blank)
      const bodyText = await page.evaluate(
        () => document.body?.innerText?.trim()?.substring(0, 100) || "",
      );
      console.log(`   → Content: ${bodyText.substring(0, 80) || "(empty)"}`);
    }

    console.log("\n✅ All menu navigation tests completed!");
  } catch (error: any) {
    console.error("Test failed:", error.message);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "menu_error.png"),
    });
  } finally {
    await browser.close();
  }
}

runTest();
