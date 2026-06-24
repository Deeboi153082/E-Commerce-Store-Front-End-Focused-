# MARKETPLACE — Simple E-Commerce Store

A full-stack e-commerce web application built as part of the Software Engineering course assignment. The system enables customers to browse a product catalog, manage a server-side shopping cart, place orders with delivery method selection, and track order history. Administrators have access to a dedicated panel for product catalog management (CRUD) and order status processing through a Pending > Shipped > Delivered workflow with full audit logging.

## Features

- **Customer Features**: User registration and JWT-based authentication, product catalog browsing with search, category filtering, and price range filtering, server-side shopping cart management with quantity control, order checkout with shipping address and delivery method selection (Standard or Express), order history and detailed order tracking
- **Admin Features**: Dashboard with aggregate metrics (total orders, pending orders, revenue, product count), product CRUD operations with Base64 image upload (drag-and-drop, 5 MB limit), order management with status transitions (Pending > Shipped > Delivered) and audit logging
- **UI/UX**: Modern Shopify-inspired design with glassmorphism navigation bar, light/dark theme toggle with 300ms CSS transitions and localStorage persistence, responsive layout with full text visibility guarantee, rainbow dartboard/target logo icon with gradient background

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router DOM 6 |
| Backend | Node.js, Express.js |
| Database | SQLite via sql.js (pure JavaScript, no native compilation) |
| Authentication | JWT (7-day expiry) |
| Password Hashing | bcryptjs (salt rounds: 10) |
| Styling | Plain CSS (custom properties, Inter font) |

## Setup Instructions

### Prerequisites

- Node.js (version 18 or later)
- npm

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Database Setup

The database is pre-seeded with sample data. To reset or re-seed:

```bash
cd backend
node seed.js
```

This populates the database with 12 products across three categories (Electronics, Clothing, Books) and two user accounts.

## Usage Guide

### Running the Application

**Production Mode (single port — recommended):**

```bat
start.bat
```

Or manually:

```bash
cd frontend
npx vite build
cd ../backend
node server.js
```

Open http://localhost:5000 in your browser. The Express server serves both the REST API and the built frontend static files on a single port.

**Development Mode (hot reload):**

Terminal 1 — Backend:
```bash
cd backend
node server.js
```

Terminal 2 — Frontend:
```bash
cd frontend
npx vite dev
```

Frontend dev server runs on http://localhost:5173 with API requests proxied to http://localhost:5000.

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@store.com | admin123 |
| Customer | alice@example.com | customer1 |

### Customer Workflow

1. Register a new account or log in with the demo customer account
2. Browse the product catalog — use the search bar, category dropdown, and price range filter
3. Click a product to view details and add it to your cart with a chosen quantity
4. Click the cart icon to review items, update quantities, or remove items
5. Proceed to checkout — enter a shipping address and select Standard ($5) or Express ($15) delivery
6. View order history and track order status from the orders page

### Admin Workflow

1. Log in with the admin account
2. Access the admin panel from the dashboard link in the navigation bar
3. View aggregate metrics on the admin dashboard (orders, revenue, products)
4. Manage products — add new products with name, description, price, category, and image (drag-and-drop upload); edit or delete existing products
5. Manage orders — view all customer orders; transition order status through Pending > Shipped > Delivered; each transition is logged with admin ID and timestamp

## Project Structure

```
marketplace/
├── backend/
│   ├── config/
│   │   └── db.js              sql.js wrapper
│   ├── middleware/
│   │   └── auth.js            JWT verify + admin guard
│   ├── routes/
│   │   ├── auth.js            Authentication routes
│   │   ├── products.js        Product CRUD routes
│   │   ├── cart.js            Cart management routes
│   │   └── orders.js          Order processing routes
│   ├── server.js              Express entry point
│   ├── seed.js                Database seeder
│   └── store.db               SQLite database file
├── frontend/
│   ├── src/
│   │   ├── api/client.js      API client with JWT header injection
│   │   ├── components/        Navbar, ProtectedRoute
│   │   ├── context/           AuthContext, ThemeContext
│   │   ├── pages/             All page components (12 files)
│   │   ├── App.jsx            Route definitions
│   │   └── App.css            Full theme system (~1150 lines)
│   └── vite.config.js        Vite configuration
├── project files/
│   └── srs.md                Software Requirements Specification
├── docs/
│   └── diagrams/             UML and architecture diagrams
├── AGENTS.md                  Project notes
├── README.md                  Project readme
└── start.bat                  One-click startup script
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Register a new user |
| POST | /api/auth/login | No | Log in and receive JWT |
| GET | /api/products | No | List products (supports search, category, price filters) |
| GET | /api/products/:id | No | Get product details |
| POST | /api/products | Admin | Create a new product |
| PUT | /api/products/:id | Admin | Update a product |
| DELETE | /api/products/:id | Admin | Delete a product |
| GET | /api/cart | Customer | Get current user's cart |
| POST | /api/cart | Customer | Add item to cart |
| PUT | /api/cart/:itemId | Customer | Update cart item quantity |
| DELETE | /api/cart/:itemId | Customer | Remove item from cart |
| POST | /api/orders | Customer | Place an order |
| GET | /api/orders | Customer | Get order history |
| GET | /api/orders/:id | Customer | Get order details |
| GET | /api/orders/admin/all | Admin | Get all orders |
| PUT | /api/orders/:id/status | Admin | Update order status |
| GET | /api/admin/products/count | Admin | Get product count |
| GET | /api/admin/orders/metrics | Admin | Get order metrics |
