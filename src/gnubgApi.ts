import axios from 'axios'

/**
 * ************************************************************************************
 * CRITICAL ARCHITECTURAL DIFFERENCE: NODOTS VS GNU BACKGAMMON
 * ************************************************************************************
 *
 * GNU BACKGAMMON:
 * - Fixed color/direction assignments: White=clockwise, Black=counterclockwise
 * - All Position IDs, move analysis, and AI evaluation assume this standard
 *
 * NODOTS BACKGAMMON:
 * - Random color/direction assignments at game initialization (KEY DIFFERENTIATOR)
 * - Can have: Black=clockwise+White=counterclockwise OR White=clockwise+Black=counterclockwise
 * - Players see unified presentation layer (always "white moving clockwise" view)
 *
 * TRANSFORMATION REQUIRED FOR GNU BG INTEGRATION:
 * When calling GNU Backgammon API, we must:
 * 1. Transform Nodots Position ID to GNU standard format (handled by core library)
 * 2. Transform GNU move responses back to Nodots format
 * 3. Account for color/direction mapping when parsing move suggestions
 *
 * This ensures GNU Backgammon AI works correctly with any Nodots game configuration.
 * ************************************************************************************
 */

/**
 * Calls the GNUBG FastAPI server to get the best move for a given position.
 * @param position - The board position (GNU Position ID in standard format)
 * @returns The raw output from GNUBG as a string
 */
export async function getBestMoveFromGnubg(position: string): Promise<string> {
  try {
    const response = await axios.post<{ output: string }>(
      'http://localhost:8000/best-move',
      { position }
    )
    return response.data.output
  } catch (error: any) {
    // You may want to handle errors more gracefully in production
    throw new Error(
      error.response?.data?.detail ||
        error.message ||
        'Unknown error from GNUBG API'
    )
  }
}
