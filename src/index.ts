// Entry point for nodots-backgammon-ai
import { exec } from 'child_process'
import { join } from 'path'
import { BackgammonMoveBase } from '../../nodots-backgammon-types/src/move'
import {
  FurthestFromOffMoveAnalyzer,
  MoveAnalyzer,
  RandomMoveAnalyzer,
  StrategicMoveAnalyzer,
} from './moveAnalyzers'

/**
 * Gets the path to the local gnubg executable
 */
function getGnubgPath(): string {
  // Path to the local gnubg executable relative to this file
  const gnubgPath = join(__dirname, '..', 'gnubg', 'gnubg')
  return gnubgPath
}

/**
 * AI difficulty levels for robot players
 */
export enum AIDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

/**
 * Game state interface for AI decision making
 */
export interface GameState {
  positionId?: string
  board?: any
  currentPlayer?: string
  availableMoves?: BackgammonMoveBase[]
  gamePhase?: 'opening' | 'middle' | 'race' | 'bearoff'
}

/**
 * Main BackgammonAI class for robot automation
 */
export class BackgammonAI {
  private difficulty: AIDifficulty
  private moveAnalyzer: MoveAnalyzer

  constructor(difficulty: AIDifficulty = AIDifficulty.INTERMEDIATE) {
    this.difficulty = difficulty
    this.moveAnalyzer = this.createMoveAnalyzer(difficulty)
  }

  /**
   * Creates appropriate move analyzer based on difficulty
   */
  private createMoveAnalyzer(difficulty: AIDifficulty): MoveAnalyzer {
    switch (difficulty) {
      case AIDifficulty.BEGINNER:
        return new RandomMoveAnalyzer()
      case AIDifficulty.INTERMEDIATE:
        return new FurthestFromOffMoveAnalyzer()
      case AIDifficulty.ADVANCED:
        return new StrategicMoveAnalyzer()
      default:
        return new RandomMoveAnalyzer()
    }
  }

  /**
   * Get the best move for the current game state
   * @param gameState Current game state
   * @returns Promise resolving to the best move or null if no moves available
   */
  async getBestMove(gameState: GameState): Promise<BackgammonMoveBase | null> {
    if (!gameState.availableMoves || gameState.availableMoves.length === 0) {
      return null
    }

    const context = {
      board: gameState.board,
      positionId: gameState.positionId,
      gamePhase: gameState.gamePhase,
      currentPlayer: gameState.currentPlayer,
    }

    return this.moveAnalyzer.selectMove(gameState.availableMoves, context)
  }

  /**
   * Set AI difficulty level
   */
  setDifficulty(difficulty: AIDifficulty): void {
    this.difficulty = difficulty
    this.moveAnalyzer = this.createMoveAnalyzer(difficulty)
  }

  /**
   * Get current AI difficulty
   */
  getDifficulty(): AIDifficulty {
    return this.difficulty
  }

  /**
   * Check if AI should make a move automatically
   * @param gameState Current game state
   * @returns true if AI should make a move
   */
  shouldMakeMove(gameState: GameState): boolean {
    // Basic logic: if it's the AI player's turn and there are available moves
    return !!(gameState.availableMoves && gameState.availableMoves.length > 0)
  }
}

/**
 * Robot AI Service for game automation
 */
export class RobotAIService {
  private aiInstances: Map<string, BackgammonAI> = new Map()

  /**
   * Create or get AI instance for a robot player
   */
  getAI(
    robotId: string,
    difficulty: AIDifficulty = AIDifficulty.INTERMEDIATE
  ): BackgammonAI {
    if (!this.aiInstances.has(robotId)) {
      this.aiInstances.set(robotId, new BackgammonAI(difficulty))
    }
    return this.aiInstances.get(robotId)!
  }

  /**
   * Make a move for a robot player
   */
  async makeRobotMove(
    robotId: string,
    gameState: GameState
  ): Promise<BackgammonMoveBase | null> {
    const ai = this.getAI(robotId)
    return ai.getBestMove(gameState)
  }

  /**
   * Set difficulty for a specific robot
   */
  setRobotDifficulty(robotId: string, difficulty: AIDifficulty): void {
    const ai = this.getAI(robotId)
    ai.setDifficulty(difficulty)
  }

  /**
   * Remove AI instance for a robot (cleanup)
   */
  removeRobot(robotId: string): void {
    this.aiInstances.delete(robotId)
  }
}

/**
 * Parses the output from gnubg 'hint' command to extract the best move string.
 * Assumes the best move is on the line starting with '1. ' and contains a move like '8/4 6/4'.
 * @param hintOutput The raw output from gnubg.
 * @returns The best move string, or null if not found.
 */
function parseBestMoveFromHint(hintOutput: string): string | null {
  const lines = hintOutput.split('\n')
  for (const line of lines) {
    const match = line.match(
      /^\s*1\.\s+[^\s]+\s+[^\s]+\s+((?:[a-zA-Z0-9*]+\/[a-zA-Z0-9*]+(?:\*|)?\s*)+)/
    )
    if (match) {
      return match[1].trim()
    }
  }
  // Fallback: look for "gnubg moves ..." line
  for (const line of lines) {
    const match = line.match(/gnubg moves ([\w/* ]+)\./i)
    if (match) {
      return match[1].trim()
    }
  }
  return null
}

/**
 * Calls GNU Backgammon to get the best move for a given position ID.
 * Note: This function may not work reliably due to gnubg setup issues.
 * Consider using the BackgammonAI class instead for robot automation.
 *
 * @param positionId The GNU Backgammon Position ID.
 * @returns A promise that resolves with the best move string (e.g., '8/4 6/4').
 * @throws Error if gnubg execution fails or if the best move cannot be parsed.
 */
export async function getGnubgMoveHint(positionId: string): Promise<string> {
  const commands = `new game\nset board ${positionId}\nhint`
  const gnubgPath = getGnubgPath()

  return new Promise((resolve, reject) => {
    // Use the local gnubg executable with text mode
    const gnubgCommand = `"${gnubgPath}" -t`

    // Pipe commands to gnubg via stdin
    exec(
      `printf "${commands}\\nquit\\n" | ${gnubgCommand}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing gnubg: ${error.message}`)
          console.error(`gnubg stderr: ${stderr}`)
          reject(
            new Error(`Failed to execute gnubg. ${stderr || error.message}`)
          )
          return
        }
        // Log the actual gnubg output for debugging
        console.log(
          '\n--- GNU BG Output ---\n' +
            stdout +
            '\n--- End of GNU BG Output ---\n'
        )
        const bestMove = parseBestMoveFromHint(stdout)
        if (!bestMove) {
          reject(new Error('Could not parse best move from gnubg output.'))
          return
        }
        console.log('Best move:', bestMove)
        resolve(bestMove)
      }
    )
  })
}

/**
 * Gets the best move for the standard starting position.
 * @returns A promise that resolves with the best move string.
 */
export async function getBestMoveForStartingPosition(): Promise<string> {
  const startingPositionId = '4HPwATDgc/ABMA' // Standard starting position
  return getGnubgMoveHint(startingPositionId)
}

/**
 * Selects a move from a list using the specified analyzer (defaults to random).
 * @param moves List of BackgammonMoveBase
 * @param analyzer Optional MoveAnalyzer (defaults to RandomMoveAnalyzer)
 * @returns The selected move, or null if the list is empty
 */
export async function selectMoveFromList(
  moves: BackgammonMoveBase[],
  analyzer?: MoveAnalyzer
): Promise<BackgammonMoveBase | null> {
  const moveAnalyzer = analyzer || new RandomMoveAnalyzer()
  return moveAnalyzer.selectMove(moves)
}

// Export the main classes and types
export {
  FurthestFromOffMoveAnalyzer,
  MoveAnalyzer,
  RandomMoveAnalyzer,
  StrategicMoveAnalyzer,
} from './moveAnalyzers'
export { loadAnalyzersFromPluginsDir } from './pluginLoader'

// Default export for convenience
export default BackgammonAI
