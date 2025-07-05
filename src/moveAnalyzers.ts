import { BackgammonMoveBase } from '../../nodots-backgammon-types/src/move'

// Context object for analyzers, can be extended as needed
export interface MoveAnalyzerContext {
  board?: any // Replace 'any' with your board type if available
  positionId?: string
  gamePhase?: 'opening' | 'middle' | 'race' | 'bearoff'
  currentPlayer?: string
  [key: string]: any
}

export interface MoveAnalyzer {
  selectMove(
    moves: BackgammonMoveBase[],
    context?: MoveAnalyzerContext
  ): Promise<BackgammonMoveBase | null>
}

/**
 * Randomly selects a move from the list.
 */
export class RandomMoveAnalyzer implements MoveAnalyzer {
  async selectMove(
    moves: BackgammonMoveBase[]
  ): Promise<BackgammonMoveBase | null> {
    if (!moves.length) return null
    const idx = Math.floor(Math.random() * moves.length)
    return moves[idx]
  }
}

/**
 * Type guard to check if a move has an origin property.
 */
function hasOrigin(move: BackgammonMoveBase): move is BackgammonMoveBase & {
  origin: { position: { clockwise: number; counterclockwise: number } }
} {
  return (move as any).origin && (move as any).origin.position
}

/**
 * Selects the move that leaves the most checkers furthest from being borne off.
 * If origin is available, uses its position; otherwise, falls back to dieValue.
 */
export class FurthestFromOffMoveAnalyzer implements MoveAnalyzer {
  async selectMove(
    moves: BackgammonMoveBase[]
  ): Promise<BackgammonMoveBase | null> {
    if (!moves.length) return null
    let maxScore = -Infinity
    let bestMove: BackgammonMoveBase | null = null
    for (const move of moves) {
      let score = 0
      if (hasOrigin(move)) {
        // Use the clockwise position as a proxy for distance from off
        score = move.origin.position.clockwise
      } else {
        // Fallback: use dieValue as a proxy
        score = move.dieValue
      }
      if (score > maxScore) {
        maxScore = score
        bestMove = move
      }
    }
    return bestMove
  }
}

/**
 * Strategic move analyzer that considers multiple factors:
 * - Safety (avoid leaving blots)
 * - Advancement (move checkers forward)
 * - Blocking (create blocks to hinder opponent)
 * - Game phase considerations
 */
export class StrategicMoveAnalyzer implements MoveAnalyzer {
  async selectMove(
    moves: BackgammonMoveBase[],
    context?: MoveAnalyzerContext
  ): Promise<BackgammonMoveBase | null> {
    if (!moves.length) return null

    let bestMove: BackgammonMoveBase | null = null
    let bestScore = -Infinity

    for (const move of moves) {
      const score = this.evaluateMove(move, context)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }

    return bestMove
  }

  private evaluateMove(
    move: BackgammonMoveBase,
    context?: MoveAnalyzerContext
  ): number {
    let score = 0

    // Base score from advancement (prefer moving checkers forward)
    if (hasOrigin(move)) {
      score += move.origin.position.clockwise * 0.1
    } else {
      score += move.dieValue * 0.1
    }

    // Game phase considerations
    if (context?.gamePhase) {
      switch (context.gamePhase) {
        case 'opening':
          score += this.evaluateOpeningMove(move)
          break
        case 'middle':
          score += this.evaluateMiddleGameMove(move)
          break
        case 'race':
          score += this.evaluateRaceMove(move)
          break
        case 'bearoff':
          score += this.evaluateBearoffMove(move)
          break
      }
    }

    // Add some randomness to avoid predictable play
    score += Math.random() * 0.5

    return score
  }

  private evaluateOpeningMove(move: BackgammonMoveBase): number {
    // In opening, prioritize building points and moving builders
    let score = 0

    // Prefer moves that create or extend points
    if (this.createsPoint(move)) {
      score += 2.0
    }

    // Prefer moves that bring builders into play
    if (this.bringsBuilderIntoPlay(move)) {
      score += 1.5
    }

    return score
  }

  private evaluateMiddleGameMove(move: BackgammonMoveBase): number {
    // In middle game, balance offense and defense
    let score = 0

    // Prefer safe moves
    if (this.isSafeMove(move)) {
      score += 1.0
    }

    // Prefer moves that attack opponent blots
    if (this.attacksOpponentBlot(move)) {
      score += 1.5
    }

    return score
  }

  private evaluateRaceMove(move: BackgammonMoveBase): number {
    // In race, maximize pip advancement
    let score = 0

    // Prefer moves that advance pips most efficiently
    score += move.dieValue * 0.3

    // Prefer moves that clear back points
    if (this.clearsBackPoint(move)) {
      score += 1.0
    }

    return score
  }

  private evaluateBearoffMove(move: BackgammonMoveBase): number {
    // In bearoff, prioritize bearing off and efficient checker distribution
    let score = 0

    // Strongly prefer bearing off moves
    if (this.isBearoffMove(move)) {
      score += 3.0
    }

    // Prefer moves that don't leave gaps
    if (this.maintainsEfficientDistribution(move)) {
      score += 1.0
    }

    return score
  }

  // Helper methods for move evaluation
  private createsPoint(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    // For now, return false as placeholder
    return false
  }

  private bringsBuilderIntoPlay(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    return false
  }

  private isSafeMove(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    return true // Default to safe for now
  }

  private attacksOpponentBlot(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    return false
  }

  private clearsBackPoint(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    return false
  }

  private isBearoffMove(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    // For now, assume moves to position 0 or off are bearoff moves
    return (move as any).to === 0 || (move as any).to === 'off'
  }

  private maintainsEfficientDistribution(move: BackgammonMoveBase): boolean {
    // This would need actual board state to determine
    return true
  }
}

// Template for plugin authors
export class ExamplePluginAnalyzer implements MoveAnalyzer {
  async selectMove(
    moves: BackgammonMoveBase[],
    context?: MoveAnalyzerContext
  ): Promise<BackgammonMoveBase | null> {
    // Your custom logic here
    return moves[0] || null
  }
}
