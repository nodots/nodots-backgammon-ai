/**
 * Robot response to a human resignation offer.
 *
 * The decision rule is cubeless and provider-agnostic: accept an N-point
 * offer iff N covers the robot's expected points from playing on, computed
 * from the engine Evaluation's outcome distribution.
 */

import { beforeEach, describe, expect, it, jest } from '@jest/globals'

const initializeMock = jest.fn().mockResolvedValue(undefined)
const configureMock = jest.fn().mockResolvedValue(undefined)
const getDoubleHintMock = jest.fn()

jest.unstable_mockModule('@nodots/gnubg-hints', () => ({
  GnuBgHints: {
    initialize: initializeMock,
    configure: configureMock,
    getDoubleHint: getDoubleHintMock,
  },
}))

const {
  expectedPointsFromEvaluation,
  mirrorEvaluation,
  respondToResignation,
  decideResignationResponseWithGNU,
  decideResignationResponseWithProvider,
} = await import('../resignation.js')

const evaluation = (overrides: Partial<Record<string, number>> = {}) => ({
  win: 0.5,
  winGammon: 0,
  winBackgammon: 0,
  loseGammon: 0,
  loseBackgammon: 0,
  equity: 0,
  ...overrides,
})

const buildGame = (overrides: Record<string, unknown> = {}) => {
  const human = {
    id: 'human-1',
    color: 'white',
    direction: 'clockwise',
    isRobot: false,
    email: 'ken@nodots.com',
  }
  const robot = {
    id: 'robot-1',
    color: 'black',
    direction: 'counterclockwise',
    isRobot: true,
    email: 'gnu-casual@nodots.com',
  }
  return {
    id: 'game-1',
    stateKind: 'rolling',
    players: [human, robot],
    activePlayer: human,
    inactivePlayer: robot,
    board: { marker: 'real-board' },
    cube: { stateKind: 'initialized', value: undefined, owner: undefined },
    rules: {},
    settings: {},
    resignationOffer: {
      offeredById: 'human-1',
      points: 1,
      offeredAt: new Date(),
    },
    ...overrides,
  } as any
}

describe('expectedPointsFromEvaluation', () => {
  it('is 1 for a certain simple win', () => {
    expect(
      expectedPointsFromEvaluation(evaluation({ win: 1 }) as any)
    ).toBeCloseTo(1)
  })

  it('is 2 for a certain gammon', () => {
    expect(
      expectedPointsFromEvaluation(
        evaluation({ win: 1, winGammon: 1 }) as any
      )
    ).toBeCloseTo(2)
  })

  it('is 3 for a certain backgammon', () => {
    expect(
      expectedPointsFromEvaluation(
        evaluation({ win: 1, winGammon: 1, winBackgammon: 1 }) as any
      )
    ).toBeCloseTo(3)
  })

  it('nets out losses', () => {
    // 70% win (30% of those gammons), 30% loss (no loss gammons):
    // E = win + winGammon - lose = 0.7 + 0.21 - 0.3 = 0.61
    expect(
      expectedPointsFromEvaluation(
        evaluation({ win: 0.7, winGammon: 0.21 }) as any
      )
    ).toBeCloseTo(0.61)
  })
})

describe('mirrorEvaluation', () => {
  it('swaps the win and loss distributions and negates equity', () => {
    const mirrored = mirrorEvaluation(
      evaluation({
        win: 0.8,
        winGammon: 0.4,
        winBackgammon: 0.1,
        loseGammon: 0.05,
        loseBackgammon: 0.01,
        equity: 1.2,
      }) as any
    )
    expect(mirrored.win).toBeCloseTo(0.2)
    expect(mirrored.winGammon).toBeCloseTo(0.05)
    expect(mirrored.winBackgammon).toBeCloseTo(0.01)
    expect(mirrored.loseGammon).toBeCloseTo(0.4)
    expect(mirrored.loseBackgammon).toBeCloseTo(0.1)
    expect(mirrored.equity).toBeCloseTo(-1.2)
  })
})

describe('respondToResignation', () => {
  it('declines 1 point when the robot expects a gammon', () => {
    // 95% win, 80% of them gammons: E = 0.95 + 0.76 - 0.05 = 1.66
    const robotEval = evaluation({ win: 0.95, winGammon: 0.76 }) as any
    expect(respondToResignation(robotEval, 1)).toBe('decline')
    expect(respondToResignation(robotEval, 2)).toBe('accept')
  })

  it('accepts 1 point for a plain winning race', () => {
    const robotEval = evaluation({ win: 0.85 }) as any // E = 0.7
    expect(respondToResignation(robotEval, 1)).toBe('accept')
  })

  it('accepts any offer when the robot is losing', () => {
    const robotEval = evaluation({ win: 0.2, loseGammon: 0.3 }) as any
    expect(respondToResignation(robotEval, 1)).toBe('accept')
  })

  it('declines 2 points when a backgammon is expected', () => {
    const robotEval = evaluation({
      win: 0.99,
      winGammon: 0.97,
      winBackgammon: 0.8,
    }) as any // E = 0.99 + 0.97 + 0.8 - 0.01 = 2.75
    expect(respondToResignation(robotEval, 2)).toBe('decline')
    expect(respondToResignation(robotEval, 3)).toBe('accept')
  })
})

describe('decideResignationResponseWithGNU', () => {
  beforeEach(() => {
    getDoubleHintMock.mockReset()
    initializeMock.mockClear()
  })

  it('declines a 1-point offer when gnubg expects a gammon for the robot', async () => {
    // The request is framed from the RESIGNER's perspective (they are on
    // roll), so a robot gammon shows up in the loss distribution.
    getDoubleHintMock.mockResolvedValue({
      action: 'no-double',
      takePoint: 0,
      dropPoint: 0,
      evaluation: evaluation({
        win: 0.05,
        winGammon: 0,
        loseGammon: 0.8,
      }),
      cubefulEquity: -1.6,
    } as any)

    const decision = await decideResignationResponseWithGNU(buildGame())
    expect(decision).toBe('decline')

    const req = getDoubleHintMock.mock.calls[0][0] as any
    expect(req.board).toEqual({ marker: 'real-board' })
    expect(req.activePlayerColor).toBe('white')
    expect(req.activePlayerDirection).toBe('clockwise')
  })

  it('accepts a 1-point offer in a plain race', async () => {
    getDoubleHintMock.mockResolvedValue({
      action: 'no-double',
      takePoint: 0,
      dropPoint: 0,
      evaluation: evaluation({ win: 0.2 }),
      cubefulEquity: -0.6,
    } as any)

    const decision = await decideResignationResponseWithGNU(buildGame())
    expect(decision).toBe('accept')
  })

  it('accepts a gammon offer that covers the expected gammon', async () => {
    getDoubleHintMock.mockResolvedValue({
      action: 'no-double',
      takePoint: 0,
      dropPoint: 0,
      evaluation: evaluation({ win: 0.05, loseGammon: 0.8 }),
      cubefulEquity: -1.6,
    } as any)

    const game = buildGame()
    game.resignationOffer.points = 2
    const decision = await decideResignationResponseWithGNU(game)
    expect(decision).toBe('accept')
  })

  it('throws when there is no pending offer', async () => {
    const game = buildGame({ resignationOffer: undefined })
    await expect(decideResignationResponseWithGNU(game)).rejects.toThrow(
      'no pending resignation offer'
    )
  })
})

describe('decideResignationResponseWithProvider', () => {
  it('routes through the given provider and mirrors the evaluation', async () => {
    const providerDoubleHint = jest.fn().mockResolvedValue({
      action: 'no-double',
      takePoint: 0,
      dropPoint: 0,
      evaluation: evaluation({ win: 0.05, loseGammon: 0.8 }),
      cubefulEquity: -1.6,
    } as any)
    const provider = { getDoubleHint: providerDoubleHint } as any

    const decision = await decideResignationResponseWithProvider(
      buildGame(),
      provider,
      'test-pid'
    )
    expect(decision).toBe('decline')

    const req = providerDoubleHint.mock.calls[0][0] as any
    expect(req.positionId).toBe('test-pid')
    expect(req.activePlayerColor).toBe('white')
  })
})
