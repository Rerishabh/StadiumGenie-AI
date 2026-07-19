# Graph Report - C:\Users\risha\OneDrive\Desktop\StadiumGenie-AI  (2026-07-18)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 377 nodes · 653 edges · 24 communities
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e8ddfc2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppRouter.jsx
- seed.js
- app.js
- Events.jsx
- dependencies
- package.json
- devDependencies
- auth.routes.js
- booking.controller.js
- event.controller.js
- stadium.controller.js
- payment.controller.js
- dependencies
- admin.controller.js
- verify_gitkeep.js

## God Nodes (most connected - your core abstractions)
1. `LoadingSpinner()` - 11 edges
2. `useApiState()` - 11 edges
3. `authMiddleware()` - 8 edges
4. `usePagination()` - 7 edges
5. `success()` - 7 edges
6. `failure()` - 7 edges
7. `EmptyState()` - 6 edges
8. `AuthContext` - 6 edges
9. `AdminStadiums()` - 6 edges
10. `createPayment()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `AuthProvider()` --indirect_call--> `login()`  [INFERRED]
  client/src/context/AuthContext.jsx → client/src/services/auth.service.js
- `AuthProvider()` --indirect_call--> `register()`  [INFERRED]
  client/src/context/AuthContext.jsx → client/src/services/auth.service.js
- `AdminStadiums()` --calls--> `getAllStadiums()`  [EXTRACTED]
  client/src/pages/AdminStadiums.jsx → client/src/services/stadium.service.js
- `AdminStadiums()` --calls--> `useApiState()`  [EXTRACTED]
  client/src/pages/AdminStadiums.jsx → client/src/hooks/useApiState.js
- `EventDetails()` --calls--> `useApiState()`  [EXTRACTED]
  client/src/pages/EventDetails.jsx → client/src/hooks/useApiState.js

## Import Cycles
- None detected.

## Communities (24 total, 0 thin omitted)

### Community 0 - "AppRouter.jsx"
Cohesion: 0.07
Nodes (33): api, App(), Button(), LoadingSpinner(), StadiumForm(), AuthContext, AuthProvider(), AdminLayout() (+25 more)

### Community 1 - "seed.js"
Cohesion: 0.07
Nodes (25): getTicketById(), listTickets(), validationErrors(), BookingSchema, EventSchema, ImageSchema, PaymentSchema, GeoPointSchema (+17 more)

### Community 2 - "app.js"
Cohesion: 0.09
Nodes (26): app, connectDB(), start(), adminMiddleware(), authMiddleware(), router, router, router (+18 more)

### Community 3 - "Events.jsx"
Cohesion: 0.11
Nodes (21): EmptyState(), Pagination(), EventCard(), EventFilters(), EventGrid(), EventSearch(), StadiumCard(), StadiumFilters() (+13 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (33): bcrypt, cookie-parser, cors, dotenv, express, express-rate-limit, express-validator, helmet (+25 more)

### Community 5 - "package.json"
Cohesion: 0.09
Nodes (22): axios, dependencies, axios, react, react-dom, react-hook-form, react-icons, react-router-dom (+14 more)

### Community 6 - "devDependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, eslint, eslint-config-prettier, eslint-plugin-react, postcss, prettier (+11 more)

### Community 7 - "auth.routes.js"
Cohesion: 0.17
Nodes (12): login(), me(), register(), authLimiter, loginLimiter, router, authenticateUser(), AuthError (+4 more)

### Community 8 - "booking.controller.js"
Cohesion: 0.29
Nodes (12): create(), getById(), list(), remove(), validationErrors(), cancelBooking(), createBooking(), formatDateYYYYMMDD() (+4 more)

### Community 9 - "event.controller.js"
Cohesion: 0.32
Nodes (12): create(), getById(), list(), remove(), update(), validationErrors(), createEvent(), deleteEvent() (+4 more)

### Community 10 - "stadium.controller.js"
Cohesion: 0.32
Nodes (12): create(), getById(), list(), remove(), update(), validationErrors(), createStadium(), deleteStadium() (+4 more)

### Community 11 - "payment.controller.js"
Cohesion: 0.36
Nodes (10): create(), getById(), list(), validationErrors(), createPayment(), formatDateYYYYMMDD(), generatePaymentReference(), getAllPayments() (+2 more)

### Community 12 - "dependencies"
Cohesion: 0.20
Nodes (9): node-fetch, dependencies, node-fetch, qrcode, swagger-ui-express, yamljs, qrcode, swagger-ui-express (+1 more)

### Community 13 - "admin.controller.js"
Cohesion: 0.56
Nodes (8): dashboard(), eventsStats(), failure(), recentBookings(), recentPayments(), recentTickets(), stadiumsStats(), success()

### Community 14 - "verify_gitkeep.js"
Cohesion: 0.29
Nodes (5): fixed, fs, ok, path, root

## Knowledge Gaps
- **68 isolated node(s):** `name`, `version`, `type`, `private`, `dev` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authMiddleware()` connect `app.js` to `auth.routes.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `createPayment()` connect `payment.controller.js` to `seed.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `name`, `version`, `type` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppRouter.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06502732240437159 - nodes in this community are weakly interconnected._
- **Should `seed.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08748615725359911 - nodes in this community are weakly interconnected._