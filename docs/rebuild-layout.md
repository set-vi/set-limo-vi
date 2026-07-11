# Superb Website Rebuild Layout Record

## Mission

Rebuild the public Superb Executive Transportation website as a clear, responsive, accessible conversion path while preserving the current live site until the rebuilt version is independently proven.

## Protected baseline

- `main` remains the live rollback point.
- All rebuild work remains on `website-rebuild`.
- Rebuilt pages live under `rebuild/` until release.
- No existing root page is replaced during layout, behavior, or test development.

## Website classification

- Dominant type: marketing and service website.
- Primary user: visitor seeking reserved executive transportation in the U.S. Virgin Islands.
- Primary action: submit a reservation request.
- Secondary actions: review services, inspect vehicle presentation, call, or email.
- Conversion outcome: a complete reservation request reaches the business with enough information for confirmation.

## Current page map

### `rebuild/index.html`

- Brand introduction and service area.
- Main value statement.
- Primary reservation and call actions.
- Immediate service proof.
- Service categories.
- Operating standard and trust information.
- Vehicle presentation using existing assets.
- Reservation process.
- Final reservation action.
- Contact and legal navigation.

### `rebuild/booking.html`

- Trip date, time, and service selection.
- Conditional reserved-hours selection.
- Pickup and drop-off location groups.
- Custom-location details.
- Round-trip and extra-stop controls.
- Conditional return-trip, airport, luggage, and stop fields.
- Passenger and contact details.
- Transfer and hourly estimates.
- Request acknowledgement.
- Inline validation, submission, error, and recovery states.

### `rebuild/thank-you.html`

- Clear request-received status.
- Confirmation limitation statement.
- Session-based request summary.
- Customer-email delivery note when needed.
- Return-home and new-request actions.

### Legal integration

- Current rebuilt pages link to protected root `privacy.html` and `terms.html`.
- Rebuilt legal pages remain pending until the current legal content is inspected and mapped into the shared shell.

## Global shell

- Skip link.
- Sticky identity header.
- Desktop navigation.
- Keyboard-operable mobile menu.
- Semantic main content landmarks.
- Persistent reservation or direct-contact action.
- Contact and legal footer.

## Homepage hierarchy

1. Identity and service area.
2. Main value statement.
3. Primary reservation action.
4. Immediate trust proof.
5. Service categories.
6. Why the service is different.
7. Vehicle presentation.
8. Reservation process.
9. Final call to action.
10. Contact and legal links.

## Booking hierarchy

1. Request status and confirmation limitation.
2. Trip details.
3. Route and conditional route information.
4. Passenger and contact details.
5. Estimate or manual-review message.
6. Required request acknowledgement.
7. Submission and recovery actions.
8. Supporting reservation information and direct contact.

## Responsive strategy

- Desktop: two-column homepage hero, three-column service and process regions, booking form with supporting sidebar.
- Tablet: reduced columns and spacing while preserving reading order; booking sidebar moves below the form.
- Mobile: single-column sequence, deliberate menu button, full-width primary actions, stacked form controls, no horizontal navigation or page overflow.

## Accessibility controls

- Semantic landmarks.
- One page-level heading per page.
- Visible focus states.
- Keyboard-operable mobile menu with Escape closing behavior.
- Reduced-motion support.
- Descriptive image alternatives.
- Persistent form labels.
- Inline status region with live announcements.
- No color-only status communication.
- Practical touch targets.

## Component ownership

### Shared components

Owned by `rebuild/assets/css/site.css` and `rebuild/assets/js/site.js`:

- Brand and header.
- Desktop and mobile navigation.
- Buttons and focus treatment.
- Page containers and hierarchy.
- Shared panels.
- Footer.
- Responsive behavior.
- Reduced-motion-safe reveals.

### Booking components

Owned by `rebuild/assets/css/booking.css` and `rebuild/assets/js/booking.js`:

- Field groups and conditional fields.
- Route notices.
- Estimate panel.
- Form status and recovery.
- Pricing and route logic.
- Validation and submission behavior.

### Success components

Owned by `rebuild/thank-you.html` and `rebuild/assets/js/thank-you.js`:

- Request summary.
- Confirmation note.
- Session cleanup.

## Current proof gates

### Static gate

Must prove:

- Required rebuilt pages and test-control files exist.
- Metadata and semantic landmarks exist.
- IDs are unique.
- Local links, anchors, stylesheets, scripts, and images resolve.
- Images have alternative text.
- Required conversion, booking, success, and test markers remain present.

### Browser gate

Must prove in desktop and mobile Chromium:

- Homepage renders the primary conversion path.
- Existing images load.
- No horizontal overflow exists.
- Mobile navigation opens and closes correctly.
- Booking conditional route states work.
- Pricing produces the controlled $180, $700, and $375 proof cases.
- A valid mocked submission reaches the rebuilt success page and displays the request summary.
- No runtime or console errors occur.

## Current verdict

Works partially. The page map, shared shell, homepage, canonical booking page, success state, responsive rules, and automated test definitions are built. Direct execution, rendered visual inspection, legal integration, staging, and live delivery proof remain open.

## Exact next action

Run the static and browser gates against the branch, inspect desktop and mobile renderings, correct every proven issue, then integrate the legal pages into the rebuilt shell.
