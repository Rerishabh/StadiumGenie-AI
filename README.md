# StadiumGenie-AI

StadiumGenie-AI is a backend for managing stadiums, events, bookings and simulated payments with ticket QR generation. It is designed as a clean, modular Node.js + Express + MongoDB project intended for rapid development and extension.

Features
- REST APIs for Stadiums, Events, Bookings, Payments, Tickets, Admin dashboards
- Role-based access control (admin)
- Simulated payment gateway (development simulator)
- Automatic QR ticket generation on successful payment
- ES Modules, express-validator, Mongoose

Tech Stack
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Auth: JWT
- Validation: express-validator
- QR Code: qrcode

Repository structure (high level)
- server/ - backend code (routes, controllers, services, models, middleware)
- client/ - frontend (Vite + React) placeholder
- docs/ - documentation and API reference
- scripts/ - developer utilities and verification scripts
- server/seeds - idempotent seed scripts for local development

Getting started

Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)

Install
- Clone the repo
- npm install

Environment
- Copy `.env.example` to `.env` and set the values

Run (development)
- From project root:
  - npm run dev

Available npm scripts
- npm start
- npm run dev

API Modules
- Authentication: /api/v1/auth
- Stadiums: /api/v1/stadiums
- Events: /api/v1/events
- Bookings: /api/v1/bookings
- Payments: /api/v1/payments
- Tickets: /api/v1/tickets
- Admin: /api/v1/admin
- API docs (Swagger): /api-docs

Authentication
- Uses JWT Bearer tokens in Authorization header:
  Authorization: Bearer <token>

Default developer workflow
1. Register a user
2. Login to obtain JWT
3. Create stadium (admin)
4. Create event (admin)
5. Create booking (authenticated user)
6. Create payment (simulated)
7. Receive QR ticket (generated automatically on successful payment)

Development notes
- Server uses ES Modules
- Seed scripts are idempotent and safe to run repeatedly
- Admin-only routes are protected by authMiddleware then adminMiddleware

Future improvements
- React frontend (Vite)
- Deployment and CI
- Analytics & reporting