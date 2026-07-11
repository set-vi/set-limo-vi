from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "rebuild"
DIST = ROOT / "dist"
OUTPUT = DIST / "staging"
ARCHIVE = DIST / "superb-rebuild-staging.zip"
MANIFEST = OUTPUT / "staging-manifest.json"

REQUIRED_SOURCE_FILES = [
    SOURCE / "index.html",
    SOURCE / "booking.html",
    SOURCE / "thank-you.html",
    SOURCE / "privacy.html",
    SOURCE / "terms.html",
    SOURCE / "assets" / "css" / "site.css",
    SOURCE / "assets" / "css" / "booking.css",
    SOURCE / "assets" / "css" / "legal.css",
    SOURCE / "assets" / "js" / "site.js",
    SOURCE / "assets" / "js" / "booking.js",
    SOURCE / "assets" / "js" / "thank-you.js",
]

REQUIRED_IMAGES = [
    ROOT / "png" / "van1.png",
    ROOT / "png" / "luxury-int.png",
    ROOT / "png" / "luxury-int2.png",
]

HTML_REPLACEMENTS = {
    "../png/": "png/",
    "../privacy.html": "privacy.html",
    "../terms.html": "terms.html",
}


class StagingBuildError(RuntimeError):
    pass


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def require_files(paths: list[Path]) -> None:
    missing = [str(path.relative_to(ROOT)) for path in paths if not path.is_file()]
    if missing:
        raise StagingBuildError("Missing required source files: " + ", ".join(missing))


def rewrite_html_paths() -> None:
    for page in sorted(OUTPUT.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        for original, replacement in HTML_REPLACEMENTS.items():
            text = text.replace(original, replacement)
        page.write_text(text, encoding="utf-8", newline="\n")


def validate_output() -> None:
    required_output = [OUTPUT / path.relative_to(SOURCE) for path in REQUIRED_SOURCE_FILES]
    required_output.extend(OUTPUT / "png" / image.name for image in REQUIRED_IMAGES)
    require_files(required_output)

    errors: list[str] = []
    for page in sorted(OUTPUT.glob("*.html")):
        text = page.read_text(encoding="utf-8")
        if "../" in text:
            errors.append(f"{page.name}: unresolved parent-relative path")
        if 'href="privacy.html"' not in text:
            errors.append(f"{page.name}: missing local privacy link")
        if 'href="terms.html"' not in text:
            errors.append(f"{page.name}: missing local terms link")

    index_text = (OUTPUT / "index.html").read_text(encoding="utf-8")
    for image_name in ("van1.png", "luxury-int.png", "luxury-int2.png"):
        if f'png/{image_name}' not in index_text:
            errors.append(f"index.html: missing packaged image reference png/{image_name}")

    if errors:
        raise StagingBuildError("; ".join(errors))


def write_manifest() -> None:
    file_records = []
    for path in sorted(OUTPUT.rglob("*")):
        if path.is_file() and path != MANIFEST:
            file_records.append(
                {
                    "path": path.relative_to(OUTPUT).as_posix(),
                    "sha256": sha256(path),
                    "bytes": path.stat().st_size,
                }
            )

    manifest = {
        "package": "superb-executive-transportation-staging",
        "version": "2.0.0-rebuild",
        "entrypoint": "index.html",
        "file_count": len(file_records),
        "files": file_records,
    }
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8", newline="\n")


def write_deterministic_archive() -> None:
    if ARCHIVE.exists():
        ARCHIVE.unlink()

    with zipfile.ZipFile(ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for path in sorted(OUTPUT.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(OUTPUT).as_posix()
            info = zipfile.ZipInfo(relative, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, path.read_bytes())


def main() -> int:
    try:
        require_files(REQUIRED_SOURCE_FILES)
        require_files(REQUIRED_IMAGES)

        if DIST.exists():
            shutil.rmtree(DIST)
        OUTPUT.parent.mkdir(parents=True, exist_ok=True)
        shutil.copytree(SOURCE, OUTPUT)

        packaged_images = OUTPUT / "png"
        packaged_images.mkdir(parents=True, exist_ok=True)
        for image in REQUIRED_IMAGES:
            shutil.copy2(image, packaged_images / image.name)

        rewrite_html_paths()
        validate_output()
        write_manifest()
        write_deterministic_archive()

        print("=== STAGING PACKAGE BUILD ===")
        print("Verdict: Works")
        print(f"Output: {OUTPUT.relative_to(ROOT)}")
        print(f"Archive: {ARCHIVE.relative_to(ROOT)}")
        print(f"Archive SHA-256: {sha256(ARCHIVE)}")
        return 0
    except (OSError, StagingBuildError) as error:
        print("=== STAGING PACKAGE BUILD ===")
        print("Verdict: Does not work")
        print(f"- {error}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
