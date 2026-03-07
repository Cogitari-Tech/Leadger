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
    localStorage.setItem("LEADGERS_AUTOMATION_BYPASS", "true");
  });

  const page = await context.newPage();

  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("BROWSER ERROR:", msg.text());
  });
  page.on("pageerror", (error) => {
    console.error("PAGE ERROR:", error.message);
  });
  page.on("requestfailed", request => {
    console.log(`REQUEST FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });
  page.on("response", response => {
    if (response.status() >= 400) {
      console.log(`HTTP ERROR ${response.status()}: ${response.url()}`);
    }
  });

  try {
    console.log("1. Navigating to landing page...");
    await page.goto(`${BASE_URL}/`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.waitForTimeout(3000);

    // Initial capture
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, "menu_01_landing.png"),
    });

    // Try to find email input with retry
    console.log("2. Looking for landing page login form...");
    const emailInput = page.locator("#login-email");
    const count = await emailInput.count();
    console.log("Landing login email input count:", count);

    if (count === 0) {
      // Check if maybe we're on /login (redirected) or already in dashboard
      const url = page.url();
      console.log("Current URL:", url);
      
      const content = await page.content();
      console.log("PAGE CONTENT PREVIEW:", content.substring(0, 1000));

      if (url.includes("/dashboard")) {
        console.log("Already logged in! Proceeding to menu tests...");
      } else {
        // Find by conventional email input on /login
        const fallbackEmail = page.locator("#email");
        if ((await fallbackEmail.count()) > 0) {
          console.log("Landed on /login fallback form");
          await fallbackEmail.fill("teste@cogitari.com");
          await page.locator("#password").fill("Cogitari@2026!Dev");
          await page.locator('button[type="submit"]').click();
        } else {
          console.log("Login form not found. Closing...");
          await browser.close();
          return;
        }
      }
    } else {
      // Fill landing page login form
      console.log("3. Filling landing page credentials...");
      await emailInput.fill("teste@cogitari.com");
      await page.locator("#login-password").fill("Cogitari@2026!Dev");
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, "menu_02_landing_login_filled.png"),
      });

      // Submit
      await page.locator('button[type="submit"]:has-text("Iniciar Sessão")').click();
      console.log("4. Submitted landing login, waiting for redirect...");
      await page.waitForTimeout(5000);
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
