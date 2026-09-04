# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the AI package (`@nodots/backgammon-ai`) within the Nodots Backgammon monorepo ecosystem. It provides AI capabilities for backgammon games using the native `@nodots/gnubg-hints` addon to access GNU Backgammon's evaluation engine and includes a plugin system for custom AI analyzers.

## Repository Structure

This package is part of a monorepo located at `/Users/kenr/Code/nodots-backgammon/`. Other packages in the ecosystem include:
- `core` - Core game logic
- `types` - Shared TypeScript types
- `api` - API server
- `client` - Frontend application
- `api-utils` - Shared API utilities

## Common Development Commands

### Build and Testing
```bash
npm run build          # Build TypeScript outputs
npm test               # Run Jest tests
npm test:watch         # Run tests in watch mode
npm test:coverage      # Run tests with coverage report
```

### Linting
```bash
npm run lint          # Run ESLint on src/**/*.ts
npm run lint:fix      # Auto-fix ESLint issues
```

### Cleanup
```bash
npm run clean         # Remove dist and coverage directories
```

## Architecture

### Core Components

1. **Move Selection System** (`src/moveSelection.ts`)
   - Main entry point for AI move selection
   - Integrates multiple strategies: GNU Backgammon, opening book, strategic heuristics
   - Special handling for `gbg-bot` which requires GNU Backgammon

2. **Plugin System** (`src/moveAnalyzers.ts`, `src/pluginLoader.ts`)
   - Extensible analyzer interface (`MoveAnalyzer`)
   - Built-in analyzers: Random, FurthestFromOff, Example template
   - Dynamic plugin loading from directories
   - Context-aware analysis with board state and position ID

3. **GNU Backgammon Hints** (`src/gnubg.ts`, `src/hintContext.ts`)
   - `GnubgHintsIntegration` lazily loads the native addon and manages lifecycle
   - `hintContext.ts` normalises boards/dice into `HintRequest` structures
   - Structured move, cube, and take hints with native performance

4. **WebSocket Stubs** (dormant)
   - Historical WebSocket client utilities are currently inactive

### Key Dependencies

- **Types**: All game types imported from `@nodots/backgammon-types`
- **Core**: Logger imported from `@nodots/backgammon-core`
- **External**: socket.io-client for WebSocket communication

### Type System

- Uses ES modules (`"type": "module"` in package.json)
- Strict TypeScript configuration with type declarations
- Relative imports for local types (e.g., `../../types/src/move`)
- No circular dependencies enforced by ESLint rules

## Important Patterns

### Move Selection Flow
1. `selectBestMove()` receives a `BackgammonPlayMoving` object
2. Filters moves for those with `stateKind: 'ready'`
3. Attempts strategies in order:
   - Structured hints from `@nodots/gnubg-hints` (required for gbg-bot)
   - Opening book (predefined best moves for opening rolls)
   - Strategic heuristics (prefers advancing moves)
   - Fallback to first available move

### Plugin Development
```typescript
export class MyAnalyzer implements MoveAnalyzer {
  async selectMove(
    moves: BackgammonMoveBase[],
    context?: MoveAnalyzerContext
  ): Promise<BackgammonMoveBase | null> {
    // Custom logic here
    return moves[0] || null
  }
}
```

## Known Issues and Considerations

1. **gbg-bot Integration**: Requires complete board state to build a `HintRequest`; ensure callers provide `BackgammonPlayMoving`

2. **Import Paths**: Uses relative imports for types package (`../../types/src/`) which may need adjustment if package structure changes

4. **ES Module Compatibility**: Some plugins commented out due to ES module import issues (see index.ts lines 161-163)

## Testing Approach

- Jest with ts-jest for TypeScript support
- Test files located in `src/__tests__/`
- Coverage reports generated in `coverage/` directory
- Integration tests for WebSocket and GNU Backgammon components

### Rules that came from this package's incidents

- **Write the failing test first.** It must fail against the pre-change tree and pass after. A test written against already-fixed code proves the code runs, not that the bug is gone.
- **Regression fixtures are built from the real production input** — the actual position ID that stuck, not a hand-written approximation. Both production stuck-robot positions are ungated fixtures exercising the real addon board path at ply-0 on every CI pass.
- **Never gate a test behind an environment flag nothing sets.** `regression-bar-reentry.test.ts` sat behind `RUN_GNUBG_HINTS=1` for a year — correct test, correct root-cause documentation, never executed anywhere — while the bug it covered recurred in production.
- **Confirm CI is enabled before trusting a green branch.** This repo's CI was manually disabled from 2026-04-22 to 2026-07-26; every merge in that window shipped unchecked.
- **No silent fallbacks in move execution.** If a GNU-recommended move cannot be matched to CORE's legal moves, throw with full diagnostics (position ID, planned move, legal moves). A fallback turns a detectable failure into a plausible-looking wrong answer — it let the robot play near-random moves for months while every health check stayed green.
- **TypeScript errors in tests are test failures.** Fix them; never exclude them.

## WebSocket Architecture

The AI package includes a WebSocket client for real-time game analysis:
- Connects to game server for live game events
- Automatic reconnection handling

## Build Process

1. TypeScript compilation to `dist/` directory
2. GNU Backgammon binary copying (if available)
3. Post-install script for dependency setup
4. Declaration files generated for type exports
