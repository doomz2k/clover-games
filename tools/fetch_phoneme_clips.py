"""Replace the synthesised isolated-phonic-sound clips with real human
phoneme recordings from Wikimedia Commons (the IPA audio used on Wikipedia's
phonetics articles, recorded by linguists and freely licensed).

TTS engines are unreliable for isolated sounds ("puh" can come out as "ph"),
so every sound-profile clip with a mapped recording below is fetched,
trimmed to its first utterance (the recordings often repeat the sound or
add an a-C-a context), normalised, and written over voices/<hash>.ogg -
the same fnv1a-32 `sound|<token>` hash the games look up. Tokens with no
good single recording (diphthongs, blends) keep their Piper clip.

Run by generate-voices.yml after render_voices.py. Requires ffmpeg.
Also writes voices/CREDITS.md attributing every recording.
"""

import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

# spoken token (as in SOUND_SPEECH / the manifest) -> Commons file candidates,
# first one that downloads wins. Sound value = the pure phoneme, no schwa.
TOKEN_SOURCES = {
    # continuants
    "sss": ["Voiceless alveolar sibilant.ogg"],                     # /s/  s ss
    "fff": ["Voiceless labiodental fricative.ogg"],                 # /f/  f ff
    "mmm": ["Bilabial nasal.ogg"],                                  # /m/
    "nnn": ["Alveolar nasal.ogg"],                                  # /n/
    "rrr": ["Alveolar approximant.ogg"],                            # /r/
    "lll": ["Alveolar lateral approximant.ogg"],                    # /l/  l ll
    "shh": ["Voiceless postalveolar fricative.ogg",
            "Voiceless palato-alveolar sibilant.ogg"],              # /sh/
    "thuh": ["Voiceless dental fricative.ogg"],                     # /th/
    "ing": ["Velar nasal.ogg"],                                     # /ng/
    "huh": ["Voiceless glottal fricative.ogg"],                     # /h/
    # stops + affricate
    "puh": ["Voiceless bilabial plosive.ogg"],                      # /p/
    "buh": ["Voiced bilabial plosive.ogg"],                         # /b/
    "tuh": ["Voiceless alveolar plosive.ogg"],                      # /t/
    "duh": ["Voiced alveolar plosive.ogg"],                         # /d/
    "kuh": ["Voiceless velar plosive.ogg"],                         # /k/ c k ck
    "guh": ["Voiced velar plosive.ogg",
            "Voiced velar plosive 02.ogg"],                         # /g/
    "chuh": ["Voiceless postalveolar affricate.ogg",
             "Voiceless palato-alveolar affricate.ogg"],            # /ch/
    # short vowels
    "a": ["Near-open front unrounded vowel.ogg"],                   # /æ/
    "eh": ["Open-mid front unrounded vowel.ogg"],                   # /e/
    "ih": ["Near-close near-front unrounded vowel.ogg"],            # /i/
    "o": ["Open back rounded vowel.ogg"],                           # /o/
    "uh": ["Open-mid back unrounded vowel.ogg"],                    # /u/
    # long vowels
    "ee": ["Close front unrounded vowel.ogg"],                      # /ee/
    "oo": ["Close back rounded vowel.ogg"],                         # /oo/
    "ar": ["Open back unrounded vowel.ogg"],                        # /ar/
    "or": ["Open-mid back rounded vowel.ogg"],                      # /or/
    "er": ["Open-mid central unrounded vowel.ogg"],                 # /ur/
    # kept on Piper (no single-phoneme recording works well):
    #   ay eye oh ow (diphthongs), ink kwuh (blends)
}

UA = {"User-Agent": "clover-games-voice-fetch/1.0 "
                    "(https://github.com/doomz2k/clover-games; educational)"}

# Commons rate-limits burst downloads hard; be a polite client.
DELAY_BETWEEN_FILES = 5
RETRIES = 4

# Records which tokens already hold a Commons recording so re-runs don't
# re-download (the clips themselves are committed alongside this file).
MARKER = "voices/phoneme_clips.json"
FORCE = "--force" in sys.argv


def fnv(s: str) -> str:
    h = 0x811C9DC5
    for ch in s:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return format(h, "08x")


def download(name: str, dest: str) -> bool:
    url = ("https://commons.wikimedia.org/wiki/Special:FilePath/"
           + urllib.parse.quote(name))
    for attempt in range(RETRIES):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r, \
                    open(dest, "wb") as f:
                f.write(r.read())
            return os.path.getsize(dest) > 1000
        except urllib.error.HTTPError as e:
            if e.code == 404:
                print(f"    {name}: 404 (does not exist)")
                return False
            wait = int(e.headers.get("Retry-After") or 0) or 20 * (2 ** attempt)
            print(f"    {name}: HTTP {e.code}, retrying in {wait}s")
            time.sleep(wait)
        except Exception as e:
            print(f"    {name}: {e}")
            time.sleep(10)
    return False


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def first_utterance_end(wav: str) -> float | None:
    """Recordings often say the sound twice or in an a-C-a frame; keep only
    the first burst: cut at the first inter-utterance silence."""
    p = run(["ffmpeg", "-i", wav, "-af",
             "silencedetect=noise=-32dB:d=0.15", "-f", "null", "-"])
    starts = [float(m) for m in
              re.findall(r"silence_start: ([0-9.]+)", p.stderr)]
    for t in starts:
        if t > 0.05:
            return t
    return None


def peak_gain(wav: str) -> float:
    p = run(["ffmpeg", "-i", wav, "-af", "volumedetect", "-f", "null", "-"])
    m = re.search(r"max_volume: (-?[0-9.]+) dB", p.stderr)
    return min(18.0, -2.0 - float(m.group(1))) if m else 0.0


def main():
    os.makedirs("voices", exist_ok=True)
    done = {}
    if os.path.exists(MARKER) and not FORCE:
        with open(MARKER) as f:
            done = json.load(f)
    credits, failed = [], []

    for token, candidates in TOKEN_SOURCES.items():
        out = f"voices/{fnv(f'sound|{token}')}.ogg"
        if token in done and os.path.exists(out):
            print(f"  {token}: already fetched ({done[token]})")
            credits.append((token, done[token]))
            continue
        src = None
        raw = f"/tmp/phon_raw_{fnv(token)}"
        for name in candidates:
            if download(name, raw):
                src = name
                break
            time.sleep(DELAY_BETWEEN_FILES)
        if not src:
            failed.append(token)
            print(f"  {token}: ALL SOURCES FAILED - keeping synthesised clip")
            continue

        wav = raw + ".wav"
        # strip leading silence during decode so cut times are sound-relative
        # (recordings often open with quiet, which used to break the trim)
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw,
             "-ar", "22050", "-ac", "1",
             "-af", "silenceremove=start_periods=1:start_threshold=-45dB",
             wav])

        cut = first_utterance_end(wav)
        gain = peak_gain(wav)
        # cap hard at 1.2s: these are single isolated sounds, and the source
        # recordings often continue into an "a-C-a" demonstration frame
        trim = ["-t", f"{min(cut + 0.05, 1.2):.3f}"] if cut else ["-t", "1.2"]
        # areverse/fade-in/areverse fades the tail without knowing the length
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, *trim,
             "-af", f"volume={gain:.1f}dB,"
                    f"areverse,afade=t=in:st=0:d=0.04,areverse,"
                    f"apad=pad_dur=0.05",
             "-c:a", "libvorbis", "-q:a", "3", out])

        dur = cut and f"{cut:.2f}s" or "full"
        print(f"  {token}: {src} (cut {dur}, gain {gain:+.1f}dB) -> {out}")
        credits.append((token, src))
        done[token] = src
        os.remove(raw)
        os.remove(wav)
        time.sleep(DELAY_BETWEEN_FILES)

    with open(MARKER, "w") as f:
        json.dump(done, f, indent=1, sort_keys=True)

    with open("voices/CREDITS.md", "w") as f:
        f.write("# Narration audio credits\n\n"
                "Sentence narration is synthesised with [Piper]"
                "(https://github.com/OHF-Voice/piper1-gpl) using the "
                "`en_GB-northern_english_male-medium` voice.\n\n"
                "The isolated phonic sounds are human phoneme recordings "
                "from Wikimedia Commons, used under their respective free "
                "licences:\n\n")
        for token, src in sorted(credits):
            page = ("https://commons.wikimedia.org/wiki/File:"
                    + urllib.parse.quote(src.replace(" ", "_")))
            f.write(f"- `{token}` - [{src}]({page})\n")

    print(f"done: {len(credits)} phoneme clips replaced, {len(failed)} failed")
    if failed:
        # exit 0 anyway: successes must still be committed, and the marker
        # file means the next run retries only what's missing
        print("FAILED TOKENS (kept synthesised, re-run to retry):",
              ", ".join(failed))


if __name__ == "__main__":
    main()
