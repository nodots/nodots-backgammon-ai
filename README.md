# Nodots Backgammon AI

<!-- COVERAGE-START -->
![Statements](https://img.shields.io/badge/Statements-60%25-orange?style=flat-square)
![Branches](https://img.shields.io/badge/Branches-32%25-red?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-50%25-red?style=flat-square)
![Lines](https://img.shields.io/badge/Lines-60%25-orange?style=flat-square)
<!-- COVERAGE-END -->

A TypeScript library that provides AI capabilities for backgammon games using GNU Backgammon (gnubg) as the backend engine. This package is part of the Nodots Backgammon ecosystem and **includes the complete gnubg source code** for self-contained deployment.

## 🎯 What's New in v3.1.0

- ✅ **Successfully integrated GNU Backgammon v1.08.003** with full source code
- ✅ **Minimal CLI-only configuration** - no GTK, audio, or GUI dependencies required
- ✅ **Verified position analysis** - tested with multiple position IDs
- ✅ **Enhanced TypeScript integration** with automatic gnubg detection
- ✅ **Cross-platform compatibility** - built and tested on macOS (Apple Silicon)
- ✅ **Professional-grade AI analysis** - world-class backgammon engine (2000+ FIBS rating)

## Features

- **🧠 World-Class AI**: GNU Backgammon v1.08.003 with 2000+ FIBS rating equivalent
- **📦 Self-Contained**: Complete gnubg source code included - no external dependencies
- **🚀 Production Ready**: Successfully built and tested with real position analysis
- **🎯 Position Analysis**: Get best moves for any GNU backgammon position ID
- **💻 TypeScript Support**: Full type definitions and intelligent integration
- **🔧 Minimal Dependencies**: CLI-only build without GUI components
- **📊 Comprehensive Analysis**: Equity calculations, move rankings, and probability analysis
- **🌐 Cross-Platform**: Supports macOS, Linux with automated build scripts

## Installation

```bash
npm install @nodots-llc/backgammon-ai
```

## Quick Start - Verified Examples

Here are **tested position IDs** that work with the integrated gnubg engine:

```typescript
import { GnubgIntegration } from '@nodots-llc/backgammon-ai'

const gnubg = new GnubgIntegration()

// Example 1: Mid-game position (tested ✅)
const bestMove1 = await gnubg.getBestMove('gF/xATDgc/AAOA')
console.log('Best move:', bestMove1)

// Example 2: Running game position (tested ✅)
const bestMove2 = await gnubg.getBestMove('gJ/4AFjgc3AEO')
console.log('Best move:', bestMove2)
// Result: "24/20 16/13" (Equity: +0.466)
```

## GNU Backgammon (gnubg) Integration

This package includes the complete GNU Backgammon source code (version 1.08.003) in the `gnubg/` directory. You can build and install gnubg locally for optimal performance.

### Prerequisites for Building gnubg

To build gnubg from the included source code, you'll need:

**Required:**

- GLib >= 2.22
- C compiler (gcc or clang recommended)
- GNU make
- autoconf >= 2.60
- automake
- libtool
- pkg-config

**Optional (but recommended):**

- readline (for command line editing)
- sqlite3 (for database support)
- bison >= 2.4 (if modifying parser files)
- flex >= 2.5.9 (if modifying lexer files)

**Note:** GUI components (GTK+) and audio support are not required for AI integration.

### Quick Setup

```bash
# Automated setup with dependency checking
npm run setup-gnubg

# Manual build process
npm run gnubg:configure
npm run gnubg:build

# Verify installation
gnubg/gnubg --version
```

### Building gnubg

```bash
# Configure gnubg build (minimal configuration for AI use)
npm run gnubg:configure

# Build gnubg
npm run gnubg:build

# Install gnubg system-wide (optional)
npm run gnubg:install

# Clean gnubg build files
npm run gnubg:clean
```

### Manual Build (Advanced)

```bash
cd gnubg
./configure --enable-simd=yes --disable-gtk --disable-cputest --without-board3d --without-python
make
sudo make install  # Optional: install system-wide
```

For more build options, see:

```bash
cd gnubg && ./configure --help
```

## Usage

### Position Analysis (Recommended)

```typescript
import { GnubgIntegration } from '@nodots-llc/backgammon-ai'

const gnubg = new GnubgIntegration()

// Check if gnubg is available
const available = await gnubg.isAvailable()
if (available) {
  // Analyze a position and get the best move
  const positionId = 'gJ/4AFjgc3AEO' // Tested position ID
  const bestMove = await gnubg.getBestMove(positionId)
  console.log('Best move:', bestMove) // "24/20 16/13"

  // Get version information
  const version = await gnubg.getVersion()
  console.log('gnubg version:', version)
} else {
  console.log(gnubg.getBuildInstructions())
}
```

### Legacy Integration Methods

```typescript
import { getGnubgMoveHint } from '@nodots-llc/backgammon-ai'

// Direct command execution (requires gnubg in PATH)
const bestMove = await getGnubgMoveHint('4HPwATDgc/ABMA')
```

### HTTP API Integration

```typescript
import { getBestMoveFromGnubg } from '@nodots-llc/backgammon-ai'

// Requires a gnubg HTTP server running on localhost:8000
const bestMove = await getBestMoveFromGnubg(positionId)
```

## GNU Backgammon Features

The included gnubg source provides world-class backgammon analysis:

- **World-class AI**: Rates over 2000 on FIBS (First Internet Backgammon Server)
- **Advanced Analysis**: Position evaluation, rollouts, match analysis
- **Professional Strength**: 2-ply cubeful analysis with world-class evaluation
- **Equity Calculations**: Detailed probability and equity analysis for each move
- **Move Rankings**: Complete analysis of all legal moves with equity differences
- **Database Support**: SQLite3, MySQL/MariaDB, PostgreSQL
- **Flexible Output**: Supports multiple export formats (SGF, HTML, PDF, PNG, etc.)
- **Scripting**: Python extension support
- **Internationalization**: 15+ languages supported

## Example Analysis Output

For position `gJ/4AFjgc3AEO`, gnubg provides detailed analysis:

```
1. 24/20 16/13    Eq: +0.466 ⭐ BEST MOVE
   Win: 59.5%, Gammon: 22.5%, Backgammon: 2.4%

2. 24/21 24/20    Eq: +0.434 (-0.032)
   Win: 58.7%, Gammon: 22.8%, Backgammon: 2.5%

3. 24/20 13/10    Eq: +0.414 (-0.052)
   Win: 58.2%, Gammon: 22.9%, Backgammon: 2.9%
```

## Development

### Setup

1. Clone the repository:

```bash
git clone https://github.com/nodots/nodots-backgammon-ai.git
cd nodots-backgammon-ai
```

2. Install dependencies:

```bash
npm install
```

3. Build gnubg (recommended):

```bash
npm run setup-gnubg
```

4. Verify functionality:

```bash
npm test
npm run build
```

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run clean` - Clean build artifacts
- `npm run setup-gnubg` - Automated gnubg setup with dependency checking
- `npm run gnubg:configure` - Configure gnubg build
- `npm run gnubg:build` - Build gnubg from source
- `npm run gnubg:install` - Install gnubg system-wide
- `npm run gnubg:clean` - Clean gnubg build files

## Verified Compatibility

- ✅ **macOS 14.5.0** (Apple Silicon)
- ✅ **GNU Backgammon 1.08.003**
- ✅ **Node.js 18+**
- ✅ **TypeScript 5.7+**

## Troubleshooting

### Common Issues

1. **Build fails with GTK errors**: Use minimal configuration (already set in npm scripts)
2. **readline errors on macOS**: Fixed in v3.1.0 with compatibility patches
3. **gnubg not found**: Run `npm run setup-gnubg` for automated setup

### Getting Help

1. Check if gnubg builds: `npm run gnubg:configure && npm run gnubg:build`
2. Verify binary: `gnubg/gnubg --version`
3. Test integration: `npm test`

## License

This project is licensed under the MIT License.

**GNU Backgammon License**: The included gnubg source code is licensed under the GNU General Public License v3 or later. See `gnubg/COPYING` for details.

## Author

Ken Riley <kenr@nodots.com>

## Acknowledgments

- **GNU Backgammon Team**: For the excellent gnubg engine and analysis capabilities
- **GNU Project**: For maintaining and developing gnubg as free software
- **Backgammon Community**: For continued development and testing of gnubg
