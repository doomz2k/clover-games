# Clover Games - Style Bible

Every visual, sound and motion decision in these games follows this sheet.
If new art or a new game doesn't match it, fix the art, not the sheet.

## Shape language
- Round everything. No sharp corners; joins and caps are always `round`.
- Characters are built from ellipses on a ~100-unit grid, then scaled.
- Silhouettes must read at 48px: one big shape + at most two accents.

## Line
- Universal outline colour: `0x1e1e46` (ink navy), never pure black.
- Outline weight: 4.5 units on the 100-unit grid (3.5 for small details).
- Backgrounds and glows are the only unlined elements.

## Colour
- Characters/props: HSL-derived triads - base (S 55-90, L 45-65),
  dark shade (+18 hue, L~35), light accent (-20 hue, L~70).
- UI gold: fill `#ffd75e`, border/shadow `#b8860b`. Ink `#4a3b2a` on paper
  `#fdf6e9` (hub); white/gold text on dark in-game.
- Eyes: white + ink pupil + white glint, always. Eyes are what make it cute.

## Type
- Display: Fredoka One. Body/captions: Quicksand 500/700. Never mix others.
- Emoji are allowed on the hub only, never inside the game canvas.

## Motion
- Entrances: pop-in with `outBack`, staggered 90-120ms per sibling.
- Feedback: correct answer = spotlight (others dim to 25% and shrink to
  92%), the answer pops 1.12x; wrong = short wobble, nothing punitive.
- Idle: everything alive breathes - 2-3px bob, blinks every 2-5s.
- Characters flap their mouths while narration is speaking.
- Durations: taps 120ms, reactions 250ms, celebrations <= 600ms.

## Sound
- Layer 1: sampled CC0 clips (Kenney packs, fetched by fetch-sfx.yml into
  /assets/sfx). Layer 2: the synthesised Web Audio fallback - never remove
  it; it covers first-load races and failed fetches.
- Narration: pre-rendered Piper clips + human phoneme recordings
  (see voices/CREDITS.md). Web Speech is the last-resort fallback.
- Music: generative pads + plucks per game (js/core/music.js), started on
  first tap. Everything respects the master mute (`cloverMuted`).
