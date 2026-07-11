const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

function visualPath(testInfo, filename) {
  const directory = path.join(process.cwd(), 'visual-artifacts', testInfo.project.name);
  fs.mkdirSync(directory, { recursive: true });
  return path.join(directory, filename);
}

async function expectNoHorizontalOverflow(page) {
  const hasNoOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth <= root.clientWidth + 1;
  });
  expect(hasNoOverflow).toBe(true);
}

async function stabilizeRevealContent(page) {
  await page.addStyleTag({
    content: '[data-reveal]{opacity:1!important;transform:none!important;transition:none!important;}',
  });
  await page.locator('[data-reveal]').evaluateAll((elements) => {
    elements.forEach((element) => element.classList.add('is-visible'));
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'text/css', body: '' });
  });

  await page.route('https://cdn.jsdelivr.net/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.emailjs={init:function(){},send:function(){return Promise.resolve({status:200});}};',
    });
  });
});

test('capture rebuilt homepage', async ({ page }, testInfo) => {
  await page.goto('index.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Arrive with confidence.' })).toBeVisible();
  await stabilizeRevealContent(page);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: visualPath(testInfo, 'homepage.png'), fullPage: true });
});

test('capture configured booking page', async ({ page }, testInfo) => {
  await page.goto('booking.html');
  await page.getByLabel('Service type').selectOption('transfer');
  await page.locator('#pickup').selectOption('cyril-e-king-airport');
  await page.locator('#dropoff').selectOption('st-john');
  await page.getByLabel('Passengers').fill('4');
  await expect(page.locator('#estimate-rows')).toContainText('$700');
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: visualPath(testInfo, 'booking.png'), fullPage: true });
});

test('capture rebuilt privacy policy', async ({ page }, testInfo) => {
  await page.goto('privacy.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: visualPath(testInfo, 'privacy.png'), fullPage: true });
});

test('capture rebuilt terms page', async ({ page }, testInfo) => {
  await page.goto('terms.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: visualPath(testInfo, 'terms.png'), fullPage: true });
});
