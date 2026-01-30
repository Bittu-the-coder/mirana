# Mirana 🧠

A full-stack brain training and puzzle community platform.

## Features

- **Solo Games**: 8 interactive brain training games
  - Sliding Puzzle, Daily Mystery Word, Number Pyramid
  - Memory Path, Color Memory, Pattern Spotter
  - Letter Maze, Balance Puzzle

- **Multiplayer**: Real-time competitive games
  - Speed Math Duel, Riddle Arena
  - Memory Match Battle, Word Chain
  - Auto-matchmaking & friend invites

- **Puzzle Community**: Create, share, and solve puzzles
  - Categories: Riddle, Logic, Math, Word, Visual
  - Comments, upvotes, leaderboards

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, Tailwind CSS, shadcn/ui |
| Backend | NestJS, Socket.IO |
| Database | MongoDB |
| Auth | JWT |

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MongoDB

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mirana.git
cd mirana

# Install backend dependencies
cd backend
pnpm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Install frontend dependencies
cd ../frontend
pnpm install
```

### Running Locally

```bash
# Terminal 1 - Backend
cd backend
pnpm run start:dev

# Terminal 2 - Frontend
cd frontend
pnpm dev
```

Visit `http://localhost:3000`

## Project Structure

```
mirana/
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/         # JWT authentication
│   │   ├── users/        # User profiles & stats
│   │   ├── games/        # Game scores
│   │   ├── puzzles/      # Community puzzles
│   │   ├── comments/     # Puzzle comments
│   │   ├── leaderboard/  # Rankings
│   │   └── multiplayer/  # Socket.IO gateway
│   └── ...
├── frontend/         # Next.js app
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # UI components
│   │   └── lib/          # Utils, API, contexts
│   └── ...
└── README.md
```

## License

MIT
