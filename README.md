# Knightshift

Knightshift is a private, local-first chess improvement workspace. Play Stockfish inside the browser, save completed games locally, then build toward game analysis, recurring-mistake insights, and opening practice.

**Live app:** https://apps-knightshift.job-joseph.com/

## What works today

- Play complete games against Stockfish 18 Lite in the browser
- Choose to play White or Black
- When playing Black, Stockfish makes the opening White move before input is enabled
- Three real engine levels: Casual, Steady, and Sharp
- Mobile tap-to-move and desktop/mobile drag-to-move
- Completed games saved in browser `localStorage`
- No account, backend, cloud engine, or game import required

## Stack

- React 19, TypeScript, Vite
- `react-chessboard` for board rendering, MIT licensed
- `chess.js` for legal move validation, FEN, SAN, and UCI history
- Stockfish 18 Lite single-thread WASM, running in a Web Worker
- Vitest for unit tests
- Playwright for real mobile-emulated browser coverage

## Local development

```bash
npm install
npm run dev
```

The Vite server defaults to `http://localhost:5173`.

### Tests and checks

```bash
npm test
npm run test:e2e
npm run build
npm run lint
```

Playwright needs Chromium once per machine. The repository intentionally does not contain browser binaries:

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e
```

`.playwright-browsers/`, Playwright reports, test artifacts, `node_modules/`, and `dist/` are ignored by Git.

## Architecture

### Game state

`src/lib/game.ts` is the rules authority. It stores:

- FEN
- SAN history, for display and persistence
- UCI history, for Stockfish

All player and engine moves are validated through `chess.js`. Do not invent engine moves locally or choose from legal moves heuristically.

### Engine

`src/lib/engine.ts` wraps Stockfish in a browser Worker. The build script stages the Stockfish WASM assets from the npm package into `public/stockfish/`, then Vite copies them to `dist/stockfish/`.

Difficulty maps to actual engine settings:

| Level | Skill level | Search budget |
| --- | ---: | ---: |
| Casual | 3 | 2,000 nodes |
| Steady | 8 | 8,000 nodes |
| Sharp | 14 | 25,000 nodes |

### Board input

Knightshift supports two independent browser interaction paths:

- **Tap:** select one of the player’s pieces, then tap a destination.
- **Drag:** move a piece directly to its destination.

Ownership always comes from the canonical `chess.js` position, not a transient callback payload from the board library. Empty and opponent squares do not become selection sources. A short guard consumes the one trailing tap that mobile browsers can emit after a drag-drop, preventing the destination square from becoming accidentally selected.

### Storage

Completed games are saved only in the browser under:

```text
knightshift.completed-games
```

Clearing site storage clears saved games. There is no sync or account system yet.

## Deployment

Build first, then deploy only the generated `dist/` directory:

```bash
npm run build
/opt/data/scripts/site_agent.py --json deploy knightshift /opt/projects/knightshift/dist
```

Do not deploy source files or a dirty working tree. Verify the live Vite bundle after deployment, not only `index.html`.

## Roadmap

1. Lightweight post-game Stockfish analysis and concise mistake explanations
2. Saved-game views and recurring-mistake insights
3. Opening explorer and repertoire saving

## Licensing

`react-chessboard` is MIT licensed. Stockfish is GPL-3.0. Knightshift ships the Stockfish notice and full GPL text with the production site. See `public/stockfish-notice.txt` and `public/stockfish/COPYING.txt` after a build.
