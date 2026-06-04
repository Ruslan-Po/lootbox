# Loot Box — Telegram WebApp

Single-page Telegram WebApp loot box. No framework, no bundler — native ES modules.

## Stack
- Vanilla JS (ES modules, `type="module"`)
- CSS (split by component, CSS custom properties)
- Cloudflare Workers (static assets)
- Telegram WebApp SDK

## Project structure

```
index.html              — HTML shell only (no inline JS/CSS)
styles/
  variables.css         — CSS custom properties (:root)
  base.css              — reset, layout, balance, button
  carousel.css          — key carousel
  chest.css             — chest wrap, states, shake animation
  modal.css             — prize modal
  responsive.css        — mobile breakpoints, prefers-reduced-motion
src/
  config.js             — TIERS data, CLONES constant
  state.js              — shared mutable state (balance, selectedIdx, isAnimating)
  telegram.js           — Telegram.WebApp.ready()
  balance.js            — animated coin counter (rAF easing)
  carousel.js           — infinite scroll carousel with real-time scale
  chest.js              — chest display state helpers (showIdle/showVideo/showOpenState)
  particles.js          — canvas emoji particle burst
  modal.js              — prize modal show/hide
  open-sequence.js      — chest open flow (shake → video → open state → modal)
  main.js               — entry point, wires all modules together
assets/
  chest/
    chest_base.png          — idle chest (transparent bg)
    chest_base_open.png     — open chest (transparent bg)
    chestanimation.webm     — opening animation (VP9, black bg, mix-blend-mode: screen)
  keys/
    iron.png
    bronze.png
    silver.png
    gold.png
    diamond.png
```

## Key decisions

**No bundler** — native `<script type="module">` works in all target browsers (Telegram WebView). Keeps deploy simple: just static files on Cloudflare Workers.

**Carousel** — 9 cards total (2 prepend clones + 5 real + 2 append clones). Scale/opacity computed from `scrollLeft` in real-time via `requestAnimationFrame`. Infinite jump uses `scrollend` event (instant) with 80ms debounce fallback.

**iOS video** — WebM/VP9 not supported on iOS Safari. Detected via `canPlayType`. Falls back to shake → open state instantly, skipping video.

**Performance** — key cards use `will-change: transform, opacity`. No `mix-blend-mode` on key images (breaks GPU compositing). Only chest video uses `mix-blend-mode: screen`.

## Deploy

Cloudflare Workers (auto-deploy on push to `main`).

```bash
git push origin main   # triggers Cloudflare build
```

Manual deploy:
```cmd
npx wrangler deploy
```

## Tier config (`src/config.js`)

| Tier    | Cost | Pool     | Key image        |
|---------|------|----------|------------------|
| Iron    | 50   | 1,2,3    | assets/keys/iron.png |
| Bronze  | 100  | 4,5,6    | assets/keys/bronze.png |
| Silver  | 200  | 7,8,9    | assets/keys/silver.png |
| Gold    | 400  | 10,11,12 | assets/keys/gold.png |
| Diamond | 800  | 13,14,15 | assets/keys/diamond.png |
