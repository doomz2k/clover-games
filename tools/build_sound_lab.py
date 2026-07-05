"""Build the phonic Sound Lab: several candidate renderings of every
isolated phonic sound, so a human can audition them on /sound-lab.html and
pick the set the game should use.

Candidates per token:
  piper-slow    - Piper, length_scale 1.7 (what shipped first)
  piper-natural - Piper, length_scale 1.1
  espeak        - espeak-ng speaking the raw IPA phoneme (guaranteed to be
                  the right sound; robotic timbre)
  human         - the trimmed Wikimedia Commons recording, if fetched

Writes voices/lab/<token>__<candidate>.ogg + voices/lab/manifest.json.
Run by sound-lab.yml (needs piper-tts, espeak-ng, ffmpeg, internet).
"""

import json
import os
import subprocess
import wave

from piper import PiperVoice, SynthesisConfig

VOICE_PATH = os.environ.get("PIPER_VOICE", "en_GB-cori-high.onnx")

# token -> espeak Kirshenbaum phoneme string (en-GB)
ESPEAK = {
    "sss": "s", "a": "a", "tuh": "t", "puh": "p", "ih": "I", "nnn": "n",
    "mmm": "m", "duh": "d", "guh": "g", "o": "0", "kuh": "k", "eh": "E",
    "uh": "V", "rrr": "r", "huh": "h", "buh": "b", "fff": "f", "lll": "l",
    "shh": "S", "chuh": "tS", "thuh": "T", "ing": "N", "ink": "Nk",
    "kwuh": "kw", "ay": "eI", "ee": "i:", "eye": "aI", "oh": "@U",
    "oo": "u:", "ar": "A:", "or": "O:", "er": "3:", "ow": "aU",
}


# Stop consonants can't be spelled reliably ("puh" gets read as a word and
# comes out wrong). These get two extra candidates rendered from raw
# phonemes: the exact consonant plus a tiny schwa release, the way phonics
# teachers say it.
STOP_RELEASE = {
    "puh": "p", "buh": "b", "tuh": "t", "duh": "d", "kuh": "k",
    "guh": "g", "chuh": "tS", "kwuh": "kw", "huh": "h",
}


def fnv(s):
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def to_ogg(src, dest, gain_db=0.0):
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", src,
         "-af", f"volume={gain_db}dB", "-ac", "1",
         "-c:a", "libvorbis", "-q:a", "3", dest], check=True)


def main():
    os.makedirs("voices/lab", exist_ok=True)
    voice = PiperVoice.load(VOICE_PATH)
    manifest = {}

    for token, phoneme in ESPEAK.items():
        cands = []

        for name, scale in [("piper-slow", 1.7), ("piper-natural", 1.1)]:
            tmp = f"/tmp/lab_{token}_{name}.wav"
            with wave.open(tmp, "wb") as w:
                voice.synthesize_wav(token, w, syn_config=SynthesisConfig(length_scale=scale))
            to_ogg(tmp, f"voices/lab/{token}__{name}.ogg")
            os.remove(tmp)
            cands.append(name)

        tmp = f"/tmp/lab_{token}_espeak.wav"
        r = subprocess.run(
            ["espeak-ng", "-v", "en-gb+f3", "-s", "95", "-w", tmp, f"[[{phoneme}]]"])
        if r.returncode == 0 and os.path.getsize(tmp) > 1000:
            to_ogg(tmp, f"voices/lab/{token}__espeak.ogg", gain_db=3)
            cands.append("espeak")
        if os.path.exists(tmp):
            os.remove(tmp)

        if token in STOP_RELEASE:
            ph = STOP_RELEASE[token] + "@"
            # exact phoneme + schwa release via espeak (accurate, audible)
            tmp = f"/tmp/lab_{token}_espeakuh.wav"
            r = subprocess.run(
                ["espeak-ng", "-v", "en-gb+f3", "-s", "95", "-w", tmp, f"[[{ph}]]"])
            if r.returncode == 0 and os.path.getsize(tmp) > 1000:
                to_ogg(tmp, f"voices/lab/{token}__espeak-uh.ogg", gain_db=3)
                cands.append("espeak-uh")
            if os.path.exists(tmp):
                os.remove(tmp)
            # the neural narrator speaking the same raw phonemes (espeak's
            # [[..]] notation passes through Piper's phonemizer)
            tmp = f"/tmp/lab_{token}_piperuh.wav"
            try:
                with wave.open(tmp, "wb") as w:
                    voice.synthesize_wav(f"[[{ph}]]", w,
                                         syn_config=SynthesisConfig(length_scale=1.3))
                if os.path.getsize(tmp) > 1000:
                    to_ogg(tmp, f"voices/lab/{token}__piper-uh.ogg")
                    cands.append("piper-uh")
            except Exception as e:
                print(f"  {token}: piper-uh failed ({e})")
            if os.path.exists(tmp):
                os.remove(tmp)

        # the shipped clip (currently the trimmed human recording where one
        # exists, otherwise piper-slow) - lets the lab compare "what's live"
        live = f"voices/{fnv(f'sound|{token}')}.ogg"
        if os.path.exists(live):
            subprocess.run(["cp", live, f"voices/lab/{token}__live.ogg"], check=True)
            cands.append("live")

        manifest[token] = cands
        print(f"{token}: {', '.join(cands)}")

    with open("voices/lab/manifest.json", "w") as f:
        json.dump(manifest, f, indent=1, sort_keys=True)
    print(f"done: {len(manifest)} tokens")


if __name__ == "__main__":
    main()
