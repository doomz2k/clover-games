# Space Phonics

A letters & phonics minigame: the child is a space delivery pilot, flying to
procedurally generated planets and loading cargo onto their ship by answering
phonics questions. A perfect run (all 10 first try) launches the delivery and
unlocks the next planet.

## Running it

The game is a static site with no build step. Serve the folder over HTTP
(ES modules don't load from `file://`):

```bash
cd space-phonics
python3 -m http.server 8000
# open http://localhost:8000
```

PixiJS v8 loads from the jsDelivr CDN, with a vendored copy in `vendor/`
as an automatic offline fallback.

## Structure

```
index.html              outer shell: loading screen, back-to-hub button
vendor/pixi.min.js      PixiJS v8 fallback (CDN is primary)
js/
  main.js               boot: font + texture preload, scene manager startup
  core/
    sceneManager.js     1280x800 logical stage, letterbox scaling, fades
    assets.js           SVG -> texture preloading (all art is inline SVG)
    tween.js            minimal promise-based tween engine on the PIXI ticker
    particles.js        object-pooled bursts / thruster trails / confetti
    audio.js            Web Audio sound effects (all synthesised, no files)
    speech.js           Web Speech narration (en-GB), graceful no-op fallback
    progress.js         localStorage progress (spacephonics_progress)
    cargoShip.js        the delivery ship + 10 cargo bays
    ui.js               text/button/card kit + parallax starfield
    util.js             seeded RNG (mulberry32) + array helpers
  gen/
    planetGenerator.js  seed -> animated planet (palette, craters, rings...)
    alienGenerator.js   seed -> friendly alien (eyes, limbs, moods, dances)
  data/
    planets.js          the 13 planets and their phonics content
    words.js            word bank with grapheme metadata
    questions.js        builds each 10-question session
    svgPictures1/2.js   hand-drawn picture cards (~80 illustrations)
    svgUI.js            ship, crate, star, lock, sound icon
  scenes/
    mapScene.js         scrollable universe map
    introScene.js       alien greeting + ship landing
    questionScene.js    the 10-question round
    completionScene.js  launch cutscene, celebration, star rating
```

## Phonics progression

Follows the Letters and Sounds / Read Write Inc order across 13 planets:
single letters (s a t p → i n m d → g o c k → ck e u r → h b f ff l ll ss),
consonant digraphs (sh ch th → ng nk qu), vowel digraphs (ai ee igh →
oa oo ar → or ur ow), then word reading (CVC → CVCC/CCVC → 5-letter words).
Questions draw cumulatively from every planet unlocked so far.

## Testing notes

Headless Chromium renders via SwiftShader at a few FPS, so drive tests off
game state (`window.__game.scenes.current`) rather than fixed timings.
