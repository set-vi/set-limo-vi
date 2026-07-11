# Superb Website Rebuild Control

## Verdict

Works partially. The isolated rebuild now contains the new homepage, canonical reservation flow, success state, static health contract, and desktop/mobile browser tests. The current live website remains protected on `main`. Release is blocked until the rebuilt flow passes direct execution, rendered-layout inspection, legal-page integration, staging, and deployment proof.

## Canonical branches

- `main` — current live-site source and rollback point. Do not modify during the rebuild.
- `website-rebuild` — isolated rebuild branch. All redesign, consolidation, testing, staging, and release preparation belongs here until the rebuilt site is proven.

## Rollback anchor

- Protected live branch: `main`
- Branch-point commit: `d0eaa0ed00e8857fd577f2cd6e2e5869a50c96f8`
- Draft pull request: `#3`

## Mission

Rebuild the Superb Executive Transportation website into a maintainable, responsive, accessible, and testable static website while preserving the working service content, reservation workflow, pricing behavior, contact paths, legal requirements, and visual identity unless a deliberate verified improvement replaces them.

## Safety rules

1. Never deploy or merge partially verified rebuild work into `main`.
2. Preserve the current `main` commit as the rollback point.
3. Make changes only on `website-rebuild` or a controlled child branch.
4. Keep rebuilt pages under `rebuild/` until release preparation begins.
5. Change one controlled lane at a time and recheck after every correction.
6. Compare rebuilt behavior with the current site before removing or replacing a working feature.
7. Merge only after layout, booking, mobile, accessibility, link, submission, legal, staging, deployment, and regression gates support `Works`.

## Proven starting state

- Static HTML website.
- Main files include `index.html`, `booking.html`, `thank-you.html`, `privacy.html`, and `terms.html`.
- The homepage and dedicated booking page each contain large inline CSS and JavaScript blocks.
- Booking behavior and pricing logic are duplicated across pages and have drifted.
- Reservation email submission uses EmailJS from the browser.
- No repository-level package, browser tests, or automated health workflow existed before the rebuild.

## Current rebuilt state

- `rebuild/index.html` — responsive marketing homepage and conversion path.
- `rebuild/booking.html` — isolated canonical reservation workflow.
- `rebuild/thank-you.html` — durable request success state and summary.
- `rebuild/assets/css/site.css` — shared design, shell, navigation, responsive, and accessibility styles.
- `rebuild/assets/css/booking.css` — booking-page layout and state styles.
- `rebuild/assets/js/site.js` — mobile navigation, reduced-motion-safe reveal behavior, and shared page behavior.
- `rebuild/assets/js/booking.js` — pricing, route logic, validation, EmailJS submission, inline feedback, honeypot, duplicate-submission control, and redirect.
- `rebuild/assets/js/thank-you.js` — request-summary rendering and cleanup.
- `tools/site_health.py` — structural and control health contract.
- `tests/rebuild.browser.spec.js` — desktop and mobile Chromium behavior tests.
- `playwright.config.cjs` and `package.json` — pinned browser-test execution system.
- `.github/workflows/site-health.yml` — automated static and browser health workflow for the rebuild branch.

## Build-lane status

### Lane 0 — Safety and health baseline

**Status:** Works.

**Proof:**
- `website-rebuild` was created from the protected `main` state.
- No root live page was changed.
- The initial GitHub Actions static health run completed successfully.
- Draft pull request `#3` remains unmerged.

### Lane 1 — Shared design and page shell

**Status:** Built; direct browser proof required.

**Delivered:**
- Shared design tokens and typography.
- Semantic header, navigation, main, and footer structure.
- Deliberate mobile menu instead of horizontal overflow navigation.
- Responsive homepage hierarchy and preserved existing vehicle images.
- Visible focus, skip links, and reduced-motion handling.

### Lane 2 — Canonical booking system

**Status:** Built; direct browser proof required.

**Delivered:**
- One isolated booking owner inside `rebuild/`.
- Preserved transfer, St. John, passenger, round-trip, hourly, and daily pricing rules.
- Conditional route, address, flight, return-trip, and extra-stop fields.
- Inline validation, estimate, sending, failure, and recovery states.
- Preserved EmailJS admin and customer delivery configuration.
- Request acknowledgement, honeypot, and duplicate-submission throttle.

### Lane 3 — Layout and interaction states

**Status:** Built for homepage, booking, and success pages; legal pages remain pending.

**Delivered:**
- Desktop, tablet, and mobile layouts.
- Loading/sending, validation, route-warning, estimate, error, and success states.
- Success-page request summary.

### Lane 4 — Submission reliability and protection

**Status:** Works partially.

**Delivered:**
- Client validation.
- Honeypot field.
- Duplicate-submission throttle.
- Inline failure recovery with direct phone and email alternatives.
- Mocked browser mission test for successful submission.

**Remaining:**
- Live EmailJS delivery proof from staging.
- Hosting-appropriate server protection or a deliberate documented decision to retain browser-only submission.
- Durable submission logging or a documented alternative.

### Lane 5 — Staging and release proof

**Status:** Not started.

**Required:**
- Rendered desktop and mobile inspection.
- Rebuilt legal pages or verified legal-page integration.
- Staging deployment that cannot affect the live root site.
- Live form delivery test.
- Complete regression, rollback, and release instructions.

## Current active lane

**Lane:** Direct execution and rendered-layout proof.

**Current allowed scope:**
- Rebuild pages and assets.
- Static and browser health controls.
- Rebuild control records.
- Test-only corrections proven by execution.

**Stop condition:** Do not replace root live pages, merge the pull request, or deploy the rebuild as the live site until all automated, visual, submission, legal, staging, and rollback gates pass.

**Exact next action:** Execute the static and Playwright gates against the current branch, inspect desktop and mobile renderings, fix every proven defect, then proceed to legal-page integration and staging.
