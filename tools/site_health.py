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
]


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.images: list[tuple[str, str | None]] = []
        self.has_title = False
        self.has_viewport = False
        self.has_lang = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = dict(attrs)
        if tag == "html" and data.get("lang"):
            self.has_lang = True
        if tag == "meta" and data.get("name") == "viewport":
            self.has_viewport = True
        if tag == "title":
            self.has_title = True
        if data.get("id"):
            self.ids.add(data["id"] or "")
        if tag == "a" and data.get("href"):
            self.links.append(data["href"] or "")
        if tag == "img" and data.get("src"):
            self.images.append((data["src"] or "", data.get("alt")))


def is_external(target: str) -> bool:
    parsed = urlparse(target)
    return parsed.scheme in {"http", "https", "mailto", "tel"} or target.startswith("//")


def check_page(path: Path) -> list[str]:
    errors: list[str] = []
    if not path.exists():
        return [f"Missing required page: {path.relative_to(ROOT)}"]

    text = path.read_text(encoding="utf-8")
    parser = PageParser()
    parser.feed(text)

    label = str(path.relative_to(ROOT))
    if not parser.has_lang:
        errors.append(f"{label}: missing html lang attribute")
    if not parser.has_viewport:
        errors.append(f"{label}: missing viewport meta tag")
    if not parser.has_title:
        errors.append(f"{label}: missing title element")

    duplicate_ids = [value for value in parser.ids if len(re.findall(rf'id=[\"\']{re.escape(value)}[\"\']', text)) > 1]
    for value in sorted(duplicate_ids):
        errors.append(f"{label}: duplicate id '{value}'")

    for src, alt in parser.images:
        if not alt:
            errors.append(f"{label}: image '{src}' is missing alt text")
        if not is_external(src):
            asset = (path.parent / src.split("?", 1)[0].split("#", 1)[0]).resolve()
            if not asset.exists():
                errors.append(f"{label}: missing image asset '{src}'")

    for href in parser.links:
        if not href or href.startswith("javascript:") or is_external(href):
            continue
        target_path, _, fragment = href.partition("#")
        destination = path if not target_path else (path.parent / target_path).resolve()
        if not destination.exists():
            errors.append(f"{label}: broken local link '{href}'")
            continue
        if fragment and destination.suffix.lower() == ".html":
            destination_text = destination.read_text(encoding="utf-8")
            if not re.search(rf'id=[\"\']{re.escape(fragment)}[\"\']', destination_text):
                errors.append(f"{label}: missing anchor target '{href}'")

    return errors


def main() -> int:
    errors: list[str] = []
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
    print("Checked required pages, metadata, duplicate IDs, local links, anchors, and image assets.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
