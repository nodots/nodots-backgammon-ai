# Robot AI Automation System

This document describes the robot AI automation system implemented in `@nodots-llc/backgammon-ai`.

## Overview

The robot AI automation system provides intelligent move selection for automated robot players in backgammon games. It includes multiple difficulty levels and strategic move analyzers.

## Key Components

### 1. BackgammonAI Class

The main AI class that handles move selection for individual robot players.

```typescript
import { BackgammonAI, AIDifficulty, GameState } from '@nodots-llc/backgammon-ai'

// Create an AI instance
const ai = new BackgammonAI(AIDifficulty.INTERMEDIATE)

// Get the best move for a game state
const gameState: GameState = {
  positionId: '4HPwATDgc/ABMA',
  currentPlayer: 'robot1',
  availableMoves: [...], // Array of BackgammonMoveBase
  gamePhase: 'opening'
}

const bestMove = await ai.getBestMove(gameState)
```

### 2. RobotAIService Class

A service that manages multiple robot AI instances and handles robot automation.

```typescript
import { RobotAIService, AIDifficulty } from '@nodots-llc/backgammon-ai'

const robotService = new RobotAIService()

// Create robots with different difficulties
const robot1AI = robotService.getAI('robot1', AIDifficulty.BEGINNER)
const robot2AI = robotService.getAI('robot2', AIDifficulty.ADVANCED)

// Make a move for a robot
const move = await robotService.makeRobotMove('robot1', gameState)
```

### 3. AI Difficulty Levels

Three difficulty levels are available:

- **BEGINNER**: Random move selection
- **INTERMEDIATE**: Strategic move selection focusing on advancement
- **ADVANCED**: Sophisticated strategy considering game phase, safety, and tactics

### 4. Move Analyzers

Different move analyzers implement various strategies:

- `RandomMoveAnalyzer`: Selects moves randomly
- `FurthestFromOffMoveAnalyzer`: Prefers moves that advance checkers
- `StrategicMoveAnalyzer`: Advanced strategy with game phase considerations

## Integration with Game Core

To integrate with your game system:

```typescript
class GameMonitor {
  private robotService = new RobotAIService()

  async handleGameStateUpdate(gameId: string, gameState: any) {
    const currentPlayer = gameState.currentPlayer

    if (this.isRobot(currentPlayer)) {
      const availableMoves = this.getAvailableMoves(gameState)

      if (availableMoves.length > 0) {
        const aiGameState: GameState = {
          positionId: gameState.positionId,
          currentPlayer: currentPlayer,
          availableMoves: availableMoves,
          gamePhase: this.determineGamePhase(gameState),
        }

        const selectedMove = await this.robotService.makeRobotMove(
          currentPlayer,
          aiGameState
        )

        if (selectedMove) {
          // Apply the move to your game core
          await this.applyMove(gameId, selectedMove)
        }
      }
    }
  }

  private isRobot(playerId: string): boolean {
    return playerId.startsWith('robot')
  }

  private getAvailableMoves(gameState: any): BackgammonMoveBase[] {
    // Get available moves from your game core
    return gameCore.getAvailableMoves(gameState)
  }

  private determineGamePhase(
    gameState: any
  ): 'opening' | 'middle' | 'race' | 'bearoff' {
    // Analyze game state to determine phase
    return gameCore.determineGamePhase(gameState)
  }
}
```

## API Reference

### BackgammonAI

#### Constructor

```typescript
constructor(difficulty: AIDifficulty = AIDifficulty.INTERMEDIATE)
```

#### Methods

- `getBestMove(gameState: GameState): Promise<BackgammonMoveBase | null>`
- `setDifficulty(difficulty: AIDifficulty): void`
- `getDifficulty(): AIDifficulty`
- `shouldMakeMove(gameState: GameState): boolean`

### RobotAIService

#### Methods

- `getAI(robotId: string, difficulty?: AIDifficulty): BackgammonAI`
- `makeRobotMove(robotId: string, gameState: GameState): Promise<BackgammonMoveBase | null>`
- `setRobotDifficulty(robotId: string, difficulty: AIDifficulty): void`
- `removeRobot(robotId: string): void`

### GameState Interface

```typescript
interface GameState {
  positionId?: string
  board?: any
  currentPlayer?: string
  availableMoves?: BackgammonMoveBase[]
  gamePhase?: 'opening' | 'middle' | 'race' | 'bearoff'
}
```

## Custom Move Analyzers

You can create custom move analyzers by implementing the `MoveAnalyzer` interface:

```typescript
import { MoveAnalyzer, MoveAnalyzerContext } from '@nodots-llc/backgammon-ai'

class CustomAnalyzer implements MoveAnalyzer {
  async selectMove(
    moves: BackgammonMoveBase[],
    context?: MoveAnalyzerContext
  ): Promise<BackgammonMoveBase | null> {
    // Your custom logic here
    return moves[0] || null
  }
}
```

## Testing

The system includes comprehensive tests covering:

- AI instance creation and configuration
- Move selection for different difficulties
- Robot service management
- Edge cases (no moves available, empty game states)

Run tests with:

```bash
npm test
```

## Performance Considerations

- Move selection is typically very fast (< 1ms for simple strategies)
- The `StrategicMoveAnalyzer` may take longer for complex positions
- Robot instances are cached and reused for efficiency
- No external dependencies required for basic functionality

## Future Enhancements

- Integration with GNU Backgammon for expert-level play
- Machine learning-based move evaluation
- Opening book and endgame databases
- Adaptive difficulty based on opponent strength
- Tournament play support

## Usage Notes

1. **Robot Identification**: Robots are identified by string IDs. Use consistent naming (e.g., 'robot1', 'robot2').

2. **Game Phase Detection**: Providing accurate game phase information improves move quality for advanced difficulties.

3. **Move Validation**: The AI assumes all provided moves are legal. Validate moves before passing to the AI.

4. **Cleanup**: Use `removeRobot()` to clean up robot instances when games end.

5. **Error Handling**: Always handle the case where `getBestMove()` returns `null` (no moves available).

This system provides a solid foundation for robot AI automation in backgammon games, with room for future enhancements and customization.
