# 🗳️ Votely — Real-Time Polling & Voting Platform

> **Tagline:** *"Your Voice Matters. The Power of Your Vote in Your Hands."*

Votely is a responsive, modern Web Application designed to empower collective decisions through verified, tamper-resistant real-time polls. Built with **React 18 (Vite)**, **Tailwind CSS**, **Node.js (Express)**, and **Socket.io**.

---

## 🌟 Key Features

### 1. 🔐 Cryptographic Secret Codes (Feature A)
- Every poll generates a unique 6-character alphanumeric passcode (e.g., `VOTE-89X2`).
- Restrict participation to only those with the secret passcode or direct share link (`/participate?code=VOTE-89X2`).
- Dynamic addition/removal of voting options (minimum 2 options).
- Customizable expiry windows (24h, 48h, 7 days, or custom timestamp).

### 2. 🗳️ Verified Ballot Casting & Anti-Tamper Enforcement (Feature B)
- **Strict One-Vote-Per-User Enforcement**: Enforces one ballot per verified email/identity, preventing ballot stuffing.
- **Voter Feedback Commentary**: Voters can optionally leave thoughts or manifestos alongside their vote.
- Instant celebratory confetti feedback upon ballot verification.

### 3. 📊 Real-Time WebSocket Analytics & History (Feature C)
- Live vote distribution powered by **Socket.io** without page reloads.
- Interactive visualizations: Toggle smoothly between **Vertical Bar Charts** and **Donut Pie Charts** (powered by Recharts).
- Filter historical polls by **All**, **Active**, **Expired**, and **Created by Me**.
- Live stream of community commentary and feedback submissions.

### 4. 👤 Voter Identity & Activity Tracking (Feature D)
- Voter profile management (Full Name, Gender, Mobile Number, Email, and Optional Voter/Student ID).
- Personal stats tracking: Polls Created vs. Ballots Cast, with record of specific options voted for.

---

## 🏗️ Architecture & Tech Stack

```text
votely-app/
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Sidebar, PollCard, VoteChart)
│   │   ├── pages/              # LandingPage, Onboarding, Dashboard, CreatePoll, ParticipatePoll, PollHistory, Profile
│   │   ├── context/            # AuthContext & Socket.io Provider
│   │   ├── App.jsx             # React Router v6 Configuration
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── server/                     # Backend API & WebSocket Engine
    ├── config/db.js            # Data Store (persistent JSON fallback + Mongoose support)
    ├── controllers/            # userController & pollController
    ├── models/                 # User & Poll models
    ├── routes/                 # userRoutes & pollRoutes
    ├── utils/generateCode.js   # 6-character code generator (e.g. VOTE-89X2)
    ├── server.js               # Express + HTTP + Socket.io Server
    └── package.json
```

---

## 🚀 Getting Started

### 1. Quick Launch (Both Client & Server)
Inside the `votely-app/` directory:

```bash
# 1. Install dependencies
npm run install:all

# 2. Start both backend (Port 5001) and frontend (Port 5173) concurrently
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

### 2. Running Services Separately

**Backend Server (Port 5001):**
```bash
cd server
npm install
npm run dev
```

**Frontend Client (Port 5173):**
```bash
cd client
npm install
npm run dev
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register or onboard voter profile |
| `GET` | `/api/users/profile/:email` | Get voter profile & personal activity stats |
| `PUT` | `/api/users/profile/:email` | Update profile fields |
| `GET` | `/api/polls` | List polls (supports `status`, `creatorEmail`, `voterEmail`, `search`) |
| `GET` | `/api/polls/stats` | System KPI summary (total polls, votes cast, active count) |
| `GET` | `/api/polls/:identifier` | Get poll by ID or Secret Code (e.g. `VOTE-89X2`) |
| `POST` | `/api/polls/create` | Create new poll and generate 6-character code |
| `POST` | `/api/polls/vote` | Cast ballot with 1-vote-per-user check and emit WebSocket event |

---

## ⚡ WebSocket Events

- `poll_updated`: Broadcasts whenever a vote is cast or feedback is added.
- `poll_created`: Broadcasts when a new poll goes live.
- `join_poll` / `leave_poll`: Dedicated rooms for real-time polling sessions.

