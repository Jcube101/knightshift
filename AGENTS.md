# Knightshift contributor guide

This file is the working contract for humans and coding agents modifying Knightshift.

## Product boundary

Knightshift is a private, local-first chess improvement tool, not a Chess.com clone.

Current scope:

- In-browser games against Stockfish
- White and Black play, with Settings defaults applied only when starting a new game
- Browser-local active-game and completed-game storage
- Deliberate post-game analysis, saved review moments, and proof-backed recurring insights
- Broad opening explorer with named variations
- Conservative opening context for saved completed games and reviews
- Mobile-first board interaction

Planned, not yet built:

- Local repertoire saving and drilling

Do not add accounts, cloud sync, PGN import, social features, or external chess-platform integration unless explicitly requested.

## Design specification

`DESIGN.md` is the live visual and experience specification for Knightshift. Read it before changing UI, layout, route hierarchy, navigation, typography, colour, component treatment, or mobile interaction hierarchy.

- Treat its product-specific decisions as authoritative over generic frontend conventions.
- If a proposed interface or behavior conflicts with the spec, flag the conflict rather than silently choosing a side.
- For an approved visual or information-architecture decision, update `DESIGN.md` before implementation, including the rationale in **Decisions & Reasoning**.
- Run `npx -y @google/design.md lint DESIGN.md --format json` after editing it, and perform rendered mobile and desktop visual QA for visible changes.
- Do not turn Home into a performance dashboard, add a hamburger drawer at the current scope, or expand the primary navigation beyond Home, Play, Learn, and Settings without an explicit product decision.

## Core technical rules

1. **`chess.js` is the rules authority.** Validate every user and engine move through it.
2. **Stockfish is the engine authority.** Never replace it with `moves()[0]`, a heuristic move picker, or decorative difficulty controls.
3. **The selected side is game state.** White/Black choice must control board orientation, input ownership, terminal-result attribution, and who makes the first engine move.
4. **The canonical game position owns piece identity.** Do not trust `react-chessboard` callback piece data during animations or touch transitions.
5. **Mobile interactions are release-critical.** Preserve both tap-to-move and drag-to-move. A successful drag must not leave its destination selected by a trailing tap.
6. **Keep browser persistence local and versioned.** Completed games live under `knightshift.completed-games`; the reload-safe active-game checkpoint lives under `knightshift.active-game`. Preserve legacy completed-game reads when evolving this schema.
7. **Settings defaults configure only a fresh game.** Read validated `knightshift.defaults` values when no active checkpoint exists. Never overwrite an active game’s side or difficulty after it has begun.
8. **Treat Stockfish startup as asynchronous UCI.** Wait for `uciok`, then `readyok`, before issuing `position` or `go`; start search timeouts only after readiness.
9. **Initial engine actions must be idempotent per Worker.** React effects can be mounted, cleaned up, and rerun. Tie a Black-default opening to its specific live `StockfishEngine` instance, not a Boolean or changing game state. Cancel writes from discarded Workers, and never request a second opening after the first move updates game state.
10. **Exercise default-driven Black startup in a browser test.** A regression test must set `knightshift.defaults` to Black at Steady, wait for one opening move, and assert the status is `Your move as Black.`. A nonempty move log alone is insufficient.
11. **Opening context describes, it does not diagnose.** Use the maintained local classifier to name a direct legal SAN prefix; never invent a name or variation. A result alone never indicates opening quality. When analysis exists, describe the earliest critical moment only as during or after the recognised line, never with a fixed phase cutoff or causal claim.
12. **Reset opening-study state at the correct boundary.** A variation change resets its board to move zero. Switching to a different opening must also reset both the selected variation and move position, even though React retains the Learn route component between parameter changes. Cover that navigation transition with a component regression test.
13. **Study-side selection is a Quiet Study control, not browser chrome.** Use an accessible pressed-state segmented control. The active choice must have a non-color-only programmatic state and moss treatment; inactive choices use the raised surface, divider border, parchment text, and the standard 6px radius with at least 42px touch height. Verify it at mobile and desktop widths.

14. **Post-game review progress is durable and truthful.** Save each completed player-move evaluation under `knightshift.review-jobs`; deduplicate by move index before resuming. Show a live `Analyzing N of total moves` count, never a fake estimate. A Worker cannot outlive a closed tab, so offer Resume review from saved work rather than promising background execution. If a final player move produces checkmate, stalemate, or a draw, save it without a post-game engine search. On completion, keep the player in Play and offer `Open review`; do not redirect automatically.

## Key files

| Path | Purpose |
| --- | --- |
| `src/App.tsx` | Routed application shell, Home study dashboard, Settings UI |
| `src/screens/PlayScreen.tsx` | Game UI, player side, input coordination, engine turn orchestration |
| `src/lib/defaults.ts` | Validated Settings defaults for fresh games |
| `src/lib/openings.ts` | Curated opening families, names, ECO data, and legal SAN lines |
| `src/screens/LearnScreen.tsx` | Board-first opening survey and variation explorer |
| `src/lib/game.ts` | `chess.js` state, legal move application, game outcome |
| `src/lib/engine.ts` | Stockfish Worker wrapper and UCI best-move parsing |
| `src/lib/tapMove.ts` | Tap-selection state transition |
| `src/lib/tapGuard.ts` | Suppresses one post-drop trailing tap |
| `src/lib/storage.ts` | Completed-game `localStorage` persistence |
| `src/lib/reviewJob.ts` | Durable post-game review checkpoints and resume normalization |
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
