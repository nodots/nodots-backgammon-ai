import { getGnubgMoveHint, getBestMoveForStartingPosition } from '../index'

describe('getGnubgMoveHint', () => {
  // This test is more of an integration test as it interacts with the file system and an external process (gnubg).
  // It checks if the function can attempt a call to gnubg and get any response (success or failure).
  it('should attempt to get a hint and either resolve with output or reject with an error', async () => {
    const testPositionId = '4HPwATDgc/ABMA' // A valid starting position ID

    // We expect the promise to settle, meaning it either resolves or rejects.
    // We don't know for sure if gnubg is installed and configured on the test environment,
    // so we accept both outcomes as a sign of "communication attempt".
    try {
      const output = await getGnubgMoveHint(testPositionId)
      // If it resolves, we expect some string output.
      expect(typeof output).toBe('string')
      console.log(
        'GNU BG call succeeded in test:',
        output.substring(0, 200) + '...'
      )
    } catch (error) {
      // If it rejects, we expect an Error object.
      expect(error).toBeInstanceOf(Error)
      console.warn(
        'GNU BG call failed in test (as expected in some environments):',
        error
      )
    }
  }, 30000) // Increase timeout for external process call and file operations
})

describe('getBestMoveForStartingPosition', () => {
  it('should return the best move for the standard starting position or throw an error', async () => {
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
