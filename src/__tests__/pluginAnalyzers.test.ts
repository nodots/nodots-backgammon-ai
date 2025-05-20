import path from 'path'
import { loadAnalyzersFromPluginsDir } from '../pluginLoader'

// Minimal local type for testing
interface TestMove {
  id: string
  player: any
  dieValue: number
  stateKind: string
  moveKind: string
  origin?: { position: { clockwise: number; counterclockwise: number } }
}

describe('Plugin Analyzers', () => {
  const pluginsDir = path.join(__dirname, '../../plugins')
  const analyzers = loadAnalyzersFromPluginsDir(pluginsDir)

  // Minimal mock moves
  const moves: TestMove[] = [
    {
      id: '1',
      player: {} as any,
      dieValue: 6,
      stateKind: 'ready',
      moveKind: 'point-to-point',
      origin: { position: { clockwise: 10, counterclockwise: 15 } },
    },
    {
      id: '2',
      player: {} as any,
      dieValue: 3,
      stateKind: 'ready',
      moveKind: 'point-to-point',
      origin: { position: { clockwise: 20, counterclockwise: 5 } },
    },
    {
      id: '3',
      player: {} as any,
      dieValue: 1,
      stateKind: 'ready',
      moveKind: 'point-to-point',
      origin: { position: { clockwise: 5, counterclockwise: 20 } },
    },
  ]

  it('randomMoveAnalyzer returns one of the moves', async () => {
    const move = await analyzers['randomMoveAnalyzer'].selectMove(moves as any)
    expect(moves).toContain(move)
  })

  it('furthestFromOffMoveAnalyzer returns the move with highest clockwise position', async () => {
    const move = await analyzers['furthestFromOffMoveAnalyzer'].selectMove(
      moves as any
    )
    expect(move).toBe(moves[1]) // clockwise: 20 is highest
  })

  it('examplePluginAnalyzer returns the first move', async () => {
    const move = await analyzers['examplePluginAnalyzer'].selectMove(
      moves as any
    )
    expect(move).toBe(moves[0])
  })
})
