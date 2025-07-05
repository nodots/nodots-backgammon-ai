# Nodots Backgammon Ecosystem Cursor Rules
# Repository: ai (library)
# Generated: 2025-07-05T21:03:26.856Z
# Configuration Version: 1.0.0

---

## 📋 Table of Contents

### Shared Rules
- [Core Rules](#core-rules)
- [Development Rules](#development-rules)
- [Coding Rules](#coding-rules)

---

## 🌍 Shared Ecosystem Rules

The following rules are shared across the entire Nodots Backgammon ecosystem:

### Core Rules
*Backgammon domain knowledge and game rules*

# Core Backgammon Rules and Domain Knowledge

## Rules of Backgammon

Reference: https://www.bkgm.com/rules.html

## Backgammon Board Position System

**CRITICAL**: Each point on the backgammon board has TWO position numbers - one for each player direction:

- **Clockwise positions**: 1, 2, 3... 24 (clockwise player's perspective)
- **Counterclockwise positions**: 1, 2, 3... 24 (counterclockwise player's perspective)

### Starting Positions

- **Clockwise player** starts with checkers on clockwise positions: 24, 13, 8, 6
- **Counterclockwise player** starts with checkers on counterclockwise positions: 24, 13, 8, 6

### Key Points

- Both players start on their respective "24, 13, 8, 6" but from their own directional perspective
- This is NOT a bug - it's the correct dual numbering system
- Each point object contains: `{ clockwise: X, counterclockwise: Y }`
- Move validation must use the correct positional perspective for each player

### Example

```
Point at top-right of ASCII board:
- Clockwise position: 24 (WHITE's starting position)
- Counterclockwise position: 1 (BLACK's goal position)
```

This dual numbering system is essential for proper move validation and game logic.

## Unified Presentation Layer

**KEY FEATURE**: Every player sees the board as if they are "white moving clockwise" regardless of the actual backend configuration.

### Backend Flexibility

The game can have any combination of:

- White moving clockwise vs counterclockwise
- Black moving clockwise vs counterclockwise
- Any player being human or robot
- Any starting positions

### Frontend Consistency

Every player always sees:

- Their checkers as "white" moving clockwise
- Their home board as positions 1-6 (bottom right)
- Their outer board as positions 7-12 (bottom left)
- Opponent's outer board as positions 13-18 (top left)
- Opponent's home board as positions 19-24 (top right)

### Benefits

- Eliminates cognitive load of "which direction am I moving?"
- No need to mentally flip the board
- Consistent, intuitive view for all players
- Backend can handle any game configuration while frontend presents unified experience

This presentation abstraction is a key differentiator of Nodots Backgammon.

## Play/Move Game Flow

Understanding the critical game flow is essential for debugging move-related issues:

1. **Game.roll()** creates new Play instance → becomes activePlay in Game
2. **Play.initialize()** creates moves (2 for regular roll, 4 for doubles) with possibleMoves populated
3. **Empty possibleMoves** = 'no-move', completed automatically
4. **Non-empty possibleMoves** = player selects from options (humans click checkers, robots auto-select first)
5. **Move execution** updates activePlay.moves to track consumed dice

When debugging move issues, always check: activePlay state, moves array, possibleMoves population, and dice consumption tracking.

## Game Creation Requirements

Backgammon games MUST be created with exactly 2 players and ONLY 2 players are permitted:

1. The POST /games endpoint requires `{ player1: { userId: "id1" }, player2: { userId: "id2" } }` in the request body
2. Both `player1.userId` and `player2.userId` are required and must be different
3. There is NO addPlayer endpoint - players cannot be added after game creation
4. Use `api.games.start(player1Id, player2Id)` not `api.games.create()` for creating games with players
5. The `api.games.create()` method (no parameters) is invalid and will result in 400 errors

This ensures all games have the required two players from creation and prevents incomplete game states.


### Development Rules
*Development processes and communication standards*

# Development Workflow Rules

## Status Updates and Communication

### Regular Status Updates

Provide status updates every 15 seconds during long-running tasks or operations. Each update MUST include:

- 🕒 Timestamp in format "**[HH:MM:SS] UPDATE #N**"
- Current task/operation being performed
- Progress indicators or completion status
- Any issues encountered
- Next steps planned

This keeps the user informed and prevents confusion about task progress.

### Notification Requirements

Update status in the chat window at a minimum every 30 seconds. If you are stuck, interrupt after 3 iterations.

### Stuck Detection

If I spend more than 2 minutes on infrastructure issues, debugging environment problems, or repeatedly failing at the same task without making progress toward the user's actual goal, I MUST notify the user immediately with:

- "⚠️ **I'M STUCK**: [brief description of what I'm stuck on]"
- "🎯 **SUGGESTED APPROACH**: [alternative approach]"
- "❓ **USER INPUT NEEDED**: [what decision or help I need]"

This prevents wasting time on tangential issues and keeps focus on the main objective.

## Testing and Quality Assurance

### Test Requirements

All tests must pass before reporting that a task is completed. If any tests fail after implementing changes, iterate on the solution until all tests pass. Run the test suite and fix any failures before considering the task done.

### Bug Status Clarity

When reporting on bugs, be explicitly clear about the current status using these exact terms:

- "🔍 **BUG DISCOVERED**" - when a bug has been found and documented but not yet fixed
- "🔧 **BUG FIXED**" - when a bug has been resolved and verified through testing
- "🧪 **BUG INVESTIGATION**" - when actively debugging but root cause not yet identified
- "✅ **BUG VERIFIED RESOLVED**" - when fix has been tested and confirmed working

Never use ambiguous language that could confuse discovery with resolution.

## Environment Management

### Directory Verification

ALWAYS verify the current directory before running terminal commands. Use `pwd` or check the last terminal cwd to ensure you're in the correct directory (e.g., nodots-backgammon-api for API commands, nodots-backgammon-core for core commands). If in the wrong directory, navigate to the correct one before executing commands. This prevents file not found errors and ensures commands run in the intended context.

### API Server Management

ALWAYS kill existing API server processes before starting the server. Multiple running instances cause port conflicts and unpredictable behavior. Before starting the API server:

1. Navigate to `nodots-backgammon-api` directory
2. Run `npm run kill-port` to kill processes on port 3000 (uses the package.json script)
3. Check for any remaining ts-node/nodemon processes with `ps aux | grep -E "(ts-node|nodemon)" | grep -v grep`
4. Kill any remaining processes if found
5. Start the server with `npm start` (not npm run dev - that script doesn't exist)

This prevents port conflicts, ensures clean server state, and avoids multiple concurrent API instances that can cause simulation hangs.


### Coding Rules
*Architecture and code style guidelines*

# Coding Standards and Architecture Guidelines

## Architecture and Separation of Concerns

### Game Logic Separation

ALL game logic must reside in nodots-backgammon-core. The API layer should ONLY:

1. Accept information about current state and proposed state changes
2. Pass these to core for validation and execution
3. Return results or errors from core
4. Handle persistence and API concerns

Never implement game rules, move validation, or game state logic in the API layer. This separation ensures consistency and testability.

### API Client Usage

ALWAYS use the configured apiClient (`api.*` methods) instead of raw fetch() calls in the frontend:

1. Use `api.games.*` for all game-related operations (create, start, roll, move, etc.)
2. Use `api.users.*` for all user-related operations
3. Never use raw `fetch()` calls to the backend API endpoints
4. The apiClient handles authentication, error handling, and consistent request formatting
5. This ensures type safety and consistent error handling across the application

Example: Use `api.games.rollForStart(gameId)` not `fetch('/games/${gameId}/roll-for-start')`

## Type Safety and Dependencies

### Official Types Package

ALWAYS use types from `@nodots-llc/backgammon-types` package - NEVER redefine local types:

1. Import all game-related types from `@nodots-llc/backgammon-types`
2. Use `BackgammonGame`, `BackgammonPlayer`, `BackgammonBoard`, etc. from the official package
3. NEVER create local interfaces that duplicate package types (e.g., don't create `GameState` when `BackgammonGame` exists)
4. Use package types for all API responses, state management, and type annotations
5. Only create local interfaces for UI-specific state that doesn't exist in the package
6. This ensures type consistency between frontend, backend, and prevents state transition bugs

Example: Use `BackgammonGame` not local `GameState` interface

### Database and Type Consistency

The database schema and the corresponding TypeScript type (e.g., UsersTable and ExternalUser) must always have the same fields. Any addition, removal, or change to one must be reflected in the other to ensure consistency between the database and application types.

## Programming Style Guidelines

### Functional Programming Over Imperative

Avoid if/then statements when possible - they are code smell in functional programming:

1. Use early returns instead of nested if/else chains
2. Prefer switch statements with early returns for state machines
3. Use ternary operators for simple conditional assignments
4. Leverage array methods (.map, .filter, .find, .some, .every) over imperative loops
5. Use object/map lookups instead of long if/else chains
6. Extract complex conditions into well-named boolean variables or functions

Example: `const isValidMove = dice.includes(dieValue) && !isBlocked` instead of nested ifs

### Comment Style

No adverbs or adjectives in comments. Keep language direct and factual.


## 🎯 Repository-Specific Rules

*No repository-specific rules defined.*

To add repository-specific rules, edit the configuration in `.cursor/config.json`

---

## 📊 Rule Configuration Metadata

- **Repository**: ai
- **Type**: library
- **Template**: Template for library packages (types, core, ai)
- **Shared Rules**: core, development, coding
- **Custom Rules**: 0
- **Last Updated**: 2025-07-05T21:03:26.856Z
- **Config Version**: 1.0.0

---

**🔧 To modify these rules:**
1. Edit the configuration in `.cursor/config.json`
2. Run `npm run setup` to regenerate all rules
3. Commit changes to propagate across the ecosystem

**📚 For more information:**
- [Ecosystem Documentation](../ECOSYSTEM.md)
- [Shared Rules Directory](../.cursor/shared-rules/)
- [Development Workflow](../.cursor/shared-rules/development-workflow.md)
