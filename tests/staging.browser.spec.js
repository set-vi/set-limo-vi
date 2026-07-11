const { test, expect } = require('@playwright/test');

function captureRuntimeFailures(page) {
  const failures = [];
  page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') failures.push(`console: ${message.text()}`);
  });
  return failures;
}

async function expectNoHorizontalOverflow(page) {
  const hasNoOverflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth <= root.clientWidth + 1;
  });
  expect(hasNoOverflow).toBe(true);
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

test('deployment-shaped staging package serves the full rebuilt site', async ({ page }) => {
  const runtimeFailures = captureRuntimeFailures(page);

  await page.goto('/dist/staging/index.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Arrive with confidence.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reserve Your Ride' })).toHaveAttribute('href', 'booking.html');

  const images = page.locator('img');
  await expect(images).toHaveCount(4);
  const brokenImages = await images.evaluateAll((items) =>
    items.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src'))
  );
  expect(brokenImages).toEqual([]);

  const legalNavigation = page.getByRole('navigation', { name: 'Legal navigation' });
  await expect(legalNavigation.getByRole('link', { name: 'Privacy Policy', exact: true })).toHaveAttribute('href', 'privacy.html');
  await expect(legalNavigation.getByRole('link', { name: 'Terms & Conditions', exact: true })).toHaveAttribute('href', 'terms.html');

  await page.getByRole('link', { name: 'Reserve Your Ride' }).click();
  await expect(page).toHaveURL(/\/dist\/staging\/booking\.html$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Plan the ride.' })).toBeVisible();

  await page.goto('/dist/staging/privacy.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();

  await page.goto('/dist/staging/terms.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(runtimeFailures).toEqual([]);
});
