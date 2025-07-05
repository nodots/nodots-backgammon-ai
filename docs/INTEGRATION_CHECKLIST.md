# Integration Checklist for Core Team

## 🚀 Quick Start Integration

### Step 1: Install the Package

```bash
npm install @nodots-llc/backgammon-ai@2.2.1
```

### Step 2: Import in Your Game Engine

```typescript
import {
  RobotAIService,
  AIDifficulty,
  GameState,
} from '@nodots-llc/backgammon-ai'
```

### Step 3: Add Robot Service to Game Engine

```typescript
class GameEngine {
  private robotService = new RobotAIService()
  // ... existing code
}
```

### Step 4: Modify Player Turn Handler

```typescript
async handlePlayerTurn(gameId: string, playerId: string) {
  if (this.isRobot(playerId)) {
    await this.handleRobotTurn(gameId, playerId)  // NEW
  } else {
    await this.handleHumanTurn(gameId, playerId)  // EXISTING
  }
}
```

### Step 5: Implement Robot Turn Handler

```typescript
private async handleRobotTurn(gameId: string, robotId: string) {
  const availableMoves = await this.getAvailableMoves(gameId, robotId)

  if (availableMoves.length > 0) {
    const aiGameState: GameState = {
      currentPlayer: robotId,
      availableMoves: availableMoves,
      gamePhase: this.determineGamePhase(gameState)
    }

    const selectedMove = await this.robotService.makeRobotMove(robotId, aiGameState)

    if (selectedMove) {
      await this.applyMove(gameId, selectedMove)
      await this.advanceToNextPlayer(gameId)
    }
  }
}
```

## ✅ Testing Checklist

- [ ] Import works without errors
- [ ] Can create RobotAIService instance
- [ ] Can call `makeRobotMove()` with test data
- [ ] Robot moves are applied to game state
- [ ] Game continues after robot move
- [ ] Test with stuck game: `b85e3029-0faf-4d2a-928d-589cc6315295`
- [ ] Multiple robots work in same game
- [ ] Different difficulty levels behave differently

## 🔧 Helper Functions to Implement

### Required

```typescript
private isRobot(playerId: string): boolean {
  // Return true if player is a robot
}

private determineGamePhase(gameState: any): 'opening' | 'middle' | 'race' | 'bearoff' {
  // Analyze game state and return phase
}
```

### Optional (for better AI performance)

```typescript
private getPositionId(gameState: any): string {
  // Return GNU Backgammon position ID if available
}
```

## 🎯 Success Criteria

✅ **Robot makes move automatically** when it's their turn  
✅ **Game progresses** without waiting for human input  
✅ **Stuck game** `b85e3029-0faf-4d2a-928d-589cc6315295` completes  
✅ **Human vs Robot** games work end-to-end

## 🚨 Common Issues

1. **Move format mismatch**: Ensure `BackgammonMoveBase` has required properties
2. **Missing game phase**: AI works better with phase information
3. **Robot detection**: Make sure `isRobot()` correctly identifies robot players
4. **Async handling**: Don't forget to `await` robot move selection

## 📞 Need Help?

- Check `CORE_TEAM_HANDOFF_NOTES.md` for detailed integration guide
- Look at `src/__tests__/index.test.ts` for usage examples
- Run `npm test` in the AI package to see all functionality

---

**🎯 Goal**: Transform the stuck robot game into a completed game!
