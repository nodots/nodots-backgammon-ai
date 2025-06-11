# Nodots Backgammon AI

<!-- COVERAGE-START -->

![Statements](https://img.shields.io/badge/Statements-0%25-red?style=flat-square)
![Branches](https://img.shields.io/badge/Branches-0%25-red?style=flat-square)
![Functions](https://img.shields.io/badge/Functions-0%25-red?style=flat-square)
![Lines](https://img.shields.io/badge/Lines-0%25-red?style=flat-square)

<!-- COVERAGE-END -->

A TypeScript library that provides AI capabilities for backgammon games using GNU Backgammon (gnubg) as the backend engine. This package is part of the Nodots Backgammon ecosystem.

## Features

- Integration with GNU Backgammon (gnubg) engine
- TypeScript support with full type definitions
- Comprehensive test coverage
- Built on top of @nodots-llc/backgammon-core

## Installation

```bash
npm install @nodots-llc/backgammon-ai
```

## Prerequisites

This package requires GNU Backgammon (gnubg) to be installed on your system. Please refer to the [GNU Backgammon documentation](https://www.gnu.org/software/gnubg/) for installation instructions.

## Usage

```typescript
import { BackgammonAI } from '@nodots-llc/backgammon-ai'

// Initialize the AI
const ai = new BackgammonAI()

// Get AI move suggestions
const move = await ai.getBestMove(gameState)
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

### Available Scripts

- `npm run build` - Build the project
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run clean` - Clean build artifacts

## License

MIT © [Nodots LLC](https://nodots.com)

## Author

Ken Riley <kenr@nodots.com>
