from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_FILES = [
    ROOT / "tools" / "build_staging.py",
    ROOT / "tests" / "staging.browser.spec.js",
    ROOT / "package.json",
    ROOT / ".gitignore",
    ROOT / ".github" / "workflows" / "site-health.yml",
]

REQUIRED_MARKERS = {
    "tools/build_staging.py": [
        "superb-rebuild-staging.zip",
        "staging-manifest.json",
        "write_deterministic_archive",
        "validate_output",
        '"../png/": "png/"',
    ],
    "tests/staging.browser.spec.js": [
        "deployment-shaped staging package serves the full rebuilt site",
        "/dist/staging/index.html",
        "/dist/staging/booking.html",
        "Privacy Policy",
        "Terms and Conditions",
    ],
    "package.json": [
        '"build:staging": "python tools/build_staging.py"',
    ],
    ".gitignore": [
        "dist/",
    ],
    ".github/workflows/site-health.yml": [
        "Build deployment-shaped staging package",
        "npm run build:staging",
        "superb-rebuild-staging",
        "dist/superb-rebuild-staging.zip",
        "dist/staging/staging-manifest.json",
    ],
}


def main() -> int:
    errors: list[str] = []

    for path in REQUIRED_FILES:
        if not path.is_file():
            errors.append(f"Missing required staging control: {path.relative_to(ROOT)}")

    for relative_path, markers in REQUIRED_MARKERS.items():
        path = ROOT / relative_path
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for marker in markers:
            if marker not in text:
                errors.append(f"{relative_path}: missing required marker {marker!r}")

    print("=== STAGING CONTRACT ===")
    if errors:
        print("Verdict: Does not work")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Verdict: Works")
    print("Protected the deterministic package builder, staging browser test, ignored output, package command, and CI artifact.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
