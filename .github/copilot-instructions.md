# Project Guidelines — ziehsenGame

## Overview

This project is a game based on **Nim**. The board is a matrix of piles (columns); each
column is a pile of tokens. A move removes any positive number of tokens from **one** pile.
`amountOfZiehsen` is the size parameter (an N x N board).

The repo has two parts:

- **`calculations/`** — Node.js scripts and precomputed JSON data (game theory / optimal play).
  - `starters/N-*.json` = precomputed P-positions (CPU-advantageous positions).
  - `allOptions/*.json` = enumerated game states/options.
- **`ziehsenGameReact/`** — the playable web app (Vite + React 19, deployed to GitHub Pages).

## Build and Run (React app)

Always `cd ziehsenGameReact` first — running npm at the repo root creates stray
`package.json`/`node_modules` there.

- `npm install` — install dependencies
- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run lint` — lint with oxlint
- `npm run deploy` — build + publish to the `gh-pages` branch

## Architecture (React app)

- Routing uses `react-router-dom` with **`HashRouter`** (in `src/main.jsx`), chosen because
  GitHub Pages has no SPA fallback (BrowserRouter would 404 on refresh/deep-links).
- Routes in `src/App.jsx`: `/` Landing, `/settings` Settings, `/config` Config, `/game` Game.
  Page components live in `src/pages/`.
- Keep in-game turn state as **component state, not routes**, so the browser back button
  doesn't rewind moves.

## UI / UX

- **Mobile-first.** The game must be playable on both phones and desktop, but design and
  implement for **mobile first**, then progressively enhance for larger screens.
- Base layout, navigation, spacing, and typography on small screens; use CSS media queries /
  responsive breakpoints to adapt upward (min-width, not max-width).
- Prefer touch-friendly interactions: large tap targets, no hover-only controls, avoid tiny
  hit areas. Ensure controls work with both touch and mouse.
- Use fluid/responsive units (%, rem, vw/vh, clamp) over fixed pixel widths so the board and
  UI scale across screen sizes.
- **UI text is in German** unless explicitly stated otherwise. Code (identifiers, comments,
  commit messages) stays in English.

## Deployment

- Vite `base` auto-detects `GITHUB_REPOSITORY`, falling back to `/ziehsenGame/` for builds.
- Two options: manual `npm run deploy` (gh-pages branch), or the GitHub Actions workflow at
  `.github/workflows/deploy-pages.yml` (needs Pages Source set to "GitHub Actions").

## Conventions

- ES modules (`"type": "module"`).
- Prefer small, focused changes; don't refactor unrelated code.
