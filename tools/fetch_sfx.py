"""Fetch professional CC0 sound effects from Kenney.nl asset packs and
install the curated subset the games use into assets/sfx/<name>.ogg.

The games' audio.js tries these samples first and falls back to the old
synthesised effects for anything missing, so a partial fetch is harmless.
Run by .github/workflows/fetch-sfx.yml (needs ffmpeg + internet).

Kenney assets are CC0 (no attribution required) - credited anyway in
assets/sfx/CREDITS.md because it's polite.
"""

import io
import os
import re
import subprocess
import urllib.request
import zipfile

UA = {"User-Agent": "clover-games-sfx-fetch/1.0 "
                    "(https://github.com/doomz2k/clover-games; educational)"}

# pack slug on kenney.nl -> [(output name, case-insensitive member regex)]
# First zip member matching the regex wins; .ogg preferred over .mp3/.wav.
PACKS = {
    "interface-sounds": [
        ("tap", r"click_001"),
        ("pop", r"select_001|click_002"),
        ("correct", r"confirmation_001"),
        ("wrong", r"error_004|error_001"),
    ],
    "digital-audio": [
        ("star", r"powerUp2\."),
        ("grow", r"powerUp7\."),
        ("fanfare", r"threeTone2\."),
    ],
    "impact-sounds": [
        ("clunk", r"impactSoft_medium_000"),
        ("dice", r"impactWood_light_000"),
    ],
}


def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def find_zip_url(slug):
    page = get(f"https://kenney.nl/assets/{slug}").decode("utf-8", "replace")
    m = re.search(r'https://kenney\.nl/media/pages/assets/[^"\']+?\.zip', page)
    if not m:
        raise RuntimeError(f"no zip link found on asset page for {slug}")
    return m.group(0)


def pick_member(zf, pattern):
    names = [n for n in zf.namelist() if not n.endswith("/")]
    hits = [n for n in names if re.search(pattern, n, re.I)]
    hits.sort(key=lambda n: (not n.lower().endswith(".ogg"), n))
    return hits[0] if hits else None


def main():
    os.makedirs("assets/sfx", exist_ok=True)
    installed, missing = [], []

    for slug, wants in PACKS.items():
        try:
            url = find_zip_url(slug)
            print(f"{slug}: {url}")
            zf = zipfile.ZipFile(io.BytesIO(get(url)))
        except Exception as e:
            print(f"{slug}: FAILED ({e}) - synth fallback stays for its sounds")
            missing += [w[0] for w in wants]
            continue

        for out, pattern in wants:
            member = pick_member(zf, pattern)
            if not member:
                print(f"  {out}: no member matches /{pattern}/")
                missing.append(out)
                continue
            src = f"/tmp/sfx_{out}{os.path.splitext(member)[1]}"
            with open(src, "wb") as f:
                f.write(zf.read(member))
            subprocess.run(
                ["ffmpeg", "-y", "-loglevel", "error", "-i", src,
                 "-ac", "1", "-ar", "44100",
                 "-c:a", "libvorbis", "-q:a", "4", f"assets/sfx/{out}.ogg"],
                check=True)
            os.remove(src)
            print(f"  {out}: {member}")
            installed.append((out, slug, member))

    with open("assets/sfx/CREDITS.md", "w") as f:
        f.write("# Sound effect credits\n\nAll sampled effects are CC0 from "
                "[Kenney.nl](https://kenney.nl/assets) packs:\n\n")
        for out, slug, member in sorted(installed):
            f.write(f"- `{out}.ogg` - {member} ({slug})\n")
        f.write("\nEverything else is synthesised in each game's "
                "`js/core/audio.js`.\n")

    print(f"done: {len(installed)} installed, {len(missing)} missing"
          + (f" ({', '.join(missing)})" if missing else ""))


if __name__ == "__main__":
    main()
