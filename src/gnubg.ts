import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * GNU Backgammon integration utility class
 * Provides methods to interact with gnubg either through local build or system installation
 */
export class GnubgIntegration {
  private gnubgPath: string | null = null
  private isInitialized = false

  constructor() {
    // Will be initialized on first use
  }

  /**
   * Initialize gnubg integration by detecting available gnubg installations
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Try to find gnubg in order of preference:
    // 1. Local build in gnubg directory
    // 2. System-wide installation
    const candidates = [
      path.join(process.cwd(), 'gnubg', 'gnubg'), // Local build
      path.join(__dirname, '..', 'gnubg', 'gnubg'), // Relative to src
      'gnubg', // System PATH
    ]

    for (const candidate of candidates) {
      try {
        if (candidate === 'gnubg') {
          // Test system installation
          await execAsync('which gnubg')
          this.gnubgPath = 'gnubg'
          break
        } else {
          // Test local file
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            // Check if executable
            try {
              fs.accessSync(candidate, fs.constants.X_OK)
              this.gnubgPath = candidate
              break
            } catch {
              // Not executable, continue
            }
          }
        }
      } catch {
        // Continue to next candidate
      }
    }

    this.isInitialized = true
  }

  /**
   * Get the path to gnubg executable
   */
  async getGnubgPath(): Promise<string | null> {
    await this.initialize()
    return this.gnubgPath
  }

  /**
   * Check if gnubg is available
   */
  async isAvailable(): Promise<boolean> {
    await this.initialize()
    return this.gnubgPath !== null
  }

  /**
   * Get gnubg version information
   */
  async getVersion(): Promise<string> {
    await this.initialize()
    if (!this.gnubgPath) {
      throw new Error('gnubg is not available')
    }

    try {
      const { stdout } = await execAsync(`${this.gnubgPath} --version`)
      return stdout.trim()
    } catch (error) {
      throw new Error(`Failed to get gnubg version: ${error}`)
    }
  }

  /**
   * Execute a gnubg command and return the output
   */
  async executeCommand(commands: string[]): Promise<string> {
    await this.initialize()
    if (!this.gnubgPath) {
      throw new Error(
        'gnubg is not available. Please build gnubg first using: npm run gnubg:configure && npm run gnubg:build'
      )
    }

    const commandString = commands.join('\n')
    const gnubgCommand = `echo "${commandString}" | ${this.gnubgPath} -t`

    try {
      const { stdout, stderr } = await execAsync(gnubgCommand)
      if (stderr) {
        console.warn('gnubg stderr:', stderr)
      }
      return stdout
    } catch (error) {
      throw new Error(`Failed to execute gnubg command: ${error}`)
    }
  }

  /**
   * Analyze a position and get the best move
   */
  async getBestMove(positionId: string): Promise<string> {
    const commands = ['new game', `set board ${positionId}`, 'hint']

    const output = await this.executeCommand(commands)
    return this.parseBestMoveFromHint(output)
  }

  /**
   * Parse the best move from gnubg hint output
   */
  private parseBestMoveFromHint(hintOutput: string): string {
    const lines = hintOutput.split('\n')

    // Look for the best move line (usually starts with "1. ")
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

    throw new Error('Could not parse best move from gnubg output')
  }

  /**
   * Check if local gnubg build exists
   */
  async hasLocalBuild(): Promise<boolean> {
    const localPath = path.join(process.cwd(), 'gnubg', 'gnubg')
    try {
      const stat = fs.statSync(localPath)
      return stat.isFile()
    } catch {
      return false
    }
  }

  /**
   * Get build instructions if gnubg is not available
   */
  getBuildInstructions(): string {
    return `
GNU Backgammon (gnubg) is not available. To build it locally:

1. Install dependencies (macOS with Homebrew):
   brew install autoconf automake libtool pkg-config glib readline sqlite

2. Configure and build (minimal configuration for AI use):
   npm run gnubg:configure
   npm run gnubg:build

3. Optional - install system-wide:
   npm run gnubg:install

For other systems, see the README.md for detailed instructions.
    `.trim()
  }
}

// Export singleton instance for convenience
export const gnubg = new GnubgIntegration()

// Legacy exports for backwards compatibility
export { gnubg as default }
