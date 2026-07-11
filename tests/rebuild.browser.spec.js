const { test, expect } = require('@playwright/test');

function captureRuntimeFailures(page) {
  const failures = [];

  page.on('pageerror', (error) => {
    failures.push(`pageerror: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      failures.push(`console: ${message.text()}`);
    }
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

test('rebuilt homepage renders the primary conversion path', async ({ page }) => {
  const runtimeFailures = captureRuntimeFailures(page);

  await page.goto('index.html');

  await expect(page.getByRole('heading', { level: 1, name: 'Arrive with confidence.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Reserve Your Ride' })).toHaveAttribute('href', 'booking.html');
  await expect(page.getByRole('heading', { level: 2, name: 'Transportation built around the reservation.' })).toBeVisible();
  await expect(page.locator('img')).toHaveCount(4);

  const brokenImages = await page.locator('img').evaluateAll((images) =>
    images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.getAttribute('src'))
  );
  expect(brokenImages).toEqual([]);

  await expectNoHorizontalOverflow(page);
  expect(runtimeFailures).toEqual([]);
});

test('mobile navigation opens, closes, and preserves the page', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile navigation is tested in the mobile project.');
  const runtimeFailures = captureRuntimeFailures(page);

  await page.goto('index.html');

  const menuButton = page.getByRole('button', { name: 'Open navigation' });
  const navigation = page.locator('#primary-navigation');

  await expect(menuButton).toBeVisible();
  await expect(navigation).not.toHaveClass(/is-open/);

  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(navigation).toHaveClass(/is-open/);
  await expect(page.getByRole('link', { name: 'Services' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(navigation).not.toHaveClass(/is-open/);

  await expectNoHorizontalOverflow(page);
  expect(runtimeFailures).toEqual([]);
});

test('booking page exposes route states and estimates correctly', async ({ page }) => {
  const runtimeFailures = captureRuntimeFailures(page);

  await page.goto('booking.html');

  await expect(page.getByRole('heading', { level: 1, name: 'Plan the ride.' })).toBeVisible();
  await page.getByLabel('Service type').selectOption('transfer');
  await page.getByLabel('Pickup').selectOption('cyril-e-king-airport');
  await page.getByLabel('Drop-off').selectOption('red-hook');
  await page.getByLabel('Passengers').fill('1');

  await expect(page.getByLabel('Arrival flight number')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Estimated service' })).toBeVisible();
  await expect(page.locator('#estimate-rows')).toContainText('Estimated total');
  await expect(page.locator('#estimate-rows')).toContainText('$180');

  await page.getByLabel('Drop-off').selectOption('st-john');
  await expect(page.locator('#route-message')).toContainText('St. John trips require additional coordination');
  await expect(page.locator('#estimate-rows')).toContainText('$700');

  await page.getByLabel('Service type').selectOption('hourly-rental');
  await expect(page.getByLabel('Reserved time')).toBeVisible();
  await expect(page.locator('#estimate-rows')).toContainText('$375');

  await expectNoHorizontalOverflow(page);
  expect(runtimeFailures).toEqual([]);
});

test('valid reservation request reaches the rebuilt success state', async ({ page }) => {
  const runtimeFailures = captureRuntimeFailures(page);

  await page.goto('booking.html');

  const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await page.getByLabel('Service date').fill(futureDate);
  await page.getByLabel('Service time').selectOption('12:00');
  await page.getByLabel('Service type').selectOption('transfer');
  await page.getByLabel('Pickup').selectOption('cyril-e-king-airport');
  await page.getByLabel('Drop-off').selectOption('red-hook');
  await page.getByLabel('Arrival flight number').fill('AA123');
  await page.getByLabel('Full name').fill('Test Passenger');
  await page.getByLabel('Phone number').fill('3405551212');
  await page.getByLabel('Email').fill('test@example.com');
  await page.getByLabel('Passengers').fill('2');
  await page.getByLabel(/I understand this is a request/).check();

  await page.getByRole('button', { name: 'Submit Request' }).click();

  await expect(page).toHaveURL(/thank-you\.html$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Thank you.' })).toBeVisible();
  await expect(page.locator('[data-booking-summary]')).toContainText('Test Passenger');
  await expect(page.locator('[data-booking-summary]')).toContainText('Cyril E. King Airport');
  await expect(page.locator('[data-booking-summary]')).toContainText('Red Hook');

  await expectNoHorizontalOverflow(page);
  expect(runtimeFailures).toEqual([]);
});

test('rebuilt legal pages preserve their primary content and navigation', async ({ page }) => {
  const runtimeFailures = captureRuntimeFailures(page);

  await page.goto('privacy.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Privacy Policy' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '1. Information We Collect' })).toBeVisible();
  await expect(page.getByText('Superb Executive Transportation does not sell customer personal information.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', 'terms.html');
  await expectNoHorizontalOverflow(page);

  await page.goto('terms.html');
  await expect(page.getByRole('heading', { level: 1, name: 'Terms and Conditions' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '1. Booking Requests and Reservations' })).toBeVisible();
  await expect(page.getByText(/Submitting a booking request does not automatically confirm service/)).toBeVisible();
  await expect(page.getByRole('heading', { name: '26. Contact' })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  expect(runtimeFailures).toEqual([]);
});
