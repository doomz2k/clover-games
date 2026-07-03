# Deep Sea Numbers

A numbers & counting minigame: the child pilots a little yellow submarine
down through twelve ocean depths, helping the sea creature at each reef
collect ten pearls by answering number questions. A perfect run (all 10
first try) unlocks the next, darker depth.

Built on the same engine patterns as Space Phonics: PixiJS v8 via CDN
(vendored fallback in `../vendor/`), no build step, all art is inline SVG
or procedurally generated.

## Running it

```bash
cd ..            # repo root
python3 -m http.server 8000
# open http://localhost:8000/deep-sea-numbers/
```

## Maths progression (12 depths)

| # | Depth | Focus |
|---|---|---|
| 1 | Rock Pool Shallows | Counting 1-3 |
| 2 | Seagrass Meadow | Counting & matching 1-5 |
| 3 | Bubble Reef | Counting & matching 1-10 |
| 4 | The Kelp Forest | One more (within 5) |
| 5 | Coral Gardens | One less (within 5) |
| 6 | The Shimmer Caves | One more / one less (within 10) |
| 7 | Starfish Point | Which group has the most? |
| 8 | The Twilight Zone | Which group has the fewest? |
| 9 | Pearl Valley | Addition within 5 |
| 10 | The Sunken Ship | Addition within 10 |
| 11 | Ink Deep | Subtraction within 5 |
| 12 | The Midnight Trench | Subtraction within 10 |

Sessions mix ~7 focus questions with ~3 review questions from earlier
depths. Subtraction is shown concretely: the taken-away objects appear
ghosted with a cross.

## Structure

Mirrors `space-phonics/` (see its README for the engine layout). Sea-specific
pieces: `gen/creatureGenerator.js` (seeded friendly fish), `gen/reefGenerator.js`
(seeded coral clusters), `core/pearlRack.js` (chest + 10 pearl slots),
`core/ui.js#makeOcean` (vertical-parallax water, bubbles, light rays), and a
vertically scrolling dive map. Progress lives in localStorage under
`deepseanumbers_progress`. The water gets progressively darker with depth.
