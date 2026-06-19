# EventHub — Event Booking System

A full-stack web application where users can register, browse events, book seats, and manage their bookings. Built with **React + Vite** (frontend) and **Node.js + Express + MongoDB** (backend).

> Submitted as part of a Full Stack Developer Internship Assessment.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Demo Accounts](#demo-accounts)
- [API Documentation](#api-documentation)
- [Assumptions](#assumptions)
- [Design Decisions](#design-decisions)

---

## Features

**Authentication**
- Register, Login, Logout
- Passwords hashed with bcrypt; sessions via JWT stored in an httpOnly cookie

**Events**
- List all upcoming events (name, description, date & time, venue, total / available seats, price)
- Search by name or venue, with pagination
- View full event details

**Bookings**
- Book one or more seats for an event
- View all your bookings
- Cancel a booking — seats are released back to the event inventory

**Admin (role-based)**
- Admin-only UI and API to **create, edit, and delete** events
- Editing capacity safely reconciles already-booked seats

**Engineering extras**
- Race-condition-safe seat booking (atomic seat reservation — no overbooking)
- Input validation (zod) and consistent, meaningful error responses
- Security middleware (helmet, CORS, rate-limited auth)
- Seed script with sample data
- Responsive UI with Tailwind CSS, loading and error states
- Deployment-ready (Render blueprint + Vercel config)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (httpOnly cookie) + bcrypt |
| Validation | zod |

---

## Project Structure

```
event-booking-system/
├── backend/
│   ├── src/
│   │   ├── config/        # DB connection
│   │   ├── models/        # User, Event, Booking (Mongoose)
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # Express routers
│   │   ├── middleware/    # auth, validation, error handling
│   │   ├── validators/    # zod schemas
│   │   ├── utils/         # ApiError, asyncHandler, token helpers
│   │   ├── app.js         # Express app factory
│   │   └── server.js      # Entry point
│   ├── seed/seed.js       # Sample data seeder
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/           # axios client
    │   ├── context/       # AuthContext
    │   ├── components/    # Navbar, ProtectedRoute, EventCard, EventForm, AuthLayout, icons, Loader
    │   ├── pages/         # Events, EventDetails, MyBookings, AdminEvents, Login, Register
    │   └── lib/           # formatting helpers
    ├── tailwind.config.js # design tokens (Mona Sans, ink/mist palette)
    └── .env.example
```

---

## Project Setup

### Prerequisites
- **Node.js** v18+ (developed on v24)
- **MongoDB** running locally, or a free **MongoDB Atlas** connection string

### 1. Clone
```bash
git clone <your-repo-url>
cd event-booking-system
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env          # then edit .env (see below)
npm run seed                  # optional: load sample events + demo users
npm run dev                   # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd ../frontend
npm install
cp .env.example .env          # default points at http://localhost:5000/api
npm run dev                   # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend port | `5000` |
| `NODE_ENV` | `development` or `production` | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/event-booking` |
| `JWT_SECRET` | Secret used to sign JWTs | `a_long_random_string` |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Frontend origin (for CORS) | `http://localhost:5173` |
| `COOKIE_SECURE` | `true` only when served over HTTPS | `false` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `admin123` |
| User | `demo@example.com` | `demo123` |

Only an **admin** can create events (`POST /api/events`).

---

## API Documentation

Base URL: `http://localhost:5000/api`

Authentication uses an httpOnly cookie set on login/register. A `Bearer` token in the
`Authorization` header is also accepted as a fallback.

### Auth

#### `POST /auth/register`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }
```
**201** → `{ "user": { "id", "name", "email", "role" } }`

#### `POST /auth/login`
```json
{ "email": "jane@example.com", "password": "secret123" }
```
**200** → `{ "user": { ... } }`

#### `POST /auth/logout`
**200** → `{ "message": "Logged out successfully" }`

#### `GET /auth/me` *(auth required)*
**200** → `{ "user": { ... } }`

### Events

#### `GET /events`
Query params: `search`, `page` (default 1), `limit` (default 12), `upcoming` (`true`/`false`).
```json
{
  "events": [ { "_id", "name", "description", "dateTime", "venue", "totalSeats", "availableSeats", "price" } ],
  "pagination": { "page": 1, "limit": 9, "total": 5, "totalPages": 1 }
}
```

#### `GET /events/:id`
**200** → `{ "event": { ... } }` · **404** if not found.

#### `POST /events` *(admin only)*
```json
{
  "name": "Tech Conf",
  "description": "...",
  "dateTime": "2026-09-01T10:00:00.000Z",
  "venue": "Bengaluru",
  "totalSeats": 200,
  "price": 999
}
```
**201** → `{ "event": { ... } }`

#### `PATCH /events/:id` *(admin only)*
Partial update; send any subset of the create fields. If `totalSeats` changes, `availableSeats` is recalculated to preserve already-booked seats (and rejected if it would go negative).
**200** → `{ "event": { ... } }`

#### `DELETE /events/:id` *(admin only)*
Deletes an event. **409** if it still has confirmed bookings.
**200** → `{ "message": "Event deleted" }`

### Bookings *(all require auth)*

#### `POST /bookings`
```json
{ "eventId": "<event id>", "seats": 2 }
```
**201** → `{ "booking": { "_id", "user", "event", "seats", "status" } }`
**409** if not enough seats · **400** if event already started.

#### `GET /bookings`
Returns the authenticated user's bookings (newest first), with the event populated.
```json
{ "bookings": [ { "_id", "seats", "status", "event": { ... } } ] }
```

#### `PATCH /bookings/:id/cancel`
Cancels the booking and releases its seats back to the event.
**200** → `{ "booking": { ..., "status": "cancelled" } }`

### Error format
All errors return a consistent shape:
```json
{ "message": "Human-readable explanation" }
```
Common codes: `400` validation, `401` not authenticated, `403` forbidden, `404` not found, `409` conflict (duplicate email / not enough seats).

---

## Assumptions

- **Seat selection is by quantity, not specific seat numbers** — the assessment asks to "specify the number of seats", so there is no seat-map / numbered seating.
- **A user can create multiple separate bookings for the same event.** Each booking is an independent record that can be cancelled on its own.
- **Cancelling is irreversible** — there is no "un-cancel"; the user would book again.
- **Only admins manage events** (create/edit/delete). Regular users browse and book. The seeder creates one admin. Promotion to admin is done directly in the database (no self-service admin signup, by design).
- **Bookings are blocked for events whose start time has passed.**
- **Per-booking seat cap of 10** to keep the demo realistic (configurable in the validator).
- **Email is the unique identifier** for an account.

---

## Design Decisions

**Why an atomic update for booking (no overbooking).**
Booking reserves seats with a single guarded update:
```js
Event.findOneAndUpdate(
  { _id, availableSeats: { $gte: seats } },
  { $inc: { availableSeats: -seats } },
  { new: true }
)
```
MongoDB applies a matched document update atomically, so two concurrent requests for the last seats can never both succeed — this prevents overbooking without a read-then-write race or a multi-document transaction. The `Booking` record is only created after seats are reserved, and seats are returned if that insert fails.

**Why JWT in an httpOnly cookie.**
The token is not readable by JavaScript, which protects it from XSS token theft (unlike `localStorage`). The frontend sends it automatically via `withCredentials`, and CORS is locked to the configured client origin with credentials enabled. A `Bearer` header is still accepted to keep the API testable with tools like Postman/curl.

**Layered backend (routes → validate → controller → model).**
Each concern is isolated: zod validators guard inputs at the edge, controllers hold business logic, a central error handler maps thrown `ApiError`s (and Mongoose errors) to consistent JSON. An `asyncHandler` wrapper removes repetitive try/catch.

**Safe cancellation.**
Seats are only released when a booking transitions out of `confirmed`, so repeating a cancel (or a double request) can never inflate an event's available-seat count.

**Frontend state.**
Auth state lives in a small React Context that hydrates from `GET /auth/me` on load, so a page refresh keeps the user logged in (the cookie is the source of truth). Data fetching is kept simple with axios + local component state rather than adding a heavier data layer.

**Design system.**
A small token-driven system in `tailwind.config.js` + `index.css`: Mona Sans typography, an ink/white/mist neutral palette with pill-shaped controls, reusable `.btn`, `.input`, `.card`, and `.badge` classes, and inline SVG icons (no icon dependency). Built to WCAG-AA contrast with visible focus rings and `prefers-reduced-motion` support.

---

## Deployment

The app is structured for a standard split deployment:

- **Database** — MongoDB Atlas (already used in development).
- **Backend** — Render (a `render.yaml` blueprint is included). Set `MONGO_URI`, `CLIENT_URL` (your frontend URL), and `COOKIE_SECURE=true`. `NODE_ENV=production` enables `trust proxy` so secure cookies work behind Render's TLS.
- **Frontend** — Vercel. `vercel.json` does two things: a **proxy rewrite** sending `/api/*` to the Render backend, and an SPA fallback so client-side routes survive refresh. Set `VITE_API_URL=/api`.

**Why the proxy (cross-site cookie fix):** the frontend and backend are on different domains, so the httpOnly auth cookie would otherwise be a *third-party* cookie (blocked by Safari, being phased out by Chrome). Routing `/api` through Vercel keeps the browser talking to a single origin, so the cookie is first-party and authentication is reliable everywhere. Update the destination URL in `vercel.json` to your Render URL after the backend is deployed.

> Live demo: _<add your deployed URL here after deploying>_

---

## Possible future improvements
- Automated tests (API integration + UI)
- Numbered seat selection
- Email confirmations and payment integration
- Dockerfile + docker-compose for one-command setup
