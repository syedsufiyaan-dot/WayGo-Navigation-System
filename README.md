# WayGo – Your Friendly Path Partner

> **“Compare routes. Save time. Travel smart.”**

WayGo is a complete, modern, full-stack multi-modal web navigation and transportation comparison system built specifically for the diverse urban transit network of **Chennai, India**. 

WayGo allows users to evaluate and compare point-to-point journeys across **Bus (MTC)**, **Chennai Suburban Train (EMU / MRTS)**, **Chennai Metro (CMRL)**, and **Auto-rickshaw** based on **Fastest (minimum time)**, **Cheapest (minimum fare)**, and **Shortest (minimum distance)** criteria using **Dijkstra** and **A\*** pathfinding algorithms.

---

## 🚀 Key Features

### 🔐 1. Authentication & Security Engine
- **Full-Screen Authentication Portal**: Beautiful dark navy-to-indigo animated map backdrop greeting users upon entry.
- **Two Accessible Tabs**: Default **Sign In** and **Create Account**.
- **Registration**: Register with Email, Indian Mobile Phone Number (+91 default country code), or both.
- **Password Strength Meter**: Dynamic visual indicator validating 8+ characters, uppercase, lowercase, number, and special character rules.
- **Cryptographic 6-Digit OTP Verification**: Single-use OTPs with HMAC-SHA-256 storage, 5-minute expiration, 5-attempt brute-force limit, and 30-second resend cooldown.
- **Development OTP Helper**: Clear in-terminal logging and a dedicated on-screen dev badge for rapid local testing without active SMTP/Twilio credentials.
- **Failed Login Lockout Protection**: 5 consecutive failed attempts lock password login for 15 minutes while allowing OTP login bypass.
- **Wrong Password Contextual Recovery**: Directly offers OTP login or password retry without losing the entered identifier.
- **Forgot Password Workflow**: OTP verification followed by secure password reset.
- **1-Click Demo Explorer**: Instant sign-in using the seeded demo account (`demo@waygo.app`).
- **Session Persistence**: Secure HTTP-Only Cookie with JWT token validation across reloads and protected routes.

### 🛣️ 2. Multi-Modal Chennai Transit Engine
- **24+ Pre-seeded Chennai Hubs**: Chennai Central, Egmore, Anna Nagar, T. Nagar, Adyar, Guindy, Tambaram, Velachery, Koyambedu (CMBT), Porur, Chromepet, Perambur, Sholinganallur (OMR), Ambattur, Mylapore, Nungambakkam, Saidapet, Thiruvanmiyur, Chennai Airport, Marina Beach, Vadapalani, Ashok Nagar, Alandur, and Washermanpet.
- **Dijkstra's Algorithm (Fastest Route)**: Optimizes for minimum duration in minutes, factoring in service frequency and line interchange penalties.
- **Dijkstra's Algorithm (Cheapest Route)**: Minimizes ticket costs in Indian Rupees (₹) across MTC Bus (₹5–₹25), Suburban Railway (₹5), Metro (₹10–₹40), and Auto.
- **A\* Algorithm (Shortest Route)**: Calculates the shortest physical path in kilometers using straight-line Haversine distance as an admissible heuristic ($h(n) \le d(n, \text{goal})$).
- **Auto-rickshaw Option**: Realistic road routing connecting any station pair with base fare (₹40/1.5 km) + ₹18/km rates and city traffic estimates.
- **Step-by-Step Directions**: Numbered itineraries showing boarding stops, transfer stations, line names, and distances.
- **Preview Navigation Runner**: Interactive step-by-step navigation modal with previous/next controls.

### 🗺️ 3. Interactive Leaflet Map & Visualizations
- **OpenStreetMap & Leaflet**: Custom markers for Source (Green), Destination (Red), and intermediate stops.
- **Mode-Colored Polylines**:
  - 🔵 **Bus (MTC)**: Blue (`#2563EB`)
  - 🟣 **Suburban Train**: Purple (`#9333EA`)
  - 🟢 **Metro (CMRL)**: Emerald (`#059669`)
  - 🟡 **Auto-rickshaw**: Amber (`#D97706`)
- **Auto-Fit Bounds & Recenter**: Automatically frames the active route with smooth zoom and pan controls.
- **Recharts Multi-Metric Chart**: Interactive bar chart comparing travel time, fare in ₹, and distance across options.
- **Mobile Responsive Layout**: Desktop side-by-side view and mobile floating map drawer.

### 📁 4. Saved Routes & Search History
- **Saved Routes**: Bookmark frequent routes, view date saved, re-run searches in 1 click, or delete with confirmation.
- **Route Search History**: Automatically tracks queries with duplicate suppression, re-run capabilities, and clear-all modals.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide React, Leaflet, React Leaflet, Recharts, React Hook Form, Zod |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, SQLite (`dev.db`), jsonwebtoken, bcryptjs, Nodemailer, Express Rate Limit, Cookie Parser, Zod |
| **Testing** | Vitest, Supertest (APIs), React Testing Library, JSDOM |

---

## 📋 Installation & Quick Start

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Setup & Installation
Clone the repository and run the setup script:

```bash
# Navigate to project directory
cd waygo

# Install all monorepo dependencies (client + server)
npm install

# Generate Prisma Client & push database schema
npm run db:generate
npm run db:migrate

# Seed Chennai transit locations, multimodal graph, and demo user
npm run db:seed
```

*(Alternatively, run `npm run setup` to execute all the setup steps in one go).*

### 3. Start Development Server
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🔑 Demo Account Credentials

Click **Explore Demo** on the authentication page or use:
- **Email**: `demo@waygo.app`
- **Password**: `WayGo123!`

---

## 🧪 Running Tests & Quality Checks

```bash
# Run all backend and frontend automated tests
npm run test

# Run TypeScript typechecks across client and server
npm run typecheck

# Build production bundles
npm run build
```

---

## ⚙️ Environment Configuration (`.env`)

Create `.env` in the root and in `server/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Security Secrets
JWT_SECRET=waygo_super_secure_jwt_secret_key_2026_dev_mode_chennai
OTP_SECRET=waygo_super_secure_otp_secret_key_2026_dev_mode_chennai

# Database
DATABASE_URL="file:../../prisma/dev.db"

# SMTP Email (Optional - falls back to Dev Console OTP in development)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@waygo.app
SMTP_PASS=your_smtp_password
SMTP_FROM="WayGo Chennai <no-reply@waygo.app>"

# Twilio SMS (Optional - falls back to Dev Console OTP in development)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Rate Limits
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
AUTH_RATE_LIMIT_MAX=30
```

### Development OTP Fallback
When `NODE_ENV=development`:
1. The 6-digit OTP code is logged directly to the backend terminal:
   ```
   [WAYGO DEV OTP] To: user@example.com (EMAIL) | Purpose: REGISTRATION
   [WAYGO DEV OTP] Code: >>> 431651 <<< (Valid for 5 mins)
   ```
2. The UI displays a **Development Mode OTP** banner above the input fields for immediate copy-pasting.

---

## 📐 Algorithmic Implementation

### 1. Dijkstra's Algorithm for Travel Time & Fare
WayGo constructs an undirected weighted adjacency graph of Chennai transit connections.
- **Fastest Route**: The edge weight is set to the estimated segment duration in minutes:
  $$w(u, v) = \text{duration}(u, v) + \text{interchange\_penalty}$$
  A 3-minute penalty is added whenever switching between different transit lines.
- **Cheapest Route**: The edge weight is set to ticket fare in INR ($₹$):
  $$w(u, v) = \text{fare}(u, v)$$

### 2. A\* Algorithm for Shortest Distance
For the shortest physical distance, WayGo uses the **A\* Search Algorithm**:
$$f(n) = g(n) + h(n)$$
- $g(n)$ is the exact distance traveled from the start node.
- $h(n)$ is the **Haversine straight-line distance** from current stop $n$ to the destination stop.
- Because the straight-line distance between two GPS coordinates is always less than or equal to any transit track or road distance ($h(n) \le d(n, \text{goal})$), the heuristic is **admissible** and guaranteed to produce the optimal shortest path.

---

## 🛡️ Honest Data & Transit Transparency

- **Academic Dataset**: Station locations, transit connections, frequencies, and ticket fares are modeled after official MTC bus stages, Southern Railway EMU charts, and CMRL fare matrices.
- **Estimation Disclaimers**: All auto-rickshaw fares and road durations are clearly labeled **"Estimated"** to distinguish academic estimates from live GPS telemetry.
- **Zero Simulation Dishonesty**: Step-by-step navigation is labeled **"Preview Navigation"** to maintain honest expectations without claiming continuous live GPS satellite positioning.

---

## 📄 License & Academic Attribution
© 2026 WayGo – “Your Friendly Path Partner”. Built as a modern full-stack transportation comparison platform for Chennai commuters.
