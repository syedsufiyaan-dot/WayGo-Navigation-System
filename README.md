<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:06B6D4,45:2563EB,100:7C3AED&height=220&section=header&text=WayGo&fontSize=72&fontColor=FFFFFF&fontAlignY=35&desc=Your%20Friendly%20Path%20Partner&descAlignY=58&descSize=22&animation=fadeIn" width="100%" alt="WayGo banner" />

<a href="https://waygo-navigation-system.onrender.com">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=24&pause=1000&color=22D3EE&center=true&vCenter=true&width=700&lines=Compare+routes.+Save+time.+Travel+smart.;Bus+%E2%80%A2+Train+%E2%80%A2+Metro+%E2%80%A2+Auto;Built+for+Chennai+commuters+%F0%9F%9A%87" alt="Animated WayGo tagline" />
</a>

<p>
  <a href="https://waygo-navigation-system.onrender.com"><img src="https://img.shields.io/badge/Live_Demo-Open_WayGo-00C7B7?style=for-the-badge&logo=render&logoColor=white" alt="Live demo" /></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-Run_Locally-2563EB?style=for-the-badge&logo=npm&logoColor=white" alt="Quick start" /></a>
  <a href="#-running-tests"><img src="https://img.shields.io/badge/Tests-Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Tests" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
</p>

A full-stack, multi-modal route comparison platform built for Chennai, India.

Live Demo · Features · Installation · Algorithms

</div>

🌆 About WayGo

WayGo helps Chennai commuters compare point-to-point journeys across MTC Bus, Suburban Train (EMU/MRTS), Chennai Metro (CMRL), and Auto-rickshaw.

Every search generates route choices optimized for:

Goal

Algorithm

Optimizes

⚡ Fastest

Dijkstra

Minimum travel time

💰 Cheapest

Dijkstra

Minimum fare in ₹

📏 Shortest

A*

Minimum physical distance

[!NOTE]
WayGo is an academic transportation comparison platform. Route times, auto fares, and road durations are estimates—not live GPS telemetry.

✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

🔐 Secure Authentication

Email and Indian mobile registration

Strong-password validation meter

HMAC-SHA-256 protected, single-use OTPs

5-minute OTP expiry and resend cooldown

Brute-force protection and login lockout

Forgot-password and OTP recovery flows

JWT session persistence using HTTP-only cookies

One-click demo explorer

</td>
<td width="50%" valign="top">

🚏 Chennai Transit Engine

24+ pre-seeded Chennai hubs

Bus, EMU/MRTS, Metro, and Auto modes

Fastest, cheapest, and shortest routes

Line-change and interchange penalties

Realistic auto fare estimates

Detailed boarding and transfer instructions

Interactive preview navigation runner

</td>
</tr>
<tr>
<td width="50%" valign="top">

🗺️ Interactive Map

OpenStreetMap and Leaflet integration

Source, destination, and stop markers

Transit mode-colored route polylines

Automatic bounds fitting and recentering

Desktop and mobile-responsive layouts

Multi-metric route comparison chart

</td>
<td width="50%" valign="top">

💾 Personal Journey Tools

Save frequently used routes

Re-run a saved route in one click

Automatic search history

Duplicate-history suppression

Delete confirmation and clear-all dialogs

Persistent user-specific data

</td>
</tr>
</table>

🎨 Route Color System

Mode

Color

Hex

🚌 MTC Bus

🔵 Blue

#2563EB

🚆 Suburban Train

🟣 Purple

#9333EA

🚇 Chennai Metro

🟢 Emerald

#059669

🛺 Auto-rickshaw

🟡 Amber

#D97706

📸 Application Preview

<div align="center">

<!-- Add your screenshots to client/public/screenshots/ and update these paths if needed. -->

Authentication

Route Comparison





Interactive Map

Saved Routes





</div>

[!TIP]
If you have not added screenshots yet, create client/public/screenshots/ and place the four images there using the filenames shown above.

🧰 Technology Stack

Layer

Technologies

🎨 Frontend

React 18, TypeScript, Vite, Tailwind CSS, React Router v7, Lucide React

🗺️ Maps & Charts

Leaflet, React Leaflet, OpenStreetMap, Recharts

🧾 Forms & Validation

React Hook Form, Zod

⚙️ Backend

Node.js, Express, TypeScript

🗄️ Database

Prisma ORM, SQLite

🛡️ Security

JSON Web Tokens, bcryptjs, HMAC-SHA-256 OTP storage, Express Rate Limit

✉️ Communication

Nodemailer, optional Twilio SMS

🧪 Testing

Vitest, Supertest, React Testing Library, JSDOM

🧭 Pathfinding Algorithms

⚡ Dijkstra — Fastest Route

Each edge is weighted using its estimated duration plus any applicable interchange penalty:

$$w(u,v)=\operatorname{duration}(u,v)+\operatorname{interchange\ penalty}$$

A 3-minute penalty is applied when the journey switches between transit lines.

💰 Dijkstra — Cheapest Route

Each edge is weighted using its ticket fare:

$$w(u,v)=\operatorname{fare}(u,v)$$

The engine compares MTC bus, suburban railway, Metro, and estimated auto fares to minimize total cost.

📏 A* — Shortest Route

WayGo uses the A* evaluation function:

$$f(n)=g(n)+h(n)$$

$g(n)$: exact distance traveled from the source

$h(n)$: Haversine straight-line distance from the current stop to the destination

Because straight-line distance never exceeds the actual track or road distance, the heuristic is admissible:

$$h(n)\le d(n,\text{goal})$$

This guarantees an optimal shortest path for the modeled transit graph.

🏗️ Project Structure

waygo/
├── client/          # React + TypeScript frontend
├── server/          # Express + TypeScript API
├── prisma/          # Schema, migrations, and seed data
├── package.json     # Monorepo scripts
└── README.md

🚀 Quick Start

Prerequisites

Node.js 18 or newer

npm 9 or newer

Installation

git clone https://github.com/syedsufiyaan-dot/waygo.git
cd waygo
npm install
npm run db:generate
npm run db:migrate
npm run db:seed

You can also run every setup task at once:

npm run setup

Start the App

npm run dev

Service

Local URL

Frontend

http://localhost:5173

Backend API

http://localhost:5000

🔑 Demo Account

Use the Explore Demo button or sign in with:

Email:    demo@waygo.app
Password: WayGo123!

[!IMPORTANT]
These credentials are only for the seeded demo account. Never reuse this password for a real account.

⚙️ Environment Variables

Create .env in the project root and server/.env as required by your setup:

PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Generate long, unique values. Never commit real secrets.
JWT_SECRET=replace_with_a_long_random_jwt_secret
OTP_SECRET=replace_with_a_different_long_random_otp_secret

DATABASE_URL="file:../../prisma/dev.db"

# Optional email delivery
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASS=replace_with_your_smtp_password
SMTP_FROM="WayGo Chennai <no-reply@example.com>"

# Optional SMS delivery
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=500
AUTH_RATE_LIMIT_MAX=30

[!WARNING]
Add .env, server/.env, and database files containing user data to .gitignore. Rotate any secret that has ever been committed publicly.

Development OTP Fallback

When NODE_ENV=development, WayGo prints the OTP in the backend terminal and shows a development-only OTP banner in the UI:

[WAYGO DEV OTP] To: user@example.com (EMAIL) | Purpose: REGISTRATION
[WAYGO DEV OTP] Code: >>> 431651 <<< (Valid for 5 mins)

Disable this behavior in production.

🧪 Running Tests

# Run frontend and backend tests
npm run test

# Run TypeScript checks
npm run typecheck

# Create production builds
npm run build

📍 Covered Chennai Hubs

Chennai Central · Egmore · Anna Nagar · T. Nagar · Adyar · Guindy · Tambaram · Velachery · Koyambedu CMBT · Porur · Chromepet · Perambur · Sholinganallur OMR · Ambattur · Mylapore · Nungambakkam · Saidapet · Thiruvanmiyur · Chennai Airport · Marina Beach · Vadapalani · Ashok Nagar · Alandur · Washermanpet

🛡️ Data Transparency

Transit locations, links, frequencies, and fares form an academic dataset modeled using public Chennai transit information.

Auto fares and road durations are explicitly labeled Estimated.

Navigation is presented as Preview Navigation, not continuous live GPS guidance.

Production use would require validated real-time feeds and official transport-data integrations.

🤝 Contributing

Contributions, issues, and feature suggestions are welcome.

Fork the repository.

Create a branch: git checkout -b feature/your-feature.

Commit your changes: git commit -m "Add your feature".

Push the branch: git push origin feature/your-feature.

Open a pull request.

📄 License & Attribution

© 2026 WayGo — Your Friendly Path Partner. Built as an academic, full-stack transportation comparison platform for Chennai commuters.

<div align="center">

💙 Built for smarter journeys across Chennai

<a href="https://waygo-navigation-system.onrender.com">
  <img src="https://img.shields.io/badge/Try_WayGo_Now-Compare_Your_Route-7C3AED?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Try WayGo" />
</a>

<br/><br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:7C3AED,50:2563EB,100:06B6D4&height=120&section=footer" width="100%" alt="WayGo footer" />

</div>
