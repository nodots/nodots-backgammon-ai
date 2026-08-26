/**
 * GNU Backgammon AI Provider
 *
 * Handles all GNU-based robots using the native gnubg-hints addon.
 * Registered for gnu-* and gbg-bot email patterns.
 */

import type {
  BackgammonGame,
  BackgammonGameMoving,
  BackgammonGameRolling,
  BackgammonPlayMoving,
  BackgammonMoveReady,
} from '@nodots/backgammon-types'
import type { RobotAIProvider } from '@nodots/backgammon-core'
import type { SkillConfig } from '@nodots/backgammon-api-utils'
import { executeRobotTurnWithGNU } from './robotExecution.js'
import {
  decideResignationResponseWithGNU,
  type ResignationResponse,
} from './resignation.js'

export class GNUAIProvider implements RobotAIProvider {
  async executeRobotTurn(
    game: BackgammonGameMoving
  ): Promise<BackgammonGameRolling> {
    if (!game.activePlayer.isRobot) {
      throw new Error(
        `GNUAIProvider requires active player to be a robot, but got isRobot=${game.activePlayer.isRobot}`
      )
    }
    // cast: robotProfile is an out-of-band routing field attached to the
    // active player by the API layer (attachRobotProfile); it is not part of
    // the BackgammonPlayer type. Same access pattern as core's
    // Game/executeRobotTurn.ts.
    const skillConfig =
      ((game.activePlayer as Record<string, any>).robotProfile
        ?.skillConfig as SkillConfig | null | undefined) ?? null
    return executeRobotTurnWithGNU(game, skillConfig)
  }

  async selectBestMove(
    play: BackgammonPlayMoving,
    _playerUserId?: string
  ): Promise<BackgammonMoveReady | undefined> {
    const { selectBestMove } = await import('./moveSelection.js')
    return selectBestMove(play)
  }

  async decideResignationResponse(
    game: BackgammonGame
  ): Promise<ResignationResponse> {
    return decideResignationResponseWithGNU(game)
  }
}
