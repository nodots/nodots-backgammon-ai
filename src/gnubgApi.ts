import axios from 'axios'

/**
 * Calls the GNUBG FastAPI server to get the best move for a given position.
 * @param position - The board position (e.g., XGID string)
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
