# Superb Website Rebuild Layout Record

## Mission

Rebuild the public Superb Executive Transportation website as a clear, responsive, accessible conversion path while preserving the current live site until the rebuilt version is independently proven.

## Protected baseline

- `main` remains the live rollback point.
- All rebuild work remains on `website-rebuild`.
- Rebuilt pages live under `rebuild/` until release.
- No existing root page is replaced during layout and behavior development.

## Website classification

- Dominant type: marketing and service website.
- Primary user: visitor seeking reserved executive transportation in the U.S. Virgin Islands.
- Primary action: submit a reservation request.
- Secondary actions: review services, inspect vehicle presentation, call, or email.
- Conversion outcome: a complete reservation request reaches the business with enough information for confirmation.

## Page map

### Rebuild lane

1. `rebuild/index.html`
   - Brand introduction
   - Service promise
   - Primary reservation action
   - Service categories
   - Operating standard and trust information
   - Vehicle presentation
   - Contact and final reservation action

2. Existing `../booking.html` during the marketing-shell lane
   - Temporary canonical booking destination
   - Remains untouched until the booking rebuild lane begins

### Planned later pages

- `rebuild/booking.html` — one canonical reservation workflow
- `rebuild/thank-you.html` — durable success state
- `rebuild/privacy.html` — privacy disclosure
- `rebuild/terms.html` — service and payment terms

## Global shell

- Skip link
- Sticky identity header
- Desktop navigation
- Deliberate mobile menu
- Main content landmarks
- Persistent reservation action
- Contact and legal footer

## Homepage hierarchy

1. Identity and service area
2. Main value statement
3. Primary reservation action
4. Immediate trust proof
5. Service categories
6. Why the service is different
7. Vehicle presentation
8. Reservation process
9. Final call to action
10. Contact and legal links

## Responsive strategy

- Desktop: two-column hero, three-column service and standard sections, balanced content width.
- Tablet: reduced columns and spacing while preserving reading order.
- Mobile: single-column sequence, menu button, full-width primary actions, no horizontal navigation scrolling.

## Accessibility controls

- Semantic landmarks
- One page-level heading
- Visible focus states
- Keyboard-operable mobile menu
- Reduced-motion support
- Descriptive image alternatives
- No color-only status communication
- Minimum practical touch target size

## First lane

**Marketing shell and homepage structure**

### Allowed files

- `docs/rebuild-layout.md`
- `rebuild/index.html`
- `rebuild/assets/css/site.css`
- `rebuild/assets/js/site.js`
- health-contract files needed to verify this lane

### Excluded files

- Root `index.html`
- Root `booking.html`
- Existing EmailJS configuration
- Existing pricing and booking behavior
- Existing deployed assets

### Proof gate

The lane closes when:

- The isolated homepage has valid semantic structure.
- Desktop and mobile navigation are defined.
- All local links and referenced files resolve.
- The reservation action reaches the current protected booking page.
- The static-site health gate passes.
- `main` remains unchanged.
