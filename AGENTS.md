# AGENTS.md

## Project

MARKETPLACE — Simple E-Commerce Store (full-stack web application).

Status: Complete — all features implemented, documented, and tested.

## Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite via sql.js
- **Auth:** JWT + bcryptjs

### Frontend
- **Framework:** React 18
- **Build:** Vite 5
- **Routing:** React Router DOM 6
- **Styling:** Plain CSS (custom properties, Inter font)

### Tooling
- **Lint/Format:** ruff (python scripts only)
- **Test:** Jest (backend), manual (UI)

### Commands (run from repo root)
| Action | Command |
|---|---|
| Start | `start.bat` |
| Install backend | `cd backend && npm install` |
| Install frontend | `cd frontend && npm install` |
| Build frontend | `cd frontend && npx vite build` |
| Run backend | `cd backend && node server.js` |
| Run frontend dev | `cd frontend && npx vite dev` |
| Seed database | `cd backend && node seed.js` |

### Demo Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@store.com | admin123 |
| Customer | alice@example.com | customer1 |

### Project layout
```
backend/
  server.js              Express entry point (port 5000)
  config/db.js           sql.js wrapper (query/execute/transact)
  middleware/auth.js     authenticate + adminOnly
  routes/                auth, products, cart, orders
  seed.js                Database seeder (12 products)
  store.db               SQLite database
frontend/
  vite.config.js         Vite config with dev proxy
  src/
    App.jsx              Main app with routing
    App.css              Full theme system (~1150 lines)
    context/             AuthContext, ThemeContext
    components/          Navbar, ProtectedRoute
    pages/               All page components
docs/diagrams/           UML and architecture diagrams
MARKETPLACE.docx         Full Software Development Document
srs.md                   Software Requirements Specification
README.md                Project readme
start.bat                One-click startup
```
