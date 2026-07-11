# Superb Website Release and Rollback Runbook

## Purpose

This runbook controls non-production deployment, live reservation testing, production cutover, and rollback for the rebuilt Superb Executive Transportation website.

## Release candidate

- Repository: `set-vi/set-limo-vi`
- Source branch: `website-rebuild`
- Protected production-source branch: `main`
- Draft pull request: `#3`
- Protected live rollback commit: `d0eaa0ed00e8857fd577f2cd6e2e5869a50c96f8`
- Verified source commit: `b593570f72d459702b62bfee24d55cc9deb1c88b`
- Successful CI run: `29137856093`
- Uploaded artifact digest: `04bf600eba63c7921086df6717d9484daba4f9ace8d8cff6b67ce0bfddf746e9`
- Deployable inner ZIP SHA-256: `3cee01b601e840fc2889f798dae0f9a00cfc133fdc8cf1fc69e3979c840efda4`
- Manifest file count: `14`

## Package identity

The CI artifact named `superb-rebuild-staging` contains:

1. `superb-rebuild-staging.zip` — the deployable static website package.
2. `staging/staging-manifest.json` — the file-level SHA-256 and byte-count manifest.

Deploy the contents of `superb-rebuild-staging.zip`, not the outer GitHub artifact ZIP.

## Required hosting integration record

Before deployment, record:

- Hosting provider or platform:
- Production domain:
- Non-production staging URL or isolated path:
- Deployment method: control panel / SFTP / FTPS / SSH / provider API / GitHub integration
- Document root:
- Staging document root:
- Credential owner:
- Backup location:
- Cache or CDN layer:
- TLS status:
- Rollback contact:

Do not store passwords, private keys, API tokens, or control-panel credentials in the repository.

## Non-production deployment gate

The staging target must not replace or overwrite the current production document root.

Acceptable targets include:

- a staging subdomain;
- an isolated preview directory;
- a provider preview environment;
- another static-host preview that does not control the production domain.

### Deployment sequence

1. Download the CI artifact from successful run `29137856093`.
2. Verify the outer artifact SHA-256 equals `04bf600eba63c7921086df6717d9484daba4f9ace8d8cff6b67ce0bfddf746e9`.
3. Extract the outer artifact.
4. Verify `superb-rebuild-staging.zip` SHA-256 equals `3cee01b601e840fc2889f798dae0f9a00cfc133fdc8cf1fc69e3979c840efda4`.
5. Extract the inner ZIP into the isolated staging document root.
6. Confirm the staging entrypoint loads `index.html`.
7. Confirm HTTPS loads without certificate errors.
8. Confirm no production files were modified.

## Hosted staging smoke gate

Verify on the actual staging URL:

- Homepage loads without a blank screen.
- Logo text, headline, services, vehicle images, process, contact information, and reservation actions are visible.
- All three vehicle images load.
- Mobile navigation opens, closes, and returns focus correctly.
- Booking page loads from every reservation action.
- Privacy Policy and Terms and Conditions load from homepage, booking, success, and legal pages.
- No local link leaves the staging site unexpectedly.
- No horizontal overflow appears on mobile.
- Browser console has no material runtime errors.
- Direct phone and email links use the correct values.

## Marked live EmailJS test

Use one clearly marked test request so it cannot be mistaken for a customer booking.

### Test values

- Full name: `WEBSITE STAGING TEST - DO NOT BOOK`
- Email: a controlled address able to receive the customer confirmation
- Phone: a controlled 10-digit test number
- Service date: at least two days in the future
- Service time: `12:00 PM`
- Service type: `Private transfer`
- Pickup: `Cyril E. King Airport`
- Drop-off: `Red Hook / Urman Fredericks Marine Terminal`
- Passengers: `1`
- Flight number: `TEST123`
- Ride details: `STAGING DELIVERY TEST ONLY. DO NOT SCHEDULE OR CHARGE.`

### Delivery proof

Record:

- Test submission time and timezone:
- Staging URL:
- Admin request email received: Yes / No
- Admin email received time:
- Customer confirmation received: Yes / No
- Customer email received time:
- Subject lines:
- Required trip fields present and accurate: Yes / No
- Duplicate messages observed: Yes / No
- Spam or junk placement observed: Yes / No
- Console or network error observed:
- Verdict: Works / Works partially / Does not work

Delete or clearly mark the test request after proof is captured.

## Production cutover gate

Production cutover is allowed only when:

- hosted staging smoke gate passes;
- marked live EmailJS test passes;
- current production files are backed up;
- package and manifest hashes are reverified;
- rollback access is proven;
- the production document root is confirmed;
- final production URL and TLS behavior are known;
- draft pull request `#3` remains available for source review;
- production replacement is explicitly authorized.

## Production cutover sequence

1. Record the current production timestamp and visible site state.
2. Back up the current production document root without altering it.
3. Verify the backup can be listed and restored.
4. Upload the verified release package to a temporary server directory.
5. Compare the uploaded file list with `staging-manifest.json`.
6. Move or copy the package into the production document root using the host’s safest atomic or reversible method.
7. Clear only the required host or CDN cache.
8. Run the production smoke gate immediately.
9. Submit a production test request only when the staging delivery proof cannot guarantee production origin acceptance.
10. Record the production verdict and release timestamp.

## Production smoke gate

Verify:

- Production homepage.
- Booking route and estimate behavior.
- Success page.
- Privacy Policy.
- Terms and Conditions.
- Vehicle images.
- Mobile menu.
- Phone and email links.
- No horizontal overflow.
- No material console errors.
- EmailJS origin acceptance.

## Rollback triggers

Rollback immediately when any of the following occurs:

- homepage or booking page fails to load;
- required images or scripts fail;
- reservation submission cannot reach the business;
- pricing or route logic is materially wrong;
- privacy or terms pages are unavailable;
- mobile navigation or primary actions are unusable;
- production domain or TLS behavior is broken;
- deployment changed unrelated host files;
- a defect materially affects customer booking or business operations.

## Rollback sequence

1. Stop further production changes.
2. Preserve logs and screenshots of the failure.
3. Restore the production document-root backup.
4. Confirm the original homepage and booking flow are restored.
5. Clear only the necessary cache.
6. Recheck the original live site.
7. Keep `main` at rollback commit `d0eaa0ed00e8857fd577f2cd6e2e5869a50c96f8` unless a separate verified source correction is required.
8. Record the defect before reopening the rebuild lane.

## Release completion record

- Release version:
- Production domain:
- Release date and time:
- Deployed package SHA-256:
- Source commit:
- Backup location:
- Staging verdict:
- Live EmailJS verdict:
- Production smoke verdict:
- Rollback test verdict:
- Remaining issues:
- Final verdict:
