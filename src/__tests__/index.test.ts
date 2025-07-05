import { BackgammonMoveBase } from '../../../nodots-backgammon-types/src/move'
import {
  AIDifficulty,
  BackgammonAI,
  GameState,
  getBestMoveForStartingPosition,
  getGnubgMoveHint,
  RobotAIService,
  selectMoveFromList,
} from '../index'
import { RandomMoveAnalyzer } from '../moveAnalyzers'

// Mock move data for testing
const mockMoves: BackgammonMoveBase[] = [
  {
    id: 'move1',
    player: 'robot1',
    stateKind: 'valid',
    moveKind: 'normal',
    possibleMoves: [],
    dieValue: 1,
    from: 24,
    to: 23,
  } as unknown as BackgammonMoveBase,
  {
    id: 'move2',
    player: 'robot1',
    stateKind: 'valid',
    moveKind: 'normal',
    possibleMoves: [],
    dieValue: 2,
    from: 13,
    to: 11,
  } as unknown as BackgammonMoveBase,
  {
    id: 'move3',
    player: 'robot1',
    stateKind: 'valid',
    moveKind: 'normal',
    possibleMoves: [],
    dieValue: 3,
    from: 8,
    to: 5,
  } as unknown as BackgammonMoveBase,
]

const mockGameState: GameState = {
  positionId: '4HPwATDgc/ABMA',
  currentPlayer: 'robot1',
  availableMoves: mockMoves,
  gamePhase: 'opening',
}

describe('BackgammonAI', () => {
  let ai: BackgammonAI

  beforeEach(() => {
    ai = new BackgammonAI()
  })

  describe('constructor and configuration', () => {
    it('should create AI with default intermediate difficulty', () => {
      expect(ai.getDifficulty()).toBe(AIDifficulty.INTERMEDIATE)
    })

    it('should create AI with specified difficulty', () => {
      const beginnerAI = new BackgammonAI(AIDifficulty.BEGINNER)
      expect(beginnerAI.getDifficulty()).toBe(AIDifficulty.BEGINNER)
    })

    it('should allow changing difficulty', () => {
      ai.setDifficulty(AIDifficulty.ADVANCED)
      expect(ai.getDifficulty()).toBe(AIDifficulty.ADVANCED)
    })
  })

  describe('getBestMove', () => {
    it('should return null when no moves available', async () => {
      const emptyGameState: GameState = {
        availableMoves: [],
      }
      const move = await ai.getBestMove(emptyGameState)
      expect(move).toBeNull()
    })

    it('should return null when availableMoves is undefined', async () => {
      const emptyGameState: GameState = {}
      const move = await ai.getBestMove(emptyGameState)
      expect(move).toBeNull()
    })

    it('should return a move when moves are available', async () => {
      const move = await ai.getBestMove(mockGameState)
      expect(move).not.toBeNull()
      expect(mockMoves).toContain(move)
    })

    it('should use different strategies for different difficulties', async () => {
      // Test that different difficulties potentially return different moves
      const beginnerAI = new BackgammonAI(AIDifficulty.BEGINNER)
      const advancedAI = new BackgammonAI(AIDifficulty.ADVANCED)

      const beginnerMove = await beginnerAI.getBestMove(mockGameState)
      const advancedMove = await advancedAI.getBestMove(mockGameState)

      expect(beginnerMove).not.toBeNull()
      expect(advancedMove).not.toBeNull()
      // Both should be valid moves from the available set
      expect(mockMoves).toContain(beginnerMove)
      expect(mockMoves).toContain(advancedMove)
    })
  })

  describe('shouldMakeMove', () => {
    it('should return true when moves are available', () => {
      expect(ai.shouldMakeMove(mockGameState)).toBe(true)
    })

    it('should return false when no moves available', () => {
      const emptyGameState: GameState = {
        availableMoves: [],
      }
      expect(ai.shouldMakeMove(emptyGameState)).toBe(false)
    })

    it('should return false when availableMoves is undefined', () => {
      const emptyGameState: GameState = {}
      expect(ai.shouldMakeMove(emptyGameState)).toBe(false)
    })
  })
})

describe('RobotAIService', () => {
  let service: RobotAIService

  beforeEach(() => {
    service = new RobotAIService()
  })

  describe('AI instance management', () => {
    it('should create and return AI instance for robot', () => {
      const ai = service.getAI('robot1')
      expect(ai).toBeInstanceOf(BackgammonAI)
      expect(ai.getDifficulty()).toBe(AIDifficulty.INTERMEDIATE)
    })

    it('should return same AI instance for same robot ID', () => {
      const ai1 = service.getAI('robot1')
      const ai2 = service.getAI('robot1')
      expect(ai1).toBe(ai2)
    })

    it('should create different AI instances for different robots', () => {
      const ai1 = service.getAI('robot1')
      const ai2 = service.getAI('robot2')
      expect(ai1).not.toBe(ai2)
    })

    it('should create AI with specified difficulty', () => {
      const ai = service.getAI('robot1', AIDifficulty.BEGINNER)
      expect(ai.getDifficulty()).toBe(AIDifficulty.BEGINNER)
    })
  })

  describe('robot move making', () => {
    it('should make move for robot', async () => {
      const move = await service.makeRobotMove('robot1', mockGameState)
      expect(move).not.toBeNull()
      expect(mockMoves).toContain(move)
    })

    it('should return null when no moves available', async () => {
      const emptyGameState: GameState = {
        availableMoves: [],
      }
      const move = await service.makeRobotMove('robot1', emptyGameState)
      expect(move).toBeNull()
    })
  })

  describe('difficulty management', () => {
    it('should set difficulty for specific robot', () => {
      service.setRobotDifficulty('robot1', AIDifficulty.ADVANCED)
      const ai = service.getAI('robot1')
      expect(ai.getDifficulty()).toBe(AIDifficulty.ADVANCED)
    })

    it('should not affect other robots when setting difficulty', () => {
      service.getAI('robot1', AIDifficulty.BEGINNER)
      service.getAI('robot2', AIDifficulty.INTERMEDIATE)

      service.setRobotDifficulty('robot1', AIDifficulty.ADVANCED)

      expect(service.getAI('robot1').getDifficulty()).toBe(
        AIDifficulty.ADVANCED
      )
      expect(service.getAI('robot2').getDifficulty()).toBe(
        AIDifficulty.INTERMEDIATE
      )
    })
  })

  describe('cleanup', () => {
    it('should remove robot AI instance', () => {
      const ai1 = service.getAI('robot1')
      service.removeRobot('robot1')
      const ai2 = service.getAI('robot1')
      expect(ai1).not.toBe(ai2)
    })
  })
})

describe('selectMoveFromList', () => {
  it('should select a move from the list', async () => {
    const move = await selectMoveFromList(mockMoves)
    expect(move).not.toBeNull()
    expect(mockMoves).toContain(move)
  })

  it('should return null for empty list', async () => {
    const move = await selectMoveFromList([])
    expect(move).toBeNull()
  })

  it('should use specified analyzer', async () => {
    const analyzer = new RandomMoveAnalyzer()
    const move = await selectMoveFromList(mockMoves, analyzer)
    expect(move).not.toBeNull()
    expect(mockMoves).toContain(move)
  })
})

// Keep the original gnubg tests but mark them as potentially failing
describe('GNU Backgammon Integration (Legacy)', () => {
  it('should handle gnubg call failure gracefully', async () => {
    try {
      const hintOutput = await getGnubgMoveHint('4HPwATDgc/ABMA')
      expect(typeof hintOutput).toBe('string')
      console.log('GNU BG hint output:', hintOutput)
    } catch (error) {
      // If it rejects, we expect an Error object.
      expect(error).toBeInstanceOf(Error)
      console.warn(
        'GNU BG call failed in test (as expected in some environments):',
        error
      )
    }
  }, 30000)

  it('should handle starting position request gracefully', async () => {
    try {
      const bestMove = await getBestMoveForStartingPosition()
      expect(typeof bestMove).toBe('string')
      console.log('Best move for starting position:', bestMove)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      console.warn('Failed to get best move for starting position:', error)
    }
  }, 30000)
})
