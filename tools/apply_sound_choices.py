"""Apply the operator's Sound Lab picks: copies the chosen candidate clip
over the live clip for each token in tools/sound_choices.json
(format: {"puh": "espeak", "ay": "piper-natural", ...}).
Run in CI after the lab exists; harmless to re-run.
"""

import json
import os
import shutil


def fnv(s):
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def main():
    if not os.path.exists("tools/sound_choices.json"):
        print("no tools/sound_choices.json - nothing to apply")
        return
    with open("tools/sound_choices.json") as f:
        choices = json.load(f)
    applied = 0
    for token, cand in choices.items():
        src = f"voices/lab/{token}__{cand}.ogg"
        if not os.path.exists(src):
            print(f"  {token}: {src} missing, skipped")
            continue
        shutil.copy(src, f"voices/{fnv(f'sound|{token}')}.ogg")
        applied += 1
        print(f"  {token} <- {cand}")
    print(f"done: {applied} applied")


if __name__ == "__main__":
    main()
