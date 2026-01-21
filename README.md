# 🎮 Lobby Server Template

A production-ready, drop-in multiplayer lobby system built with TypeScript, Socket.IO, and Express.

**Perfect for:** Party games, turn-based games, real-time multiplayer, or any game that needs player lobbies.

![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-black?logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Lobby Codes** — Human-readable codes (ABCD-1234) for easy sharing
- **Real-time Events** — Instant updates via WebSocket
- **Host Controls** — Kick players, change settings, start game
- **Auto-cleanup** — Lobbies close when host leaves
- **Type-safe** — Full TypeScript support with exported interfaces
- **Zero Config** — Works out of the box
- **Demo UI** — Test everything in browser instantly

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/fjord-ps1/lobby-server-template.git
cd lobby-server-template

# Install
npm install

# Run
npm run dev
```

Open `http://localhost:3000` — done.

---

## 📡 Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `lobby:create` | `{ name, playerName, settings? }` | Create a new lobby |
| `lobby:join` | `{ code, playerName }` | Join lobby by code |
| `lobby:leave` | — | Leave current lobby |
| `lobby:kick` | `{ playerId }` | Kick player (host only) |
| `lobby:settings` | `{ maxPlayers?, isPrivate? }` | Update settings (host only) |
| `lobby:start` | — | Start the game (host only) |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `lobby:created` | `{ lobby, player }` | Lobby created successfully |
| `lobby:joined` | `{ lobby, player }` | Joined lobby successfully |
| `lobby:updated` | `{ lobby }` | Lobby state changed |
| `lobby:closed` | `{ reason }` | Lobby was closed |
| `lobby:started` | — | Game started |
| `player:joined` | `{ player }` | New player joined |
| `player:left` | `{ playerId }` | Player left |
| `error` | `{ code, message }` | Something went wrong |

---

## 🔌 Integration Example

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

// Create lobby
socket.emit('lobby:create', {
  name: 'My Game',
  playerName: 'Player1',
  settings: { maxPlayers: 4 }
});

// Listen for creation
socket.on('lobby:created', ({ lobby, player }) => {
  console.log(`Lobby code: ${lobby.code}`);
  // Share this code with friends!
});

// Join existing lobby
socket.emit('lobby:join', {
  code: 'ABCD-1234',
  playerName: 'Player2'
});

// Start game when ready
socket.emit('lobby:start');
```

---

## 📁 Project Structure

```
src/
├── index.ts              # Entry point
├── server.ts             # Express + Socket.IO setup
├── config/
│   └── env.ts            # Environment config
├── types/
│   ├── lobby.ts          # Lobby interfaces
│   ├── player.ts         # Player interfaces
│   └── events.ts         # Socket event types
├── lobby/
│   ├── lobby.manager.ts  # Core lobby logic
│   ├── lobby.model.ts    # Lobby data operations
│   ├── lobby.codes.ts    # Code generation
│   └── lobby.validation.ts
└── realtime/
    ├── socket.ts         # Socket setup
    └── handlers.ts       # Event handlers

public/                   # Demo UI
```

---

## ⚙️ Configuration

Create `.env` file:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |

---

## 🎯 Use Cases

- **Party Games** — Among Us style lobbies
- **Card Games** — Poker, UNO, custom card games
- **Board Games** — Chess, checkers, custom boards
- **Trivia/Quiz** — Kahoot-style games
- **Co-op Games** — Team-based gameplay

---

## 📄 License

MIT — use it however you want.

---

Built with 🇩🇰 by [Fjord](https://github.com/fjord-ps1)
