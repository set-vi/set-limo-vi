from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_PAGES = [
    ROOT / "index.html",
    ROOT / "booking.html",
    ROOT / "privacy.html",
    ROOT / "terms.html",
    ROOT / "thank-you.html",
    ROOT / "rebuild" / "index.html",
    ROOT / "rebuild" / "booking.html",
    ROOT / "rebuild" / "thank-you.html",
]
REQUIRED_FILES = [
    ROOT / ".gitignore",
    ROOT / ".github" / "workflows" / "site-health.yml",
    ROOT / "package.json",
    ROOT / "playwright.config.cjs",
    ROOT / "tests" / "rebuild.browser.spec.js",
    ROOT / "docs" / "website-rebuild-control.md",
    ROOT / "docs" / "rebuild-layout.md",
    ROOT / "rebuild" / "assets" / "css" / "site.css",
    ROOT / "rebuild" / "assets" / "css" / "booking.css",
    ROOT / "rebuild" / "assets" / "js" / "site.js",
    ROOT / "rebuild" / "assets" / "js" / "booking.js",
    ROOT / "rebuild" / "assets" / "js" / "thank-you.js",
]
PAGE_MARKERS = {
    "rebuild/index.html": [
        'class="skip-link"',
        'id="main-content"',
        'data-menu-button',
        'data-site-nav',
        'href="booking.html"',
        'href="assets/css/site.css"',
        'src="assets/js/site.js"',
        '<h1>Arrive with confidence.</h1>',
    ],
    "rebuild/booking.html": [
        'id="booking-form"',
        'id="form-status"',
        'id="estimate-panel"',
        'id="request-confirmation"',
        'href="assets/css/booking.css"',
        'src="assets/js/booking.js"',
        '<h1>Plan the ride.</h1>',
    ],
    "rebuild/thank-you.html": [
        'data-booking-summary',
        'data-confirmation-note',
        'src="assets/js/thank-you.js"',
        '<h1>Thank you.</h1>',
    ],
}
TEXT_FILE_MARKERS = {
    "package.json": [
        '"health:site": "python tools/site_health.py"',
        '"test:browser": "playwright test"',
        '"@playwright/test": "1.61.1"',
    ],
    "playwright.config.cjs": [
        "desktop-chromium",
        "mobile-chromium",
        "python -m http.server 4173",
    ],
    "tests/rebuild.browser.spec.js": [
        "rebuilt homepage renders the primary conversion path",
        "booking page exposes route states and estimates correctly",
        "valid reservation request reaches the rebuilt success state",
    ],
    ".github/workflows/site-health.yml": [
        "python tools/site_health.py",
        "npx playwright install --with-deps chromium",
        "npm run test:browser",
    ],
}


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.links: list[str] = []
        self.images: list[tuple[str, str | None]] = []
        self.stylesheets: list[str] = []
        self.scripts: list[str] = []
        self.has_title = False
        self.has_viewport = False
        self.has_lang = False
        self.has_header = False
        self.has_main = False
        self.has_footer = False
        self.has_h1 = False
        self.has_nav = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if tag == "html" and data.get("lang"):
            self.has_lang = True
        if tag == "meta" and data.get("name") == "viewport":
            self.has_viewport = True
        if tag == "title":
            self.has_title = True
        if tag == "header":
            self.has_header = True
        if tag == "main":
            self.has_main = True
        if tag == "footer":
            self.has_footer = True
        if tag == "h1":
            self.has_h1 = True
        if tag == "nav":
            self.has_nav = True
        if data.get("id"):
            self.ids.append(data["id"] or "")
        if tag == "a" and data.get("href"):
            self.links.append(data["href"] or "")
        if tag == "link" and data.get("rel") == "stylesheet" and data.get("href"):
            self.stylesheets.append(data["href"] or "")
        if tag == "script" and data.get("src"):
            self.scripts.append(data["src"] or "")
        if tag == "img" and data.get("src"):
            self.images.append((data["src"] or "", data.get("alt")))


def is_external(target: str) -> bool:
    parsed = urlparse(target)
    return parsed.scheme in {"http", "https", "mailto", "tel"} or target.startswith("//")


def local_target(page: Path, target: str) -> Path:
    clean_target = target.split("?", 1)[0].split("#", 1)[0]
    return (page.parent / clean_target).resolve()


def check_local_asset(page: Path, target: str, asset_type: str) -> list[str]:
    if not target or is_external(target):
        return []
    asset = local_target(page, target)
    if asset.exists():
        return []
    return [f"{page.relative_to(ROOT)}: missing {asset_type} '{target}'"]


def check_page(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"Missing required page: {path.relative_to(ROOT)}"]

    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)

    relative_path = str(path.relative_to(ROOT)).replace("\\", "/")
    if not parser.has_lang:
        errors.append(f"{relative_path}: missing html lang attribute")
    if not parser.has_viewport:
        errors.append(f"{relative_path}: missing viewport meta tag")
    if not parser.has_title:
        errors.append(f"{relative_path}: missing title element")

    id_counts: dict[str, int] = {}
    for value in parser.ids:
        id_counts[value] = id_counts.get(value, 0) + 1
    for value, count in sorted(id_counts.items()):
        if count > 1:
            errors.append(f"{relative_path}: duplicate id '{value}'")

    for src, alt in parser.images:
        if not alt or not alt.strip():
            errors.append(f"{relative_path}: image '{src}' is missing alt text")
        errors.extend(check_local_asset(path, src, "image asset"))

    for href in parser.stylesheets:
        errors.extend(check_local_asset(path, href, "stylesheet"))

    for src in parser.scripts:
        errors.extend(check_local_asset(path, src, "script"))

    for href in parser.links:
        if not href or href.startswith("javascript:") or is_external(href):
            continue
        target_path, _, fragment = href.partition("#")
        destination = path if not target_path else local_target(path, target_path)
        if not destination.exists():
            errors.append(f"{relative_path}: broken local link '{href}'")
            continue
        if fragment and destination.suffix.lower() == ".html":
            destination_text = destination.read_text(encoding="utf-8")
            if not re.search(rf'id=["\']{re.escape(fragment)}["\']', destination_text):
                errors.append(f"{relative_path}: missing anchor target '{href}'")

    if relative_path.startswith("rebuild/"):
        if not parser.has_header:
            errors.append(f"{relative_path}: missing semantic header")
        if not parser.has_main:
            errors.append(f"{relative_path}: missing semantic main")
        if not parser.has_footer:
            errors.append(f"{relative_path}: missing semantic footer")
        if not parser.has_h1:
            errors.append(f"{relative_path}: missing page-level h1")

    if relative_path in {"rebuild/index.html", "rebuild/booking.html"} and not parser.has_nav:
        errors.append(f"{relative_path}: missing navigation landmark")

    for marker in PAGE_MARKERS.get(relative_path, []):
        if marker not in text:
            errors.append(f"{relative_path}: missing required marker {marker!r}")

    return errors


def check_text_markers() -> list[str]:
    errors: list[str] = []
    for relative_path, markers in TEXT_FILE_MARKERS.items():
        path = ROOT / relative_path
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for marker in markers:
            if marker not in text:
                errors.append(f"{relative_path}: missing required marker {marker!r}")
    return errors


def main() -> int:
    errors: list[str] = []

    for required_file in REQUIRED_FILES:
        if not required_file.exists():
            errors.append(f"Missing required file: {required_file.relative_to(ROOT)}")

    errors.extend(check_text_markers())

    for page in REQUIRED_PAGES:
        errors.extend(check_page(page))

    if errors:
        print("=== SITE HEALTH CHECK ===")
        print("Verdict: Does not work")
        for error in errors:
            print(f"- {error}")
        return 1

    print("=== SITE HEALTH CHECK ===")
    print("Verdict: Works")
    print(
        "Checked protected pages, rebuilt reservation flow, test controls, required files, "
        "metadata, landmarks, duplicate IDs, local links, anchors, stylesheets, scripts, and images."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
