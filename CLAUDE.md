# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200
npm run build      # Production build
npm test           # Run unit tests (Vitest + jsdom)
ng test --include="**/game.service.spec.ts"  # Run a single test file
```

## Architecture

This is an Angular 21 Klondike Solitaire game using the standalone API (no NgModules) and Angular signals for state management.

### Services (`src/app/services/`)

- **`game.service.ts`** — Core game state: 7-column tableau, stock pile, move validation (`canDrop`), card movement (`moveCard`), initial deal (`dealInitial`). Uses Angular signals.
- **`deck.service.ts`** — 52-card deck management: shuffle (Fisher-Yates), draw, flip. Exposes `cards` signal and computed `remaining`.
- **`drag-state.service.ts`** — Tracks the active drag operation (`DragPayload`). Simple signal with `startDrag`/`endDrag`.

### Components (`src/app/components/`)

- **`card/`** — Displays a single `Card`. Face-down cards show a blue striped back; face-up cards show rank/suit.
- **`stock-pile/`** — Deck pile; click to flip a card face-up, drag to move it. Shows recycle icon when empty.
- **`tableau-column/`** — One of 7 game columns. Handles CDK drop zones with `canEnter` validation, drag preview, and auto-flip of newly exposed cards.

### Models (`src/app/models/`)

- **`card.model.ts`** — `Card` interface, `Suit`/`Rank` union types, `SUITS`, `RANKS`, `RANK_ORDER` (numeric values), `RED_SUITS`, `SUIT_SYMBOLS`, `isRedSuit()`.
- **`tableau.model.ts`** — `TableauColumn` interface `{ id: number, cards: Card[] }`.

## Key Patterns

- **Standalone components**: All components use `standalone: true`; inject services via `inject()`.
- **Angular signals**: State is held in signals (`signal()`), derived state via `computed()`. No RxJS observables in services.
- **CDK Drag-Drop**: `@angular/cdk/drag-drop` handles all drag interactions. `DragStateService` coordinates cross-component drag state.
- **Tailwind CSS v4**: Global styles in `src/styles.css`; PostCSS configured via `.postcssrc.json`.
- **Lucide icons**: SVG icons from `@lucide/angular` (e.g., `RotateCcw` for the recycle icon).
- **Template control flow**: Angular 17+ syntax (`@if`, `@for`, `@else`) — no `*ngIf`/`*ngFor` directives.
- **UI language**: Italian (`"Solitario"`, `"Nuova Partita"`).
- **Tests**: Vitest (not Jasmine/Karma). Test files are `*.spec.ts` co-located with source.
