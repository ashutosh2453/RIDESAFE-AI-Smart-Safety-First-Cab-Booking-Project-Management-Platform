const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

async function screenshot(page, name, waitMs = 1500) {
  await page.waitForTimeout(waitMs);
  const file = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: file, fullPage: false });
  const size = fs.statSync(file).size;
  console.log(`✅ Saved ${name} (${Math.round(size / 1024)} KB)`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    // 1. Login page
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await screenshot(page, 'login.png', 1000);

    // 2. Login with demo credentials
    await page.fill('input[type="email"]', 'demo@ridesafe.ai');
    await page.fill('input[type="password"]', 'Demo@1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await screenshot(page, 'dashboard.png', 500);

    // 3. Book Ride page
    await page.goto('http://localhost:5173/app/book', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    // Try clicking SmartMatch button
    const matchBtn = page.locator('button:has-text("SmartMatch"), button:has-text("Calculate")').first();
    if (await matchBtn.isVisible()) {
      await matchBtn.click();
      await page.waitForTimeout(2500);
    }
    await screenshot(page, 'book-ride.png', 500);

    // 4. Confirm ride - book it
    const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Book Now"), button:has-text("Secure PIN")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(3000);
      await screenshot(page, 'active-ride.png', 500);
    } else {
      // Navigate to any active ride if exists
      await page.goto('http://localhost:5173/app/ride-history', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      await screenshot(page, 'ride-history.png', 500);
    }

    // 5. Safety Center
    await page.goto('http://localhost:5173/app/safety', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, 'safety-center.png', 500);

    // 6. Trusted Contacts
    await page.goto('http://localhost:5173/app/trusted-contacts', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await screenshot(page, 'trusted-contacts.png', 500);

    // 7. Projects
    await page.goto('http://localhost:5173/app/projects', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, 'projects.png', 500);

    // 8. Tasks
    await page.goto('http://localhost:5173/app/tasks', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, 'tasks.png', 500);

    // 9. AI Assistant
    await page.goto('http://localhost:5173/app/ai-assistant', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    // Click a suggested chip
    const chip = page.locator('button:has-text("PIN"), button:has-text("safe"), button:has-text("verify")').first();
    if (await chip.isVisible()) {
      await chip.click();
      await page.waitForTimeout(3000);
    }
    await screenshot(page, 'ai-assistant.png', 500);

    // 10. Drivers
    await page.goto('http://localhost:5173/app/drivers', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, 'drivers.png', 500);

    // 11. Landing page
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await screenshot(page, 'landing.png', 500);

    console.log('\n🎉 All screenshots captured!');
  } catch (err) {
    console.error('Screenshot error:', err.message);
  } finally {
    await browser.close();
  }
})();
