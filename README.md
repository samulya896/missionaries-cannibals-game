# missionaries-cannibal-game

A browser-based implementation of the classic **Missionaries and Cannibals** river-crossing puzzle, built with React and Vite. Transport everyone safely across the river — without ever letting the cannibals outnumber the missionaries.

---

## Game Features

- ⛵ **Classic River-Crossing Puzzle** — Move missionaries and cannibals across a river using a boat that carries at most 2 people
- ⚖️ **Safety Constraint** — If cannibals ever outnumber missionaries on either bank, the missionaries are eaten and the game is lost
- 🚫 **Invalid Move Detection** — Illegal moves are blocked or flagged immediately with feedback
- 🔢 **Move Counter** — Tracks how many moves you've taken; try to solve it in the minimum 11 moves
- 🔄 **Restart** — Reset the puzzle at any time and try a different approach
- 🏁 **Win Detection** — The game recognises when all characters have crossed safely and congratulates you
- 📱 **Responsive Design** — Playable on desktop and mobile browsers

---

## Requirements

- **Node.js** >= 18.x ([download](https://nodejs.org/))
- **npm** >= 9.x (bundled with Node.js)

See [REQUIREMENTS.md](./REQUIREMENTS.md) for a full dependency list.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The app will be available at **http://localhost:5173** (or the next available port).

---

## Available Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Start the Vite development server with HMR       |
| `npm run build`   | Build the app for production (outputs to `dist/`)|
| `npm run preview` | Preview the production build locally             |
| `npm run lint`    | Run ESLint across the project                    |

---

## Project Structure

```
my-game/
├── public/          # Static assets (favicon, etc.)
├── src/             # Application source code
│   └── main.jsx     # Entry point
├── index.html       # HTML shell
├── vite.config.js   # Vite configuration
├── eslint.config.js # ESLint configuration
├── package.json     # Project metadata and scripts
└── REQUIREMENTS.md  # Dependency requirements
```

---

## Tech Stack

- **[React 19](https://react.dev/)** — UI library
- **[Vite 8](https://vite.dev/)** — Build tool and dev server
- **[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react)** — React support via [Oxc](https://oxc.rs)
- **[ESLint 9](https://eslint.org/)** — Linting with React Hooks rules

---

## Production Build

```bash
npm run build
```

Outputs optimised static files to the `dist/` directory, ready to deploy to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## Notes

- The React Compiler is **not enabled** by default due to its impact on build performance. See the [React Compiler docs](https://react.dev/learn/react-compiler/installation) to enable it.
- For production apps, consider migrating to **TypeScript** using the [Vite TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts).
