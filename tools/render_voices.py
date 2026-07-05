"""Render every entry in voices/manifest.json to an .ogg clip with Piper.

Run by .github/workflows/generate-voices.yml (needs piper-tts + ffmpeg and
a downloaded voice model). Idempotent: existing clips are kept unless
--force is passed.

Profiles:
  narrator - as-is
  sound    - stretched (length_scale) so phonic sounds are slow and clear
  alien    - pitched up and quickened with ffmpeg so characters sound weird
"""

import json
import os
import subprocess
import sys
import wave

from piper import PiperVoice, SynthesisConfig

VOICE_PATH = os.environ.get("PIPER_VOICE", "en_GB-cori-high.onnx")
FORCE = "--force" in sys.argv

PROFILE_SETTINGS = {
    "narrator": {"length_scale": 1.05},
    "sound": {"length_scale": 1.7},
    "alien": {"length_scale": 0.95},
}

# alien: shift the formants/pitch up ~35% then restore duration
ALIEN_FILTER = "asetrate=22050*1.26,aresample=22050,atempo=0.95"


def main():
    with open("voices/manifest.json") as f:
        manifest = json.load(f)

    voice = PiperVoice.load(VOICE_PATH)
    os.makedirs("voices", exist_ok=True)

    made = skipped = 0
    for key, entry in manifest.items():
        out_path = f"voices/{key}.ogg"
        if os.path.exists(out_path) and not FORCE:
            skipped += 1
            continue
        text = entry["t"]
        profile = entry.get("p", "narrator")
        settings = PROFILE_SETTINGS.get(profile, PROFILE_SETTINGS["narrator"])

        tmp_wav = f"/tmp/{key}.wav"
        syn_config = SynthesisConfig(length_scale=settings["length_scale"])
        with wave.open(tmp_wav, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file, syn_config=syn_config)

        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp_wav]
        if profile == "alien":
            cmd += ["-af", ALIEN_FILTER]
        cmd += ["-c:a", "libvorbis", "-q:a", "3", out_path]
        subprocess.run(cmd, check=True)
        os.remove(tmp_wav)
        made += 1
        if made % 100 == 0:
            print(f"  rendered {made} clips...")

    print(f"done: {made} rendered, {skipped} already existed")


if __name__ == "__main__":
    main()
