/**
 * Robot response to a resignation offer.
 *
 * CORE's offerResign() records a pending game.resignationOffer; the opponent
 * must accept (game completes at the offered points) or decline (play
 * resumes). When that opponent is a robot, the functions here make the call.
 *
 * Decision rule (money, cubeless): accept an N-point offer iff N covers the
 * robot's expected points from playing on, computed from the engine
 * Evaluation's outcome distribution (win/winGammon/winBackgammon and the loss
 * side). The cube value multiplies the offered points and the played-on
 * expectation equally, so it cancels out of the comparison. Cube leverage and
 * match context are deliberately ignored at this level.
 *
 * Perspective: the offer arrives on the resigner's turn, so every evaluation
 * request is framed from the RESIGNER's side (they are on roll) and mirrored
 * to the robot's perspective. Re-encoding the position with the robot on roll
 * would repeat the bar-swap class of bug; the mirror is pure arithmetic.
 */

import type {
  BackgammonColor,
  BackgammonGame,
  BackgammonPlayer,
} from '@nodots/backgammon-types'
import { GnuBgHints } from '@nodots/gnubg-hints'
import type { Evaluation, HintRequest } from './engine/contract.js'

/** Ties accept: at exact equality the robot is indifferent, and accepting ends
 * the game without variance. */
const EPSILON = 1e-6

export type ResignationResponse = 'accept' | 'decline'

/** Anything that can answer a double hint carrying an Evaluation. */
export interface DoubleHintSource {
  getDoubleHint(req: HintRequest): Promise<{ evaluation: Evaluation }>
}

/**
 * Cubeless expected points for the evaluated player:
 * E = P(win) + P(winGammon) + P(winBackgammon)
 *   - P(lose) - P(loseGammon) - P(loseBackgammon)
 * (the cumulative-probability form of simple*1 + gammon*2 + backgammon*3).
 */
export function expectedPointsFromEvaluation(e: Evaluation): number {
  const lose = 1 - e.win
  return (
    e.win + e.winGammon + e.winBackgammon - lose - e.loseGammon - e.loseBackgammon
  )
}

/** Flip an evaluation to the other player's perspective. */
export function mirrorEvaluation(e: Evaluation): Evaluation {
  return {
    win: 1 - e.win,
    winGammon: e.loseGammon,
    winBackgammon: e.loseBackgammon,
    loseGammon: e.winGammon,
    loseBackgammon: e.winBackgammon,
    equity: -e.equity,
    ...(typeof e.cubefulEquity === 'number'
      ? { cubefulEquity: -e.cubefulEquity }
      : {}),
  }
}

/** Accept iff the offered points cover the expected value of playing on. */
export function respondToResignation(
  robotEvaluation: Evaluation,
  offeredPoints: 1 | 2 | 3
): ResignationResponse {
  const expected = expectedPointsFromEvaluation(robotEvaluation)
  return offeredPoints >= expected - EPSILON ? 'accept' : 'decline'
}

interface OfferContext {
  resigner: BackgammonPlayer
  responder: BackgammonPlayer
  points: 1 | 2 | 3
}

function resolveOfferContext(game: BackgammonGame): OfferContext {
  const offer = game.resignationOffer
  if (!offer) {
    throw new Error(
      `[AI] decideResignationResponse: game ${game.id} has no pending resignation offer`
    )
  }
  const resigner = game.players.find((p) => p.id === offer.offeredById)
  const responder = game.players.find((p) => p.id !== offer.offeredById)
  if (!resigner || !responder) {
    throw new Error(
      `[AI] decideResignationResponse: cannot resolve players for offer by ${offer.offeredById} in game ${game.id}`
    )
  }
  return { resigner, responder, points: offer.points }
}

/**
 * Static-evaluation request framed from the resigner's side. The double
 * decision surface carries no meaningful dice (protocol SPEC); the addon's
 * double path likewise ignores them.
 */
function buildResignerFrame(game: BackgammonGame, resigner: BackgammonPlayer) {
  return {
    activePlayerColor: resigner.color as BackgammonColor,
    activePlayerDirection: resigner.direction,
    cubeValue: game.cube?.value ?? 1,
    cubeOwner: (game.cube?.owner?.color ?? null) as BackgammonColor | null,
    matchScore: [0, 0] as [number, number],
    matchLength: 0,
    crawford: !!game.matchInfo?.isCrawford,
    jacoby: !!game.rules?.useJacobyRule,
    beavers: !!game.rules?.useBeaverRule,
  }
}

/**
 * Decide via the in-process GNU addon, board path. The REAL board goes into
 * the request (never a positionId round-trip -- see the 2026-07-26 stuck-robot
 * incident) and the returned evaluation, which is from the resigner's
 * perspective, is mirrored to the robot before applying the accept rule.
 */
export async function decideResignationResponseWithGNU(
  game: BackgammonGame
): Promise<ResignationResponse> {
  const { resigner, points } = resolveOfferContext(game)
  await GnuBgHints.initialize()
  const hint = await GnuBgHints.getDoubleHint({
    board: game.board,
    dice: [0, 0],
    ...buildResignerFrame(game, resigner),
  })
  const robotEvaluation = mirrorEvaluation(hint.evaluation)
  return respondToResignation(robotEvaluation, points)
}

/**
 * Decide via an AnalysisProvider double hint (the /v1 HTTP path for nn-*
 * robots). The caller supplies the provider and the game's positionId
 * (CORE's opponent-first encoding, same as the move path).
 */
export async function decideResignationResponseWithProvider(
  game: BackgammonGame,
  provider: DoubleHintSource,
  positionId: string
): Promise<ResignationResponse> {
  const { resigner, points } = resolveOfferContext(game)
  const hint = await provider.getDoubleHint({
    positionId,
    dice: [0, 0],
    ...buildResignerFrame(game, resigner),
  })
  const robotEvaluation = mirrorEvaluation(hint.evaluation)
  return respondToResignation(robotEvaluation, points)
}
