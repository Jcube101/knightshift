---
version: alpha
name: Quiet Study × Training Lab
description: A private, board-first chess workspace for reflection, with quiet evidence of improvement rather than a performance dashboard.
colors:
  primary: "#111813"
  surface: "#1A241C"
  surface-raised: "#223027"
  parchment: "#F5F1E8"
  ink-muted: "#C6D0C6"
  moss: "#A9C97D"
  moss-deep: "#385238"
  gold: "#E3C67A"
  played: "#E8998D"
  recommended: "#9BD9A8"
  divider: "#4A5B4B"
typography:
  display:
    fontFamily: Newsreader
    fontSize: 44px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  heading:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: "-0.02em"
  body:
    fontFamily: IBM Plex Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0em"
  label:
    fontFamily: IBM Plex Sans
    fontSize: 11px
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0.12em"
  data:
    fontFamily: IBM Plex Sans
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "0.01em"
spacing:
  micro: 4px
  tight: 8px
  compact: 12px
  standard: 16px
  section: 24px
  major: 40px
  page-edge: 20px
  desktop-edge: 40px
rounded:
  control: 6px
  panel: 12px
  board: 10px
  full: 9999px
components:
  action-primary:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.compact}"
  action-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.parchment}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.compact}"
  surface-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.parchment}"
    typography: "{typography.body}"
    rounded: "{rounded.panel}"
    padding: "{spacing.section}"
  surface-inset:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.ink-muted}"
    typography: "{typography.data}"
    rounded: "{rounded.control}"
    padding: "{spacing.standard}"
  review-played:
    backgroundColor: "{colors.played}"
    textColor: "{colors.primary}"
    typography: "{typography.data}"
    rounded: "{rounded.full}"
    padding: "{spacing.micro}"
  review-recommended:
    backgroundColor: "{colors.recommended}"
    textColor: "{colors.primary}"
    typography: "{typography.data}"
    rounded: "{rounded.full}"
    padding: "{spacing.micro}"
  study-marker:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "{spacing.tight}"
  structural-rule:
    backgroundColor: "{colors.divider}"
    textColor: "{colors.parchment}"
    typography: "{typography.data}"
    rounded: "{rounded.board}"
    padding: "{spacing.major}"
  action-primary-hover:
    backgroundColor: "{colors.moss-deep}"
    textColor: "{colors.parchment}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "{spacing.page-edge}"
  page-frame:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.parchment}"
    typography: "{typography.display}"
    rounded: "{rounded.board}"
    padding: "{spacing.desktop-edge}"
---

## Overview

Knightshift is a private place to think about chess. It should feel like opening a well-kept study after a game, not logging into a public chess network or a performance dashboard. The app is board-first, reflective, and composed. Its quiet visual language makes room for deliberate play and honest review; evidence of improvement appears as a helpful signal, never as a score to chase.

The system combines the editorial calm of a private chess notebook with the clarity of a training instrument. It is adult, tactile, and precise without becoming nostalgic, ornate, gamer-coded, or clinical. Every route should feel part of one continuous workspace: dark forest surfaces, warm parchment text, restrained moss actions, and meaning-specific review colors.

## Colors

- **Primary, Study Green (`#111813`):** The continuous dark field. It is calm rather than theatrical and lets the board, content, and small highlights carry focus.
- **Surface (`#1A241C`) and surface-raised (`#223027`):** Tonal layers for quiet panels, controls, and grouped information. Use them to organise, not to create card clutter.
- **Parchment (`#F5F1E8`) and ink-muted (`#C6D0C6`):** Warm, high-legibility reading colors. Parchment is for primary content; muted ink is for supporting context.
- **Moss (`#A9C97D`):** The sole affirmative action color. Use it for one primary action per screen and focused active states.
- **Gold (`#E3C67A`):** A rare study marker for selected learning context, not achievement, rank, or gamification.
- **Played (`#E8998D`) and recommended (`#9BD9A8`):** Fixed semantic review colors. Red-pink identifies the played line; green identifies the better option. They must never be repurposed for generic success, danger, or decoration.
- **Divider (`#4A5B4B`):** Hairlines, quiet separators, and board-adjacent framing.

Use tonal contrast and spacing before adding new colors. Gradients, neon glows, trophy colors, evaluation bars, and celebratory colors are outside the system.

## Typography

- **Display and heading:** Newsreader gives Home, Review, and meaningful results an editorial, reflective voice. It belongs to short, considered statements, never dense controls or move data.
- **Body:** IBM Plex Sans is the reading workhorse. It keeps analysis, descriptions, and settings plain and calm.
- **Label:** IBM Plex Sans in uppercase with generous tracking. Use for route context, board status, metadata headings, and quiet instrument labels.
- **Data:** IBM Plex Sans medium. Use for SAN, dates, game state, material, and compact factual strings. Keep chess notation intact and never replace SAN with simplified prose.

Use two families only. Do not use a large numeral display, condensed esports lettering, handwriting fonts, or a monospace-heavy terminal aesthetic. Roman critical-moment labels remain compact: I, II, III.

## Layout

All four routes share one responsive shell: a restrained header, a consistent page frame, and a max-width content column that preserves breathing room on wide screens. On mobile, retain a stable reading order and a bottom-reachable navigation pattern. On desktop, navigation may become a slim horizontal bar or quiet rail, but it must not turn the app into a dense command console.

The board is the largest object only on Play and Review. Elsewhere, one next action or one current learning object has that role. Use an 8px-derived rhythm, generous section spacing, and meaningful grouping. A panel should represent a distinct thought: an active game, a latest lesson, a saved game, or a setting group. Do not wrap every sentence in a card.

## Elevation & Depth

Depth comes from tonal layering, hairline dividers, and local board shadow. The workspace is predominantly flat. Raised surfaces may sit one tone above the field and use a soft, close black shadow only when a board or focused panel needs separation.

Avoid glassmorphism, broad ambient glows, floating widget stacks, heavy drop shadows, and decorative depth. Review overlays are intentionally stronger than surrounding depth because they carry chess meaning.

## Shapes

Use composed rectangles with a modest 6px control radius and 12px panel radius. The board keeps a 10px radius, matching the quiet solidity of the workspace. Pills are reserved for compact semantic markers such as the red/green review legend or a selected study state, never for generic category decoration.

Borders are fine, restrained, and structural. Avoid oversized rounded containers, bubbly controls, ornate chess-piece silhouettes, and decorative checkerboard textures.

## Components

- **Shared page frame:** Every route uses the same study-green field, editorial masthead treatment, navigation placement, and page-edge rhythm. The current route is clear through typography and a moss indicator, not a loud tab treatment.
- **Primary action:** Moss on study green. One per screen. It advances the person’s current chess work: Play a game, Resume game, Analyze game, or Open saved review.
- **Secondary action:** Tonal, quiet, and text-led. Use for Undo, Back to History, New game, and route-adjacent utilities.
- **Panels:** Use for an object with a clear boundary. A panel’s title describes the thought inside it, not the implementation: “Your next game,” “Latest lesson,” “Saved games.”
- **Board:** Retain standard chess notation and accessible square contrast. Treat it as a physical study object with a contained shadow, not as an animated game arena.
- **Review legend and overlays:** Red marks both origin and destination of the played move; green marks both origin and destination of the recommendation. When squares overlap, preserve the recommended move’s legibility with a secondary outline or layered treatment. Explanatory copy names only evidence recorded from the position.
- **Settings fields:** Plain labelled controls with persistent labels, short helper copy, visible keyboard focus, and no visual competition with the current default values.

## Do's and Don'ts

- Do make the board or one next reflective action the first thing a person understands on every route.
- Do use measurable signals, such as analysed-game count or recurring pattern count, as quiet evidence beside a concrete next step.
- Do keep Stockfish explanations factual, board-grounded, and concise.
- Do maintain WCAG AA contrast for normal text and visible non-color-only focus states.
- Do respect reduced motion and make all board and navigation actions usable by keyboard and touch.
- Don't create ratings, streaks, trophies, leaderboards, win-rate charts, accuracy percentages, or achievement language.
- Don't use red and green outside the saved-review move comparison.
- Don't put a dashboard grid, dense telemetry, or persistent evaluation visualisation on Home.
- Don't introduce public or social chess conventions: opponent profiles, feeds, rankings, chat, spectators, or share prompts.
- Don't turn sparse routes into empty routes. Use considered copy and a clear action rather than decorative filler.

## Information Priorities

1. **Current chess work:** The active game, an immediate play action, or the current review moment.
2. **A considered next step:** One action that moves the practice loop forward without coercion.
3. **The evidence that supports reflection:** A concise Stockfish consequence, an analysed-game count, or one recurring board-grounded pattern.
4. **Context and archive:** Date, side, difficulty, result, move count, settings, and older saved games.

Home is intentionally not a metrics dashboard. Its job is orientation and a next step, not proving productivity.

## Interaction Philosophy

Knightshift is read before it is operated. Motion should clarify state changes, such as a board move, a selected review moment, or a panel entering focus. It must not decorate empty space, simulate urgency, or reward compulsive checking.

A game may be demanding; the interface should not be. During play, controls stay near the board and engine status is direct. During review, the interaction slows down: selecting I, II, or III changes the position and explanation without burying the person in engine lines. During History, browsing remains chronological and calm.

## UX Patterns

- **Shared navigation:** Home, Play, and Settings are the only top-level destinations. Review and the full saved-game archive are addressable detail routes reached from Home, not destinations competing for persistent attention.
- **Home:** Lead with Resume game when an active game exists, otherwise Play a game. Home is the personal study dashboard: show at most one latest lesson, one quiet pattern signal, and a short chronological list of recent games. The full archive is available through a restrained All saved games link. Do not show a grid of trend cards, scores, or all pattern totals.
- **Play:** Board first. Material sits above the board as a compact score, beside a horizontally scrolling move strip with no visible scrollbar. The Engine container is absent from Play. Side selection uses a compact White/Black segmented toggle and difficulty uses an accessible three-step slider, both kept visually recessive beside the board. Side and difficulty are durable defaults configured in Settings and copied into a new game; Play may show the chosen values and allow intentional game-specific changes only if the UI makes that exception explicit.
- **Review:** Open on critical moment I. Keep moments in chronological game order, labelled only I, II, III. The board before the move, red/green overlays, SAN recommendation, and one factual consequence form one focused lesson.
- **History:** Present saved games as a chronological archive. Pattern summaries are concise and linked to evidence. Avoid aggregate charts until they serve a specific reflective question better than a simple count and saved-game link.
- **Settings:** Keep new-game defaults here. The fixed Quiet Study palette is visible as product identity, not a user preference. The page is intentionally quiet and must not expose game controls, engine telemetry, or account-like preferences.
- **Empty states:** State what becomes available after the next completed action and supply a single route-appropriate action. Do not use illustrations, motivational slogans, or fabricated progress.

## Decisions & Reasoning

- **Private reflection wins over performance measurement:** Knightshift’s primary promise is “a private place to think about my chess.” Measurable improvement is useful only when it supports that reflection. This prevents the app from becoming an anxious performance dashboard.
- **Home prioritises one next action over a metrics grid:** A dense grid of mistake counts, trends, and performance measures would make progress immediately measurable, but it would displace the reflective core of the app. Home instead leads with Resume game or Play a game, then offers the latest lesson and one quiet evidence signal. This is the explicit resolution when the two promises conflict.
- **Quiet Study × Training Lab hybrid:** The study supplies calm surfaces, editorial typography, and board-first space. The lab supplies clear review hierarchy, precise status, and proof-backed patterns. The product needs both: calm without vagueness, precision without performance theatre.
- **Fixed Quiet Study palette:** Quiet Study is Knightshift’s one visual system, not the default among user-selectable themes. The settings theme picker is removed; legacy browser theme values are ignored rather than migrated or deleted.
- **One system across route types:** Shared navigation, palette, typography, spacing, panel behaviour, action hierarchy, and review semantics bind Home, Play, Settings, the saved-game archive, and review. Per-screen conventions exist only where role demands them: board dominance on Play and Review, next-action and recent-study context on Home, chronology in the archive, and form simplicity in Settings.
- **Three-item primary navigation:** Home, Play, and Settings are stable workspaces. History is archive context rather than an independent workspace at Knightshift’s current scope, so its recent-game and pattern summary belong on Home. The full archive remains at an addressable route through All saved games, preserving depth without permanent navigation weight.
- **Board-grounded feedback over invented coaching:** Stockfish explanations and recurring-pattern labels remain limited to what the stored position and reply demonstrate. The interface should never turn an evaluation swing into an unsupported story.
- **Durable defaults belong in Settings:** Preferred side and difficulty are stable preferences. Keeping them in Settings lets Play remain focused on the game and prevents configuration from competing with the board.
- **Roman critical-moment labels:** I, II, and III keep severity present but visually quiet. “Biggest” is omitted because rank I already communicates hierarchy.
