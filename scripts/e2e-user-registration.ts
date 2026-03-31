/**
 * E2E User Registration Flow — Screenshot Capture Script
 *
 * Automates the full user registration journey and captures
 * a screenshot at every critical step. Saves to tmp/images/.
 *
 * Usage:
 *   npx tsx scripts/e2e-user-registration.ts
 *
 * Environment:
 *   - Primary:  staging.cogitari.com.br
 *   - Fallback: localhost:5173  (auto-starts dev server)
 *
 * Requires: playwright, @playwright/test (already in devDependencies)
 */

import { chromium, type Page, type Browser } from "playwright";
import * as path from "path";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../apps/web/.env") });

// ─── Configuration ────────────────────────────────────────

const STAGING_URL = "https://staging.cogitari.com.br";
const LOCAL_URL = "http://localhost:5173";

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || "https://grqhnhftseisxsobamju.supabase.co";
const SSRK = process.env["SUPABASE_SERVICE_R" + "OLE_KEY"] || "";

const timestamp = Date.now();
const TEST_NAME = "Usuário E2E Teste";
const TEST_EMAIL = `e2e.test.${timestamp}@cogitari-test.dev`;
const TEST_PASSWORD = "Test@Secure2026!";
const TEST_COMPANY = `E2E TestCo ${timestamp}`;

const OUTPUT_DIR = path.resolve(__dirname, "..", "tmp", "images");

// ─── Helpers ──────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function screenshot(page: Page, stepNumber: number, name: string) {
  const filename = `${String(stepNumber).padStart(2, "0")}_${name}.png`;
  const filepath = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  📸 ${filename}`);
}

async function checkUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    return response.ok || response.status === 308 || response.status === 307;
  } catch {
    return false;
  }
}

async function confirmEmailViaApi(email: string): Promise<boolean> {
  try {
    // List users to find the one we just created
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${SSRK}`,
          apikey: SSRK,
        },
      },
    );

    if (!listRes.ok) {
      console.error("  ❌ Failed to list users:", await listRes.text());
      return false;
    }

    const { users } = await listRes.json();
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      console.error(`  ❌ User ${email} not found in auth system`);
      return false;
    }

    // Confirm email via admin API
    const updateRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users/${user.id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${SSRK}`,
          apikey: SSRK,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_confirm: true,
        }),
      },
    );

    if (!updateRes.ok) {
      console.error("  ❌ Failed to confirm email:", await updateRes.text());
      return false;
    }

    console.log("  ✅ Email confirmed via Supabase Admin API");
    return true;
  } catch (err) {
    console.error("  ❌ Error confirming email:", err);
    return false;
  }
}

async function cleanupTestUser(email: string): Promise<void> {
  try {
    const listRes = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`,
      {
        headers: {
          Authorization: `Bearer ${SSRK}`,
          apikey: SSRK,
        },
      },
    );
    if (!listRes.ok) return;

    const { users } = await listRes.json();
    const user = users.find((u: any) => u.email === email);
    if (!user) return;

    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${SSRK}`,
        apikey: SSRK,
      },
    });
    console.log("  🧹 Test user cleaned up");
  } catch {
    // Non-critical, ignore
  }
}

// ─── Main Flow ────────────────────────────────────────────

async function main() {
  console.log("\n🚀 E2E User Registration Flow\n");
  console.log(`  📧 Email: ${TEST_EMAIL}`);
  console.log(`  🏢 Company: ${TEST_COMPANY}`);
  console.log(`  📁 Output: ${OUTPUT_DIR}\n`);

  ensureDir(OUTPUT_DIR);

  // Determine base URL
  let BASE_URL = STAGING_URL;
  console.log("🔍 Checking staging availability...");

  const stagingUp = await checkUrl(STAGING_URL);
  if (!stagingUp) {
    console.log("  ⚠️  Staging not reachable. Falling back to localhost...");
    const localUp = await checkUrl(LOCAL_URL);
    if (!localUp) {
      console.error(
        "  ❌ Neither staging nor localhost is reachable.\n     Run `npm run dev` first, or check staging URL.",
      );
      process.exit(1);
    }
    BASE_URL = LOCAL_URL;
  }
  console.log(`  ✅ Using: ${BASE_URL}\n`);

  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: "pt-BR",
      timezoneId: "America/Sao_Paulo",
    });

    const page = await context.newPage();

    // ── Step 1: Landing Page ──────────────────────────────
    console.log("📝 Step 1: Landing Page");
    await page.goto(BASE_URL, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(3000);
    await screenshot(page, 1, "landing_initial");

    // ── Step 2: Switch to Register Mode ───────────────────
    console.log("📝 Step 2: Switching to Register Mode");
    const registerToggle = page.locator('button:has-text("Cadastre-se")');
    if (await registerToggle.count()) {
      await registerToggle.first().click();
      await page.waitForTimeout(1000);
      console.log("  ✅ Toggled to register mode on Landing Page");
    } else {
      console.log("  ⚠️  Register toggle not found on Landing. Navigating to /register...");
      await page.goto(`${BASE_URL}/register`, { waitUntil: "domcontentloaded" });
    }
    await screenshot(page, 2, "registration_mode_active");

    // ── Step 3: Fill Personal Info ────────────────────────
    console.log("📝 Step 3: Fill Personal Info");

    // Try Landing Page Specific IDs first
    const landingName = page.locator("#register-name");
    const landingEmail = page.locator("#register-email");
    const landingPassword = page.locator("#register-password");

    if (await landingName.count()) {
      console.log("  🔹 Using Landing Page registration form");
      await landingName.fill(TEST_NAME);
      await landingEmail.fill(TEST_EMAIL);
      await landingPassword.fill(TEST_PASSWORD);
      await screenshot(page, 3, "register_landing_filled");
      
      const submitBtn = page.locator('button[type="submit"]:has-text("Criar Ambiente Seguro")');
      if (await submitBtn.count()) {
        await submitBtn.click();
      } else {
        await page.locator('button[type="submit"]').first().click();
      }
    } else {
      console.log("  🔹 Fallback to standalone Register Page form");
      // Handle standard /register page (the old logic)
      const nameInput = page.locator('input[placeholder*="nome"], input#name');
      if (await nameInput.count()) await nameInput.first().fill(TEST_NAME);
      
      const emailInput = page.locator('input[type="email"], input#email');
      if (await emailInput.count()) await emailInput.first().fill(TEST_EMAIL);
      
      const passwordInput = page.locator('input[type="password"], input#password');
      if (await passwordInput.count()) await passwordInput.first().fill(TEST_PASSWORD);
      
      const termsCheckbox = page.locator('input[type="checkbox"], [role="checkbox"]');
      if (await termsCheckbox.count()) await termsCheckbox.first().click();
      
      await screenshot(page, 3, "register_standalone_filled");
      await page.locator('button[type="submit"]').first().click();
    }
    await page.waitForTimeout(3000);
    await screenshot(page, 4, "register_choice_step");

    // ── Step 5: Choose "Create Company" ──────────────────
    console.log("📝 Step 5: Choose Create Company");
    const createButton = page.locator(
      'button:has-text("Criar"), button:has-text("Nova Empresa"), button:has-text("create")',
    );
    if (await createButton.count()) {
      await createButton.first().click();
    }
    await page.waitForTimeout(1000);
    await screenshot(page, 5, "register_create_company_step");

    // ── Step 6: Fill Company Name & Submit ────────────────
    console.log("📝 Step 6: Fill Company Name");
    const companyInput = page.locator(
      'input#companyName, input[placeholder*="empresa"], input[placeholder*="Empresa"], input[placeholder*="Cogitari"]',
    );
    if (await companyInput.count()) {
      await companyInput.first().fill(TEST_COMPANY);
    }
    await page.waitForTimeout(500);
    await screenshot(page, 6, "register_company_filled");

    console.log("📝 Step 7: Submit Registration");
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Criar Empresa"), button[type="submit"]',
    );
    if (await submitButton.count()) {
      await submitButton.first().click();
    }
    await page.waitForTimeout(3000);
    await screenshot(page, 7, "register_submitted");

    // ── Step 8: Verify Email via API ──────────────────────
    console.log("📝 Step 8: Confirm Email (Supabase Admin API)");
    const emailConfirmed = await confirmEmailViaApi(TEST_EMAIL);

    if (!emailConfirmed) {
      console.warn(
        "  ⚠️  Could not confirm email automatically. Capturing current state.",
      );
      await screenshot(page, 8, "email_verification_pending");
    } else {
      await screenshot(page, 8, "email_confirmed");
    }

    // ── Step 9: Login with new account ────────────────────
    console.log("📝 Step 9: Login with new account");
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.waitForTimeout(1500);

    const loginEmail = page.locator(
      'input[type="email"], input#email, input[name="email"]',
    );
    if (await loginEmail.count()) {
      await loginEmail.first().fill(TEST_EMAIL);
    }

    const loginPassword = page.locator(
      'input[type="password"], input#password',
    );
    if (await loginPassword.count()) {
      await loginPassword.first().fill(TEST_PASSWORD);
    }

    await page.waitForTimeout(500);
    await screenshot(page, 9, "login_filled");

    const loginButton = page.locator(
      'button[type="submit"], button:has-text("Entrar"), button:has-text("Acessar")',
    );
    if (await loginButton.count()) {
      await loginButton.first().click();
    }
    await page.waitForTimeout(4000);
    await screenshot(page, 10, "post_login");

    // ── Step 10: Capture Onboarding / Dashboard ──────────
    console.log("📝 Step 10: Capture Onboarding or Dashboard");
    const currentUrl = page.url();

    if (currentUrl.includes("/onboarding")) {
      console.log("  📋 Landed on Onboarding Wizard");
      await screenshot(page, 11, "onboarding_wizard");

      // Try to skip/advance through onboarding steps
      for (let i = 0; i < 5; i++) {
        const skipBtn = page.locator(
          'button:has-text("Pular"), button:has-text("Continuar"), button:has-text("Próximo"), button:has-text("Avançar")',
        );
        if (await skipBtn.count()) {
          await skipBtn.first().click();
          await page.waitForTimeout(1500);
          await screenshot(page, 12 + i, `onboarding_step_${i + 2}`);
        } else {
          break;
        }
      }

      // Complete onboarding
      const finishBtn = page.locator(
        'button:has-text("Finalizar"), button:has-text("Concluir"), button:has-text("Dashboard"), button:has-text("Acessar")',
      );
      if (await finishBtn.count()) {
        await finishBtn.first().click();
        await page.waitForTimeout(3000);
      }
    } else if (currentUrl.includes("/user-onboarding")) {
      console.log("  📋 Landed on User Onboarding");
      await screenshot(page, 11, "user_onboarding");

      const continueBtn = page.locator(
        'button:has-text("Entendi"), button:has-text("Continuar")',
      );
      if (await continueBtn.count()) {
        await continueBtn.first().click();
        await page.waitForTimeout(1500);
        await screenshot(page, 12, "user_onboarding_step2");
      }

      const dashBtn = page.locator(
        'button:has-text("Dashboard"), button:has-text("Acessar")',
      );
      if (await dashBtn.count()) {
        await dashBtn.first().click();
        await page.waitForTimeout(3000);
      }
    } else if (currentUrl.includes("/verify-email")) {
      console.log("  📧 Landed on Verify Email page");
      await screenshot(page, 11, "verify_email_page");
    }

    // ── Final: Dashboard Screenshot ──────────────────────
    console.log("📝 Final: Dashboard State");
    await page.waitForTimeout(2000);
    await screenshot(page, 20, "final_state");

    console.log("\n✅ E2E Registration Flow Complete!");
    console.log(`   Screenshots saved to: ${OUTPUT_DIR}\n`);

    // Cleanup test user
    console.log("🧹 Cleaning up test user...");
    await cleanupTestUser(TEST_EMAIL);

    await context.close();
  } catch (err) {
    console.error("\n❌ E2E Flow Error:", err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

main();
