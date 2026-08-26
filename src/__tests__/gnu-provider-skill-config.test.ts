/**
 * Regression: GNUAIProvider must forward the robot's skillConfig to
 * executeRobotTurnWithGNU.
 *
 * The provider split (#287/#288) dropped the second argument, so every GNU
 * robot — Beginner through Grandmaster — played at DEFAULT_HINTS_CONFIG
 * (full-strength, deterministic 2-ply). That also made the PR analyzer score
 * the robot 0.0 in every game, since the robot's move was by construction the
 * analyzer's rank-1 hint.
 */

import { jest } from '@jest/globals'

const executeRobotTurnWithGNUMock = jest
  .fn<any>()
  .mockResolvedValue({ stateKind: 'rolling' })

jest.unstable_mockModule('../robotExecution.js', () => ({
  executeRobotTurnWithGNU: executeRobotTurnWithGNUMock,
  DEFAULT_HINTS_CONFIG: {},
}))

const { GNUAIProvider } = await import('../GNUAIProvider.js')

const beginnerSkillConfig = {
  evalPlies: 1,
  moveFilter: 1,
  noise: 0,
  usePruning: true,
  skillLevel: 'beginner',
}

const makeGame = (robotProfile?: Record<string, unknown>) =>
  ({
    id: 'game-test',
    stateKind: 'moving',
    activePlayer: {
      color: 'black',
      isRobot: true,
      ...(robotProfile !== undefined ? { robotProfile } : {}),
    },
  }) as any

describe('GNUAIProvider skillConfig plumbing', () => {
  beforeEach(() => {
    executeRobotTurnWithGNUMock.mockClear()
  })

  test('forwards robotProfile.skillConfig to executeRobotTurnWithGNU', async () => {
    const game = makeGame({
      nickname: 'GNU Beginner',
      email: 'gnu-beginner@nodots.com',
      skillConfig: beginnerSkillConfig,
    })

    await new GNUAIProvider().executeRobotTurn(game)

    expect(executeRobotTurnWithGNUMock).toHaveBeenCalledTimes(1)
    expect(executeRobotTurnWithGNUMock).toHaveBeenCalledWith(
      game,
      beginnerSkillConfig
    )
  })

  test('passes null when the player has no robotProfile', async () => {
    const game = makeGame()

    await new GNUAIProvider().executeRobotTurn(game)

    expect(executeRobotTurnWithGNUMock).toHaveBeenCalledWith(game, null)
  })

  test('passes null when the profile has no skillConfig', async () => {
    const game = makeGame({ email: 'gbg-bot@nodots.com', skillConfig: null })

    await new GNUAIProvider().executeRobotTurn(game)

    expect(executeRobotTurnWithGNUMock).toHaveBeenCalledWith(game, null)
  })

  test('still rejects non-robot active players', async () => {
    const game = makeGame()
    game.activePlayer.isRobot = false

    await expect(new GNUAIProvider().executeRobotTurn(game)).rejects.toThrow(
      /requires active player to be a robot/
    )
    expect(executeRobotTurnWithGNUMock).not.toHaveBeenCalled()
  })
})
