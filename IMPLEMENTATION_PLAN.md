# StadiumGenie-AI Implementation Plan

## 1. Current Project Architecture
- **Tech Stack:** MERN (MongoDB, Express, React, Node.js).
- **Backend:** Node.js + Express REST API following a service-oriented architecture (Routes -> Controllers -> Services -> Models). Built with ES Modules.
- **Frontend:** React Single Page Application built with Vite and TailwindCSS, using `react-router-dom` for navigation.
- **Auth:** JWT-based authentication, with Role-Based Access Control (Admin vs. User).
- **Database:** MongoDB (via Mongoose) with well-defined relational schemas (Stadium, Event, Booking, User, Ticket, Payment).

## 2. Verified Frontend Status

- **`client/src/pages/Home.jsx`** (5 lines)
  - **Status**: Placeholder
  - **Works**: Basic routing.
  - **Missing**: All marketing content, hero banners, and actual landing page UI.

- **`client/src/pages/Login.jsx`** (40 lines)
  - **Status**: Implemented
  - **Works**: Uses `react-hook-form`, calls `login` from `AuthContext`, handles success/error states and redirects.
  - **Missing**: N/A.

- **`client/src/pages/Register.jsx`** (5 lines)
  - **Status**: Placeholder
  - **Works**: Basic routing.
  - **Missing**: Form UI, state management, API integration with `register` endpoint.

- **`client/src/pages/Events.jsx`** (85 lines)
  - **Status**: Implemented
  - **Works**: Data fetching (`getAllEvents`), pagination, search, filtering, loading states, error handling.
  - **Missing**: N/A.

- **`client/src/pages/EventDetails.jsx`** (54 lines)
  - **Status**: Implemented
  - **Works**: Fetches single event, displays banner, dates, price, and basic info.
  - **Missing**: The "Booking" button is disabled and hardcoded as a placeholder.

- **`client/src/pages/Stadiums.jsx`** (85 lines)
  - **Status**: Implemented
  - **Works**: Data fetching (`getAllStadiums`), pagination, search, filtering, loading/error states.
  - **Missing**: N/A.

- **`client/src/pages/StadiumDetails.jsx`** (84 lines)
  - **Status**: Implemented
  - **Works**: Fetches single stadium, displays images, details, and fetches related active events for that stadium.
  - **Missing**: N/A.

- **`client/src/pages/Profile.jsx`** (7 lines)
  - **Status**: Partially Implemented
  - **Works**: Accesses `AuthContext` and restricts access.
  - **Missing**: UI design. Currently just dumps `JSON.stringify(user)` to the screen.

- **`client/src/pages/Booking.jsx`** (5 lines)
  - **Status**: Placeholder
  - **Works**: Protected route wrapper.
  - **Missing**: Ticket selection, quantity input, total calculation, and API call to `/api/v1/bookings`.

- **`client/src/pages/Payment.jsx`** (5 lines)
  - **Status**: Placeholder
  - **Works**: Protected route wrapper.
  - **Missing**: Payment method selection, total display, API integration with `/api/v1/payments`.

- **`client/src/pages/Tickets.jsx`** (5 lines)
  - **Status**: Placeholder
  - **Works**: Protected route wrapper.
  - **Missing**: List of purchased tickets, QR code rendering.

- **`client/src/pages/AdminDashboard.jsx`** (5 lines)
  - **Status**: Placeholder
  - **Works**: Admin route wrapper.
  - **Missing**: Analytics charts, recent bookings list, revenue stats.

- **`client/src/pages/NotFound.jsx`** (5 lines)
  - **Status**: Implemented
  - **Works**: Returns 404 UI.
  - **Missing**: Styling polish.

## 3. Verified Backend Status
- **Implemented & Ready:** 
  - `Auth` (register, login, me)
  - `Stadiums` (CRUD)
  - `Events` (CRUD)
  - `Bookings` (Create, List, GetById, Cancel)
  - `Payments` (Simulated gateway: Create, List, GetById)
  - `Tickets` (List, GetById)
  - `Admin` (Dashboard analytics, stats, recent items)
- **Status:** The core backend business logic is fully functional.

## 4. Missing Features
1. **Frontend Registration UI** (Low complexity, UI first)
2. **Home Page / Landing Polish** (Low complexity, UI first)
3. **Ticket Booking Flow UI** (Medium complexity, UI first)
4. **Simulated Payment UI** (Medium complexity, UI first)
5. **User Tickets & QR Viewer UI** (Medium complexity, UI first)
6. **Admin Dashboard UI** (High complexity, UI first)
7. **Real Payment Gateway (Stripe)** (High complexity, Backend first)
8. **Email Notifications for Tickets** (Medium complexity, Backend first)
9. **API Rate Limiting & Security** (Low complexity, Backend first)

## 5. Implementation Roadmap

### Phase 0: Foundation & Environment Verification
- Verify database connectivity (MongoDB Atlas).
- Ensure `.env` is correctly configured with `JWT_SECRET` and database URI.
- Confirm backend and frontend dev servers run without errors on current branches.
- (Completed via deep verification).

### Phase 1: Core Authentication & User Basics
- **Frontend:** Implement `Register.jsx` using `react-hook-form` to wire up to the working backend API.
- **Frontend:** Build out `Home.jsx` with real landing page marketing content and hero banners.
- **Frontend:** Polish `Profile.jsx` to render user details properly instead of raw JSON data.

### Phase 2: The Core User Journey (Booking to Ticket)
- **Frontend:** Wire the "Book" button in `EventDetails.jsx` to correctly route to `/booking/:eventId`.
- **Frontend:** Implement the `Booking.jsx` page (Select quantity, calculate total, confirm).
- **Frontend:** Implement the `Payment.jsx` page to connect with the backend simulated payment API.
- **Frontend:** Implement the `Tickets.jsx` page to list purchased tickets and render the ticket QR codes using a library like `qrcode.react`.

### Phase 3: Admin & Analytics UI
- **Frontend:** Integrate a frontend charting library (e.g., `recharts` or `chart.js`).
- **Frontend:** Build the `AdminDashboard.jsx` interface.
- **Integration:** Fetch and display real data from the existing `/api/v1/admin` endpoints (Event stats, recent bookings, recent payments, revenue).

### Phase 4: Production Readiness & Real-World Integrations
- **Backend/Frontend:** Replace the simulated payment controllers with a real integration (e.g., Stripe Webhooks and Intent generation).
- **Backend:** Integrate an email service (Nodemailer / SendGrid) to dispatch QR tickets to users automatically upon successful payment.
- **Backend:** Implement `express-rate-limit` on authentication endpoints to prevent brute-force attacks.
- **Backend:** Fix minor race condition potential in document slug generation inside Mongoose hooks.
