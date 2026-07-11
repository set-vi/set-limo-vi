# Superb Website Rebuild Control

## Verdict

Works partially. The current site is functional and remains protected on `main`, but its booking, styling, and interaction logic are duplicated and tightly coupled inside large HTML files.

## Canonical branches

- `main` — current live-site source and rollback point. Do not modify during the rebuild.
- `website-rebuild` — isolated rebuild branch. All redesign, consolidation, testing, and staging work belongs here until the rebuilt site is proven.

## Mission

Rebuild the Superb Executive Transportation website into a maintainable, responsive, accessible, and testable static website while preserving the working public content, reservation workflow, pricing behavior, contact paths, legal pages, and current visual identity unless a deliberate approved improvement replaces them.

## Safety rules

1. Never deploy or merge partially verified rebuild work into `main`.
2. Preserve the current `main` commit as the rollback point.
3. Make changes only on `website-rebuild` or a child branch created from it.
4. Change one controlled lane at a time.
5. Run the static health gate after every material change.
6. Compare rebuilt behavior with the current site before removing or replacing any working feature.
7. Merge only after layout, booking, mobile, accessibility, link, submission, and regression gates support `Works`.

## Proven starting state

- Static HTML website.
- Main files include `index.html`, `booking.html`, `thank-you.html`, `privacy.html`, and `terms.html`.
- The homepage and dedicated booking page each contain large inline CSS and JavaScript blocks.
- Booking behavior and pricing logic are duplicated across pages and have already drifted.
- Reservation email submission uses EmailJS from the browser.
- No repository-level package or automated health workflow was found before this rebuild lane.

## Build-lane map

### Lane 0 — Safety and health baseline

**Outcome:** The rebuild branch is isolated and every change receives an automated structural check.

**Allowed files:**
- `docs/website-rebuild-control.md`
- `tools/site-health-check.mjs`
- `.github/workflows/rebuild-health.yml`

**Required proof:**
- `main` remains unchanged.
- Required pages exist.
- Local links and assets resolve.
- HTML files contain basic document metadata.
- Duplicate element IDs are rejected.
- GitHub Actions runs the health check on rebuild pushes and pull requests to `main`.

### Lane 1 — Shared design and page shell

Create one shared design-token, typography, navigation, footer, responsive, and accessibility system without changing the booking rules.

### Lane 2 — Canonical booking system

Choose one booking implementation as the owner, extract shared booking and pricing logic, eliminate duplicate behavior, and preserve all validated user outcomes.

### Lane 3 — Layout and interaction rebuild

Apply the Website & UI Layout Blueprint to homepage, booking, legal, confirmation, mobile, loading, validation, success, and failure states.

### Lane 4 — Submission reliability and protection

Improve bot resistance, validation, failure recovery, submission auditing, and durable reservation handling according to the selected hosting constraints.

### Lane 5 — Staging and release proof

Deploy a separate preview, compare it against the current live site, run complete mission tests, preserve rollback instructions, and merge only after the evidence supports `Works`.

## Current active lane

**Lane:** Safety and health baseline.

**Current files permitted:** This control record, the health script, and the rebuild-only GitHub Actions workflow.

**Stop condition:** Do not begin visual or booking code changes until this lane passes.

**Rollback point:** `main` at the branch point used to create `website-rebuild`.

**Exact next action:** Add and run the rebuild static-site health gate.
