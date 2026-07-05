# Morse — learn, play, decode

A small, minimalist Morse code app with three modes: **Learn**, **Play**, and **Quiz**. Built with plain HTML, CSS, and JavaScript — no frameworks, no build step, no dependencies.

## Features

**Learn**
A grid of flip tiles for every letter (A–Z) and digit (0–9). Tap a tile and it flips to reveal its Morse pattern while playing the actual tone.

**Play**
Type any word or phrase and either:
- **Audio** — hear it played back as real Morse beeps (correct dot/dash/gap timing), or
- **Visual** — see it rendered as dots and dashes, grouped by letter.

Each mode has a button to instantly re-render the same input in the other mode.

**Quiz**
A random word is presented in Morse (audio or visual, your choice) and you type your guess. Score is tracked as `correct / total` for the session, with instant feedback after each guess.

## Files

```
index.html     structure for all three screens
styles.css     orange/ivory design system, layout, animations
script.js      Morse map, Web Audio playback engine, all app logic
```

Everything is self-contained across these three files — open `index.html` and the whole app runs.

## Running it

No installation needed. Either:

- Double-click `index.html` to open it directly in a browser, or
- Serve the folder locally for the most reliable experience (some browsers restrict certain features on `file://` pages):
  ```bash
  npx serve .
  # or
  python3 -m http.server
  ```
  then visit the printed `localhost` address.

## How the audio works

Morse timing follows the standard ratio, built around one **unit** (`UNIT_MS = 70ms` in `script.js`):

| Element | Length |
|---|---|
| Dot | 1 unit |
| Dash | 3 units |
| Gap between symbols in a letter | 1 unit |
| Gap between letters | 3 units |
| Gap between words | 7 units |

Tones are generated live with the Web Audio API (a 620Hz sine wave) — nothing is pre-recorded. Because browsers block audio until a user interacts with the page, the very first tap/click of any "play" button is what unlocks sound; after that it plays freely.

## Customizing

- **Timing/pitch** — change `UNIT_MS` or the oscillator `frequency` value in `script.js`.
- **Quiz word list** — edit the `WORD_BANK` array in `script.js`.
- **Colors** — all colors are CSS variables at the top of `styles.css` (`--orange`, `--bg`, `--ink`, etc.), so the whole palette can be swapped in one place.
- **Fonts** — Fraunces (headlines), Work Sans (body), and JetBrains Mono (Morse symbols) are pulled from Google Fonts in the first line of `styles.css`.

## Browser support

Works in any modern browser with Web Audio API support (Chrome, Firefox, Safari, Edge — all current versions). No Internet Explorer support.

## License

Do whatever you'd like with this — it's yours to build on.
