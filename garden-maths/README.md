# Garden Maths

A dice-driven maths minigame: the child is a garden keeper, growing three
flowers per season from seed to full bloom by solving sums rolled on dice.
Each operation gives a different kind of care — addition brings sunlight,
subtraction brings water, multiplication brings nutrients — and wrong
answers breed pests that attack the garden at the end of each round.
Division appears only as an optional pest-clearing bonus question.

Built on the same engine patterns as the other Clover Games: PixiJS v8 via
CDN (vendored fallback in `../vendor/`), no build step, everything drawn
procedurally or from inline SVG.

## Running it

```bash
cd ..            # repo root
python3 -m http.server 8000
# open http://localhost:8000/garden-maths/
```

## Seasons

| # | Season | Dice | Operations |
|---|---|---|---|
| 1 | Spring | D6 | addition |
| 2 | Early Summer | D6 D8 | + subtraction |
| 3 | High Summer | D6 D8 | (+ optional division pest bonus) |
| 4 | Late Summer | D8 D10 | addition, subtraction |
| 5 | Autumn | D8 D10 (+D4) | + multiplication (D4 keeps it small) |
| 6 | Harvest | D6 D8 D10 (+D4) | all of the above, frequent pest bonuses |

A season is 3 plants × 4 growth stages; each stage needs one care of every
operation in play. Rounds end with a pest check: 0-1 pests scurry off,
2-3 wilt one plant back a stage, 4-5 hit two plants (one doubly). Three
stars need all three blooms with zero pest damage — that unlocks the next
season. Progress lives in localStorage under `gardenMaths_progress`.

## Structure

Mirrors the other games (see `space-phonics/README.md` for the engine
layout). Garden-specific pieces: `gen/plantGenerator.js` (3 flower families
× 4 growth stages, hue-colourable), `gen/diceGenerator.js` (D4/D6/D8/D10
with tumble animation), `gen/bugGenerator.js` (pests + ladybird),
`core/ui.js#makeGarden` (time-of-day sky, hills, soil, swaying grass) and
the `GardenScene` state machine (idle → rolling → answering → feedback →
pest check → next round).
