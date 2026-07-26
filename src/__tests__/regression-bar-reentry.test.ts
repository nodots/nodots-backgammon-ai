/**
 * Bar-reentry regression fixtures — REAL addon, REAL board path, NO env gate.
 *
 * Every fixture here is a position from a production game whose robot got
 * STUCK: gnubg planned a normal move while a bar reentry was forced, the
 * no-silent-fallback guard (correctly) refused it, and the robot's turn
 * retried the identical computation forever.
 *
 * Root cause, both times: the positionId round-trip. Core encodes ids
 * opponent-first; the addon's id-based hint path reads gnubg's own
 * on-roll-first order, so bar ownership crossed sides. The robot planner now
 * hands the addon the BOARD (see robotExecution.getPlanForGame), and these
 * tests pin that path against the exact production positions. They run the
 * real native addon at ply-0 — fast and deterministic — and they run in
 * every CI pass. A predecessor of this file covered the 2025 incident but
 * was gated behind RUN_GNUBG_HINTS=1, which nothing ever set; the gate is
 * exactly why the 2026 incident shipped. Do not re-gate these.
 */
import { GnuBgHints } from '@nodots/gnubg-hints'
import * as path from 'node:path'

type Color = 'white' | 'black'

// The suite runs under jest's ESM transform, where require.resolve is not
// available; jest always runs from the package root, so resolve the addon's
// bundled weights relative to cwd.
const WEIGHTS = path.join(
  process.cwd(),
  'node_modules',
  '@nodots',
  'gnubg-hints',
  'gnubg.wd'
)

const mk = (color: Color, n: number) =>
  Array.from({ length: n }, () => ({ color }))

/**
 * Build the board shape convertBoardToGnuBg reads, from own-numbering count
 * maps. `onRoll` plays clockwise (own point p at clockwise p); the opponent
 * plays counterclockwise (own point q at clockwise 25-q).
 */
function boardFrom(
  onRollColor: Color,
  onRollOwn: Record<number, number>,
  opponentOwn: Record<number, number>,
  onRollBar: number
) {
  const oppColor: Color = onRollColor === 'white' ? 'black' : 'white'
  const points = []
  for (let cw = 1; cw <= 24; cw++) {
    const mine = onRollOwn[cw] ?? 0
    const theirs = opponentOwn[25 - cw] ?? 0
    points.push({
      position: { clockwise: cw, counterclockwise: 25 - cw },
      checkers:
        mine > 0 ? mk(onRollColor, mine) : theirs > 0 ? mk(oppColor, theirs) : [],
    })
  }
  return {
    points,
    bar: {
      clockwise: { checkers: mk(onRollColor, onRollBar) },
      counterclockwise: { checkers: [] },
    },
    off: {
      clockwise: { checkers: [] },
      counterclockwise: { checkers: [] },
    },
  }
}

async function planFor(
  board: ReturnType<typeof boardFrom>,
  dice: [number, number],
  activePlayerColor: Color
) {
  const hints = await GnuBgHints.getMoveHints(
    {
      // Structural board shape shared with core; the addon declares its own
      // HintBoard type for it.
      board: board as unknown as Parameters<
        typeof GnuBgHints.getMoveHints
      >[0]['board'],
      dice,
      activePlayerColor,
      activePlayerDirection: 'clockwise',
      cubeValue: 1,
      cubeOwner: null,
      matchScore: [0, 0],
      matchLength: 0,
      crawford: false,
      jacoby: false,
      beavers: false,
    },
    3
  )
  const moves = hints[0]?.moves ?? []
  return {
    moves,
    barMoves: moves.filter((m: { fromContainer?: string }) => m.fromContainer === 'bar'),
  }
}

beforeAll(async () => {
  await GnuBgHints.initialize(WEIGHTS)
  GnuBgHints.configure({ evalPlies: 0, noise: 0 })
}, 30000)

describe('production stuck-game regressions: forced bar reentry is planned', () => {
  it('2026-07-26 game 6a2ce41f: one checker on the bar, only the 5 enters (bar/20)', async () => {
    // Robot (black, clockwise) on roll with 1 on the bar. Entry with the 5
    // lands on own-20; the position id round-trip told gnubg the OPPONENT was
    // on the bar and it planned 10/5 — a move only the opponent could make.
    const board = boardFrom(
      'black',
      { 4: 2, 6: 5, 8: 1, 9: 1, 11: 1, 13: 3, 20: 1 },
      { 4: 2, 6: 3, 8: 3, 10: 1, 13: 4, 20: 2 },
      1
    )
    for (const dice of [
      [5, 4],
      [5, 3],
      [5, 1],
    ] as [number, number][]) {
      const { moves, barMoves } = await planFor(board, dice, 'black')
      expect(barMoves.length).toBeGreaterThanOrEqual(1)
      expect(barMoves[0].to).toBe(20)
      // Second die is free once entered: the plan must use it.
      expect(moves.length).toBe(2)
    }
  })

  it('2025 game (pid 3wtBIGCV96QCAA): two on the bar, 5-entry blocked — enter with the 2, dance the 5', async () => {
    const board = boardFrom(
      'white',
      { 1: 5, 2: 4, 3: 1, 7: 1, 12: 1, 18: 1 },
      { 1: 1, 2: 1, 3: 1, 5: 4, 6: 4, 8: 1, 10: 1, 11: 1, 12: 1 },
      2
    )
    const { moves, barMoves } = await planFor(board, [5, 2], 'white')
    // Both checkers must enter before anything else; only the 2 can. The
    // whole legal play is one entry — the 5 dances.
    expect(barMoves.length).toBe(1)
    expect(barMoves[0].to).toBe(23)
    expect(moves.length).toBe(1)
  })
})
