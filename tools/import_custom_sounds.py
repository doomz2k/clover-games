"""Install operator-supplied phonic sound recordings.

Drop audio files into voices/custom/ named after either the grapheme
(p.mp3, sh.wav, ai.ogg) or the spoken token (puh.mp3, shh.wav) - any of
mp3/wav/ogg/m4a/webm. Each file is trimmed of silence, normalised, faded
and installed over the live clip for that sound (voices/<hash>.ogg).

Custom recordings are the FINAL authority: every voice workflow re-runs
this script last, so re-renders and Sound Lab picks can never clobber
them. Delete a file from voices/custom/ to fall back to the picked
candidate again. Each is also copied into the Sound Lab as 'custom'.

Requires ffmpeg. Run from the repo root.
"""

import json
import os
import re
import subprocess

# grapheme (what the game shows) -> spoken token (what the manifest keys on)
GRAPHEME_TO_TOKEN = {
    "s": "sss", "a": "a", "t": "tuh", "p": "puh", "i": "ih", "n": "nnn",
    "m": "mmm", "d": "duh", "g": "guh", "o": "o", "c": "kuh", "k": "kuh",
    "ck": "kuh", "e": "eh", "u": "uh", "r": "rrr", "h": "huh", "b": "buh",
    "f": "fff", "ff": "fff", "l": "lll", "ll": "lll", "ss": "sss",
    "sh": "shh", "ch": "chuh", "th": "thuh", "ng": "ing", "nk": "ink",
    "qu": "kwuh", "ai": "ay", "ee": "ee", "igh": "eye", "oa": "oh",
    "oo": "oo", "ar": "ar", "or": "or", "ur": "er", "ow": "ow",
}
TOKENS = set(GRAPHEME_TO_TOKEN.values())
EXTS = (".mp3", ".wav", ".ogg", ".m4a", ".webm", ".flac")


def fnv(s):
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def peak_gain(path):
    p = subprocess.run(["ffmpeg", "-i", path, "-af", "volumedetect",
                        "-f", "null", "-"], capture_output=True, text=True)
    m = re.search(r"max_volume: (-?[0-9.]+) dB", p.stderr)
    return min(18.0, -2.0 - float(m.group(1))) if m else 0.0


def main():
    src_dir = "voices/custom"
    if not os.path.isdir(src_dir):
        print("no voices/custom directory - nothing to import")
        return

    lab_path = "voices/lab/manifest.json"
    lab = json.load(open(lab_path)) if os.path.exists(lab_path) else {}

    installed, ignored = [], []
    for name in sorted(os.listdir(src_dir)):
        base, ext = os.path.splitext(name)
        if ext.lower() not in EXTS:
            if name not in ("README.md", "imported.json", ".gitkeep"):
                ignored.append(name)
            continue
        key = base.strip().lower()
        token = key if key in TOKENS else GRAPHEME_TO_TOKEN.get(key)
        if not token:
            ignored.append(name)
            print(f"  {name}: unknown sound name, skipped")
            continue

        src = os.path.join(src_dir, name)
        gain = peak_gain(src)
        out = f"voices/{fnv(f'sound|{token}')}.ogg"
        # strip lead/tail silence, normalise, soft tail fade, cap 2.5s
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", src,
             "-t", "2.5", "-ac", "1", "-ar", "44100",
             "-af",
             "silenceremove=start_periods=1:start_threshold=-45dB,"
             "areverse,silenceremove=start_periods=1:start_threshold=-45dB,"
             f"afade=t=in:st=0:d=0.04,areverse,volume={gain:.1f}dB",
             "-c:a", "libvorbis", "-q:a", "4", out],
            check=True)

        # mirror into the Sound Lab so it can be compared with the rest
        os.makedirs("voices/lab", exist_ok=True)
        subprocess.run(["cp", out, f"voices/lab/{token}__custom.ogg"], check=True)
        if token in lab and "custom" not in lab[token]:
            lab[token].append("custom")
        lab.setdefault(token, ["custom"])
        installed.append((name, token))
        print(f"  {name} -> {token} ({out})")

    if lab:
        with open(lab_path, "w") as f:
            json.dump(lab, f, indent=1, sort_keys=True)
    with open(os.path.join(src_dir, "imported.json"), "w") as f:
        json.dump({n: t for n, t in installed}, f, indent=1, sort_keys=True)

    print(f"done: {len(installed)} custom sounds installed"
          + (f", {len(ignored)} files ignored" if ignored else ""))


if __name__ == "__main__":
    main()
