"""Render narration clips with ElevenLabs instead of Piper.

Reads voices/manifest.json and renders every narrator/alien line to
voices/<hash>.ogg - the exact files the games already look up, so nothing
client-side changes. Isolated phonic sounds ('sound' profile) are NOT
re-rendered here: they're managed by the Sound Lab picks and human
recordings. Instead, --sound-lab renders an 'elevenlabs' candidate for
each phonic token into voices/lab/ so the operator can audition it.

Env (set as GitHub Actions secrets/variables, never committed):
  ELEVENLABS_API_KEY   required
  ELEVENLABS_VOICE_ID  required - a voice from your VoiceLab
  ELEVENLABS_MODEL     optional, default eleven_multilingual_v2

Flags: --force (re-render existing), --sound-lab (also build lab candidates)

Cost note: the full manifest is ~1,650 lines / ~75k characters. Existing
clips are skipped unless --force, so re-runs only pay for new lines.
"""

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID")
MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_multilingual_v2")
FORCE = "--force" in sys.argv
SOUND_LAB = "--sound-lab" in sys.argv

# characters still get their otherworldly pitch shift, applied on top of
# whatever voice you chose (same filter the Piper pipeline used)
ALIEN_FILTER = "asetrate=44100*1.26,aresample=44100,atempo=0.95"

VOICE_SETTINGS = {
    "stability": 0.45,          # lower = more expressive
    "similarity_boost": 0.75,
    "style": 0.35,
    "use_speaker_boost": True,
}


def synth(text, dest_mp3):
    url = (f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
           "?output_format=mp3_44100_128")
    body = json.dumps({
        "text": text,
        "model_id": MODEL,
        "voice_settings": VOICE_SETTINGS,
    }).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, data=body, headers={
                "xi-api-key": API_KEY,
                "Content-Type": "application/json",
            })
            with urllib.request.urlopen(req, timeout=120) as r, \
                    open(dest_mp3, "wb") as f:
                f.write(r.read())
            return True
        except urllib.error.HTTPError as e:
            detail = e.read()[:200]
            if e.code in (401, 403):
                sys.exit(f"ElevenLabs auth failed ({e.code}): {detail} - "
                         "check the ELEVENLABS_API_KEY secret")
            if e.code == 422:
                print(f"    rejected ({detail}), skipping")
                return False
            wait = 10 * (2 ** attempt)  # 429 / 5xx: back off
            print(f"    HTTP {e.code}, retrying in {wait}s")
            time.sleep(wait)
        except Exception as e:
            print(f"    {e}, retrying in 10s")
            time.sleep(10)
    return False


def to_ogg(src, dest, alien=False):
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", src]
    if alien:
        cmd += ["-af", ALIEN_FILTER]
    cmd += ["-ac", "1", "-c:a", "libvorbis", "-q:a", "3", dest]
    subprocess.run(cmd, check=True)


def main():
    if not API_KEY or not VOICE_ID:
        sys.exit("ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID must be set "
                 "(repo Settings -> Secrets and variables -> Actions)")

    with open("voices/manifest.json") as f:
        manifest = json.load(f)

    made = skipped = failed = chars = 0
    for h, entry in manifest.items():
        profile = entry.get("p", "narrator")
        if profile == "sound":
            continue  # phonic sounds are managed by the Sound Lab picks
        out = f"voices/{h}.ogg"
        if os.path.exists(out) and not FORCE:
            skipped += 1
            continue
        tmp = f"/tmp/el_{h}.mp3"
        if not synth(entry["t"], tmp):
            failed += 1
            continue
        to_ogg(tmp, out, alien=(profile == "alien"))
        os.remove(tmp)
        made += 1
        chars += len(entry["t"])
        if made % 50 == 0:
            print(f"  {made} rendered ({chars} characters used so far)...")
        time.sleep(0.35)  # polite pacing under concurrency limits

    print(f"lines: {made} rendered, {skipped} kept, {failed} failed, "
          f"~{chars} characters of quota used")

    if SOUND_LAB:
        tokens = {e["t"] for e in manifest.values() if e.get("p") == "sound"}
        lab_path = "voices/lab/manifest.json"
        lab = json.load(open(lab_path)) if os.path.exists(lab_path) else {}
        os.makedirs("voices/lab", exist_ok=True)
        added = 0
        for token in sorted(tokens):
            tmp = f"/tmp/el_lab_{added}.mp3"
            if not synth(token, tmp):
                continue
            to_ogg(tmp, f"voices/lab/{token}__elevenlabs.ogg")
            os.remove(tmp)
            if token in lab and "elevenlabs" not in lab[token]:
                lab[token].append("elevenlabs")
            lab.setdefault(token, ["elevenlabs"])
            added += 1
            time.sleep(0.35)
        with open(lab_path, "w") as f:
            json.dump(lab, f, indent=1, sort_keys=True)
        print(f"sound lab: {added} elevenlabs candidates added")


if __name__ == "__main__":
    main()
