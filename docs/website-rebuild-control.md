# Superb Website Rebuild Control

## Verdict

Works partially. The isolated rebuild, responsive layouts, canonical reservation workflow, success state, rebuilt legal pages, automated static gates, desktop/mobile browser tests, visual proof, and deployment-shaped staging package all pass. The current live website remains protected on `main`. Release is blocked only by external hosting access, a real non-production deployment, live EmailJS delivery proof, and the final production cutover decision.

## Canonical branches

- `main` — current live-site source and rollback point. Do not modify during the rebuild.
- `website-rebuild` — isolated rebuild branch. All redesign, consolidation, testing, staging, and release preparation remains here until production release is authorized and proven.

## Rollback anchor

- Protected live branch: `main`
- Branch-point commit: `d0eaa0ed00e8857fd577f2cd6e2e5869a50c96f8`
- Draft pull request: `#3`
- Current release-candidate commit: `b593570f72d459702b62bfee24d55cc9deb1c88b`

## Mission

Rebuild the Superb Executive Transportation website into a maintainable, responsive, accessible, and testable static website while preserving the working service content, reservation workflow, pricing behavior, contact paths, legal requirements, and visual identity unless a deliberate verified improvement replaces them.

## Safety rules

1. Never deploy or merge partially verified rebuild work into `main`.
2. Preserve the current `main` commit as the rollback point.
3. Make changes only on `website-rebuild` or a controlled child branch.
4. Keep rebuilt source pages under `rebuild/` until release preparation is complete.
5. Change one controlled lane at a time and recheck after every correction.
6. Compare rebuilt behavior with the current site before removing or replacing a working feature.
7. Merge or deploy only after layout, booking, mobile, accessibility, link, submission, legal, staging, deployment, and rollback gates support `Works`.

## Proven starting state

- Static HTML website.
- Main files include `index.html`, `booking.html`, `thank-you.html`, `privacy.html`, and `terms.html`.
- The homepage and dedicated booking page each contained large inline CSS and JavaScript blocks.
- Booking behavior and pricing logic were duplicated across pages and had drifted.
- Reservation email submission used EmailJS from the browser.
- No repository-level package, browser tests, automated health workflow, visual proof, or staging package existed before the rebuild.

## Current rebuilt state

### User-facing pages

- `rebuild/index.html` — responsive marketing homepage and conversion path.
- `rebuild/booking.html` — isolated canonical reservation workflow.
- `rebuild/thank-you.html` — durable request success state and summary.
- `rebuild/privacy.html` — rebuilt privacy policy preserving the prior substantive policy.
- `rebuild/terms.html` — rebuilt terms preserving all prior substantive sections.

### Shared implementation

- `rebuild/assets/css/site.css` — shared design, shell, navigation, responsive, and accessibility styles.
- `rebuild/assets/css/booking.css` — booking-page layout and state styles.
- `rebuild/assets/css/legal.css` — legal-page readability and responsive structure.
- `rebuild/assets/js/site.js` — mobile navigation, legal-link ownership, reduced-motion-safe reveals, and shared page behavior.
- `rebuild/assets/js/booking.js` — pricing, route logic, validation, EmailJS submission, inline feedback, honeypot, duplicate-submission control, and redirect.
- `rebuild/assets/js/thank-you.js` — request-summary rendering and cleanup.

### Verification and release controls

- `tools/site_health.py` — structural and source-control health contract.
- `tools/staging_contract.py` — staging-builder and package-control contract.
- `tools/build_staging.py` — deterministic deployment-shaped staging builder.
- `tests/rebuild.browser.spec.js` — desktop and mobile Chromium behavior tests.
- `tests/rebuild.visual.spec.js` — rendered desktop/mobile visual proof captures.
- `tests/staging.browser.spec.js` — browser proof against the generated host-shaped package.
- `playwright.config.cjs` and `package.json` — pinned browser-test and build system.
- `.github/workflows/site-health.yml` — automated source, staging, browser, visual, and artifact workflow.

## Build-lane status

### Lane 0 — Safety and health baseline

**Status:** Works.

**Proof:**
- `website-rebuild` was created from the protected `main` state.
- No root live page, root booking file, live image, or deployment asset is changed by pull request `#3`.
- Draft pull request `#3` remains unmerged.
- `main` remains the rollback point.

### Lane 1 — Shared design and page shell

**Status:** Works.

**Proof:**
- Shared design tokens and typography are implemented.
- Semantic header, navigation, main, and footer structure is present.
- Mobile navigation is deliberate, keyboard-operable, and uses accurate open/close labels.
- Desktop, tablet, and mobile layouts show no horizontal overflow.
- Focus, skip links, reduced motion, image alternatives, and responsive action placement are protected.
- Rendered desktop and mobile screenshots were generated and inspected.

### Lane 2 — Canonical booking system

**Status:** Works in the controlled automated environment.

**Proof:**
- One isolated booking owner exists inside `rebuild/`.
- Transfer, St. John, passenger, round-trip, hourly, and daily pricing rules are preserved.
- Conditional route, custom-address, flight, luggage, return-trip, and extra-stop fields work.
- Inline validation, estimate, sending, failure, and recovery states work.
- Mocked EmailJS submission reaches the success page and produces the correct request summary.
- Automated proof cases pass for $180, $700, and $375 estimates.

**External proof still required:**
- Real EmailJS admin delivery.
- Real customer confirmation delivery.
- Confirmation that hosting and EmailJS origin restrictions accept the staging and production domains.

### Lane 3 — Layout, legal, and interaction states

**Status:** Works.

**Proof:**
- Homepage, booking, success, privacy, and terms pages render on desktop and mobile.
- The prior privacy and terms substance is preserved in the rebuilt shell.
- Rebuilt legal navigation resolves locally throughout the rebuilt flow.
- Loading/sending, validation, route-warning, estimate, error, success, and request-summary states are present.
- Visual screenshot generation is stable and protected from reveal-animation capture artifacts.

### Lane 4 — Submission reliability and protection

**Status:** Works partially.

**Delivered:**
- Client validation.
- Honeypot field.
- Duplicate-submission throttle.
- Inline failure recovery with direct phone and email alternatives.
- Mocked browser mission test for successful submission.
- Request acknowledgement that submission is not final confirmation.

**Remaining external decision and proof:**
- Live EmailJS delivery test.
- Hosting-appropriate server protection or a deliberate documented decision to retain browser-only submission.
- Durable submission logging or a documented alternative.

### Lane 5 — Staging and release proof

**Status:** Works partially.

**Completed proof:**
- Deterministic deployment-shaped package builds successfully.
- Generated package contains 14 controlled files and no extras.
- Every packaged file matches its manifest SHA-256 and byte count.
- Packaged homepage, booking page, privacy policy, terms, images, scripts, styles, and navigation pass desktop and mobile browser tests.
- GitHub Actions run `29137856093` completed successfully across every step.
- Uploaded staging artifact digest: `04bf600eba63c7921086df6717d9484daba4f9ace8d8cff6b67ce0bfddf746e9`.
- Inner deployment ZIP SHA-256: `3cee01b601e840fc2889f798dae0f9a00cfc133fdc8cf1fc69e3979c840efda4`.

**Remaining external proof:**
- Upload the package to a non-production Superb location or staging domain.
- Inspect the real hosted result.
- Submit one clearly marked live test request.
- Verify both EmailJS deliveries.
- Prove rollback and production replacement on the actual host.

## Current active lane

**Lane:** External staging deployment and live delivery proof.

**Current allowed scope:**
- Release and rollback records.
- Hosting/deployment integration files that do not expose credentials.
- Non-production deployment configuration.
- Live-test instructions and proof records.
- Corrections proven by staging behavior.

**Stop condition:** Do not replace root live pages, merge pull request `#3`, or deploy the rebuild as the production site until the actual hosted staging result and real EmailJS delivery are proven.

**Exact next action:** Connect a non-production Superb deployment target to the verified package, deploy artifact SHA-256 `3cee01b601e840fc2889f798dae0f9a00cfc133fdc8cf1fc69e3979c840efda4`, inspect the hosted pages, and submit one marked live reservation test.
