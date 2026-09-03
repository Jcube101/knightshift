# Knightshift

Knightshift is a private, local-first chess improvement workspace. Play Stockfish inside the browser, save completed games locally, then build toward game analysis, recurring-mistake insights, and opening practice.

**Live app:** https://apps-knightshift.job-joseph.com/

## What works today

- Play complete games against Stockfish 18 Lite in the browser
- Choose a default side and difficulty in Settings for each new game
- Choose White or Black for an individual new game
- When playing Black, Stockfish makes the opening White move before input is enabled
- Three real engine levels: Casual, Steady, and Sharp
- Deliberate post-game Stockfish analysis with live per-move progress, durable resume, and 2–3 saved critical moments
- Saved reviews and proof-backed recurring-pattern signals on Home
- Broad opening explorer covering 13 major openings and named variations, including Scandinavian Defense for Black study
- Conservative opening context for saved games, derived locally from legal SAN history
- Mobile tap-to-move and desktop/mobile drag-to-move
- Completed games and active games saved in browser `localStorage`
- No account, backend, cloud engine, or game import required

## Design and experience

Knightshift uses the **Quiet Study × Training Lab** visual system: a dark, board-first private workspace with editorial typography and quiet, evidence-backed feedback. The fixed Quiet Study palette is product identity, not a selectable theme.

The information architecture is deliberately small:

- **Home** is the reflective study page: one next action, a latest lesson when available, one restrained pattern signal, and recent games.
- **Play** keeps the board dominant, with material and a touch-scrollable move strip above it. Side and difficulty controls remain compact.
- **Settings** holds durable new-game defaults.
- **Learn** is the opening-study workspace: a broad survey of opening families and named variations, with a board-backed move explorer. Its White/Black study selector is an accessible Quiet Study segmented control, with an explicit active state rather than browser-default buttons.
- **Home, Play, Learn, and Settings** are the primary navigation destinations. The full saved-game archive remains available at `/history` through **All saved games**.

The visible top row is intentional on mobile and desktop. Four stable workspaces remain comfortable to scan at phone width; a hamburger drawer would add friction and imply complexity the current app does not have. Read [`DESIGN.md`](./DESIGN.md) for the complete visual system, interaction rules, and decision rationale.

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

`src/lib/engine.ts` wraps Stockfish in a browser Worker. It completes the UCI `uci` → `uciok` → `isready` → `readyok` handshake before searching, which keeps Worker startup reliable on slower mobile browsers. The build script stages the Stockfish WASM assets from the npm package into `public/stockfish/`, then Vite copies them to `dist/stockfish/`.

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

Knightshift uses versioned browser-local storage. Completed games persist under `knightshift.completed-games`, while the current active-game checkpoint is stored under `knightshift.active-game`. Settings defaults persist separately under `knightshift.defaults`. The completed-game reader supports the legacy array format and writes version 1 envelopes going forward.

An active checkpoint captures the position, SAN/UCI history, player side, difficulty, and latest capture cue. It is restored after a browser reload. Settings defaults are applied only when no active checkpoint exists and a new game begins. Changing Settings never rewrites an active or completed game. The active checkpoint is cleared only when the player deliberately starts a new game or completes one; completed games remain saved.

Post-game reviews use a separate `knightshift.review-jobs` record. Each completed player-move evaluation is saved immediately. Home and History show the truthful saved-move count and return to Play for `Resume review`. A browser Worker cannot run after a tab closes, so the product promises resumption from saved work, not background execution. If the final player move ends the game, whether by checkmate, stalemate, or draw, Knightshift saves it without requesting an impossible post-game engine reply. When a review completes, Play remains open and offers `Open review`; it never redirects automatically.

Clearing site storage clears saved games, review jobs, the active checkpoint, and Settings defaults. Private Settings sign-in syncs completed games, review work, and Settings defaults across your own devices. Active games remain deliberately device-local and are never uploaded or pulled.

## Deployment

Build first, then deploy only the generated `dist/` directory:

```bash
npm run build
/opt/data/scripts/site_agent.py --json deploy knightshift /opt/projects/knightshift/dist
```

Do not deploy source files or a dirty working tree. Verify the live Vite bundle after deployment, not only `index.html`.

## Roadmap

1. Local repertoire saving from the opening explorer, then private cross-device sync for saved and hidden study items
2. Repertoire drilling, once saved opening content is real enough to deserve it
3. Deeper board-grounded review explanations, only where the engine evidence supports them

## Licensing

`react-chessboard` is MIT licensed. Stockfish is GPL-3.0. Knightshift ships the Stockfish notice and full GPL text with the production site. See `public/stockfish-notice.txt` and `public/stockfish/COPYING.txt` after a build.
