# Knightshift contributor guide

This file is the working contract for humans and coding agents modifying Knightshift.

## Product boundary

Knightshift is a private, local-first chess improvement tool, not a Chess.com clone.

Current scope:

- In-browser games against Stockfish
- White and Black play
- Browser-local completed-game storage
- Mobile-first board interaction

Planned, not yet built:

- Post-game analysis and mistake explanations
- Recurring-mistake insights
- Opening explorer and repertoire training

Do not add accounts, cloud sync, PGN import, social features, or external chess-platform integration unless explicitly requested.

## Core technical rules

1. **`chess.js` is the rules authority.** Validate every user and engine move through it.
2. **Stockfish is the engine authority.** Never replace it with `moves()[0]`, a heuristic move picker, or decorative difficulty controls.
3. **The selected side is game state.** White/Black choice must control board orientation, input ownership, terminal-result attribution, and who makes the first engine move.
4. **The canonical game position owns piece identity.** Do not trust `react-chessboard` callback piece data during animations or touch transitions.
5. **Mobile interactions are release-critical.** Preserve both tap-to-move and drag-to-move. A successful drag must not leave its destination selected by a trailing tap.
6. **Keep browser persistence local.** Current completed-game data lives in `localStorage` under `knightshift.completed-games`.

## Key files

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Game UI, player side, input coordination, engine turn orchestration |
| `src/lib/game.ts` | `chess.js` state, legal move application, game outcome |
| `src/lib/engine.ts` | Stockfish Worker wrapper and UCI best-move parsing |
| `src/lib/tapMove.ts` | Tap-selection state transition |
| `src/lib/tapGuard.ts` | Suppresses one post-drop trailing tap |
| `src/lib/storage.ts` | Completed-game `localStorage` persistence |
| `scripts/stage-stockfish.mjs` | Stages WASM and GPL assets into `public/stockfish/` |
| `e2e/mobile-tap.spec.ts` | Real mobile-emulated browser smoke test |
| `playwright.config.ts` | Local Vite server and mobile Chromium setup |

## Required workflow

Use test-driven development for behavior changes and bug fixes:

1. Add a focused failing regression test.
2. Run it and observe the expected failure.
3. Implement the smallest correct change.
4. Run the focused test, then the full checks.

Required checks before a commit:

```bash
npm run test:e2e
npm test
npm run build
npm run lint
```

Install local Chromium once when needed:

```bash
PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npx playwright install chromium
```

## Playwright and Git

Track test source and the `@playwright/test` development dependency. Do not track generated browser or test output. `.gitignore` must keep these ignored:

- `.playwright-browsers/`
- `playwright-report/`
- `test-results/`
- `blob-report/`
- `node_modules/`
- `dist/`

## Git and deployment

- Pull before editing shared project work.
- Commit readable, scoped changes.
- Do not force-push or rewrite published history.
- Do not push or deploy without explicit approval from Job.
- Build fresh before deployment.
- Deploy only `/opt/projects/knightshift/dist`.
- Verify live hashed JavaScript assets after deployment, not just the HTML shell.

## Licensing

Keep the Stockfish GPL notice and source pointer in the shipped site. Do not replace `react-chessboard` with GPL-licensed chessground without an explicit licensing decision for the whole public project.
