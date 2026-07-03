# clover-games

A collection of educational minigames for kids, tied together by a cosy
storybook hub page (`index.html` at the repo root).

## Games

| Game | Subject | Tech |
|---|---|---|
| [Space Phonics](space-phonics/) | Letters & phonics (Letters and Sounds progression) | PixiJS v8, no build step |
| [Deep Sea Numbers](deep-sea-numbers/) | Numbers & counting (count → compare → add/subtract) | PixiJS v8, no build step |
| [Garden Maths](garden-maths/) | Dice-rolled sums grow a garden; wrong answers breed pests | PixiJS v8, no build step |

## Running

Everything is a static site — serve the repo root over HTTP and open the hub:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

PixiJS loads from the jsDelivr CDN with a shared vendored fallback in
`vendor/pixi.min.js`. Progress is stored per-game in `localStorage`.

## Testing

Headless Chromium renders via SwiftShader at a few FPS, so drive end-to-end
tests off game state (`window.__game.scenes.current`) rather than fixed
timings. Both games expose the same scene/state shape for this.
