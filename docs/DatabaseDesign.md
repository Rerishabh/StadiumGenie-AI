# Database Design — StadiumGenie-AI

Version: 1.0  
Status: Draft  
Project: StadiumGenie-AI  
Database: MongoDB (document store)  
Last Updated: 2026-07-16  
Purpose: Master database design and architecture reference. This document defines collections, fields, relationships, indexes, and design rationale before any ODM/models are implemented.

---

## 1. Database overview

- Why MongoDB
  - Flexible document model suits evolving event and stadium schemas.
  - Natural fit for denormalized read-optimized queries (seat maps, event snapshots, AI recommendations).
  - Horizontal scaling (sharding) for high-volume event data and analytics.

- Why ObjectId
  - Native MongoDB identifier with efficient storage and monotonic generation.
  - Good for sharding, indexing, and cross-collection references.
  - Use ObjectId for primary ids and reference fields.

- Multi-stadium support
  - Each major entity carries a `stadiumId` reference to allow multi-venue tenancy.
  - Schemas include stadium-level scoping to partition data and simplify queries.

- High-level architecture
  - Collections grouped by domain: identity (users), venue (stadiums, sections, seats), events (matches, bookings), commerce (food vendors/orders, payments), insights (crowdReports, aiRecommendations), support (notifications, searchHistory), audit (auditLogs).
  - Read-optimized queries use references where data is shared; embedding used for small, tightly-coupled subdocuments (e.g., order items).

- Design philosophy
  - Prefer references for one-to-many relations with high cardinality (bookings → seats).
  - Embed when subdocument is small, always fetched with parent and has lifecycle tied to parent.
  - Keep collections modular and normalized enough to avoid excessive duplication while optimizing for read patterns.

---

## 2. Collection list & purpose

- `users` — Registered users (attendees, staff, admins).
- `stadiums` — Stadium metadata (location, capacity, config).
- `stadiumSections` — Logical sections within a stadium (stands, blocks).
- `matches` — Events (matches/concerts) hosted in stadiums.
- `seats` — Seat inventory tied to stadium sections and matches (static vs event-specific availability).
- `bookings` — Seat reservations / ticket bookings.
- `payments` — Payment transactions and status records.
- `foodVendors` — On-site vendors and their menu metadata.
- `foodOrders` — Orders placed to vendors (in-seat or pickup).
- `notifications` — Push/email/in-app notifications history.
- `crowdReports` — Reports about crowd density, incidents (from sensors or staff).
- `emergencyReports` — Official emergency incidents and responses.
- `searchHistory` — User search logs (routes, places, queries).
- `aiRecommendations` — AI-generated recommendations (seat, route, concession).
- `auditLogs` — System-level audit and change logs.

Total collections designed: 15.

---

## 3. Collection designs

Notes on notation: `ObjectId` means MongoDB ObjectId reference. Types use JSON-style types (string, number, boolean, date, array, object, ObjectId).

### users
**Purpose:** Identity, profile, preferences, roles.

Fields:
- _id — ObjectId — Required — — Primary id.
- email — string — Required — — Email, unique.
- passwordHash — string — Optional — — bcrypt hash (sensitive).
- name — string — Optional — — Display name.
- phone — string — Optional — — E.164 preferred.
- role — string — Required — "attendee" — Enum: attendee, staff, admin.
- createdAt — date — Required — now — ISO timestamp.
- updatedAt — date — Optional — — Last profile update.
- preferences — object — Optional — {} — User preferences (notifications, locale).
- isActive — boolean — Required — true — Soft-delete flag.

Validation: email format; passwordHash length when present.

Sample document:
{
  "_id": "ObjectId(...)",
  "email": "jane@example.com",
  "passwordHash": "$2b$...",
  "name": "Jane Doe",
  "phone": "+919876543210",
  "role": "attendee",
  "createdAt": "2026-07-16T00:00:00Z",
  "preferences": { "notifyByEmail": true },
  "isActive": true
}

---

### stadiums
**Purpose:** Stadium metadata and global configuration.

Fields:
- _id — ObjectId — Required
- name — string — Required
- timezone — string — Required e.g., "Asia/Kolkata"
- location — object — Required — { address, lat, lng }
- capacity — number — Optional
- config — object — Optional — Stadium-specific config (gates, zones)
- createdAt, updatedAt — date

Sample:
{
  "_id": "...",
  "name": "National Stadium",
  "timezone": "Asia/Kolkata",
  "location": { "address":"...", "lat":12.34, "lng":56.78 },
  "capacity": 50000
}

---

### stadiumSections
**Purpose:** Sections / blocks within stadiums; used to group seats.

Fields:
- _id — ObjectId — Required
- stadiumId — ObjectId — Required — ref stadiums
- name — string — Required — e.g., "North Stand - Block A"
- type — string — Optional — "stand"/"vip"/"accessible"
- capacity — number — Optional
- metadata — object — Optional (map coordinates, polygon)
- createdAt

Sample:
{
  "_id":"...",
  "stadiumId":"...",
  "name":"Block A",
  "type":"stand",
  "capacity":1200
}

---

### matches
**Purpose:** Events (matches, concerts) scheduled in a stadium.

Fields:
- _id — ObjectId — Required
- stadiumId — ObjectId — Required
- title — string — Required
- startAt — date — Required
- endAt — date — Optional
- status — string — Required — "scheduled","live","completed","cancelled"
- metadata — object — Optional (teams, eventType)
- createdAt, updatedAt

Sample:
{
  "_id":"...",
  "stadiumId":"...",
  "title":"Home vs Away",
  "startAt":"2026-10-01T13:00:00Z",
  "status":"scheduled"
}

---

### seats
**Purpose:** Seat inventory information (static seat map). Availability per event may be derived or stored in bookings.

Fields:
- _id — ObjectId — Required
- stadiumId — ObjectId — Required
- sectionId — ObjectId — Required
- seatNumber — string — Required — "A12"
- row — string — Optional
- type — string — Optional — "regular","vip","accessible"
- location — object — Optional — { x,y } or geo coords
- attributes — object — Optional (folding, wheelchair)
- createdAt

Sample:
{
  "_id":"...",
  "stadiumId":"...",
  "sectionId":"...",
  "seatNumber":"A12",
  "row":"A",
  "type":"regular"
}

---

### bookings
**Purpose:** Reservations/ticket assignments for a match and user.

Fields:
- _id — ObjectId — Required
- userId — ObjectId — Required
- matchId — ObjectId — Required
- stadiumId — ObjectId — Required
- seats — array[ { seatId:ObjectId, seatNumber:string, price:number } ] — Required (at least one)
- status — string — Required — "reserved","confirmed","cancelled","checked-in"
- totalAmount — number — Optional
- paymentId — ObjectId — Optional
- createdAt, updatedAt
- expiresAt — date — Optional (reservation hold expiration)

Validation: seats non-empty; status enum.

Sample:
{
  "_id":"...",
  "userId":"...",
  "matchId":"...",
  "stadiumId":"...",
  "seats":[{"seatId":"...","seatNumber":"A12","price":25}],
  "status":"reserved",
  "totalAmount":25
}

Rationale: embed seats inside booking for fast read of purchased seats; seat docs remain canonical in `seats`.

---

### payments
**Purpose:** Record of payment transactions and reconciliations.

Fields:
- _id — ObjectId
- bookingId — ObjectId — Optional
- userId — ObjectId — Optional
- amount — number — Required
- currency — string — Required — "INR"
- provider — string — Optional — "stripe","razorpay"
- providerRef — string — Optional — provider transaction id
- status — string — Required — "pending","succeeded","failed","refunded"
- createdAt, updatedAt

Sample:
{
  "_id":"...",
  "bookingId":"...",
  "amount":25,
  "currency":"INR",
  "provider":"razorpay",
  "providerRef":"txn_123",
  "status":"succeeded"
}

---

### foodVendors
**Purpose:** Vendors and menu metadata.

Fields:
- _id — ObjectId
- stadiumId — ObjectId — Required
- name — string — Required
- location — string — Optional — "Gate B"
- menuSnapshot — array[ { itemId, name, price, tags } ] — Optional
- isActive — boolean — Default true

Sample:
{
  "_id":"...",
  "stadiumId":"...",
  "name":"Hot Dogs Stall",
  "location":"Gate 3"
}

---

### foodOrders
**Purpose:** Food orders (in-seat, pickup).

Fields:
- _id — ObjectId
- userId — ObjectId — Required
- stadiumId — ObjectId — Required
- vendorId — ObjectId — Required
- items — array[ { itemId, name, qty, price } ] — Required
- total — number — Required
- status — string — Required — "pending","preparing","ready","delivered","cancelled"
- seatReference — { seatId, seatNumber } — Optional
- createdAt, updatedAt

Sample:
{
  "_id":"...",
  "userId":"...",
  "vendorId":"...",
  "items":[{"itemId":"i1","name":"Hot Dog","qty":2,"price":5}],
  "total":10,
  "status":"pending"
}

Embedding items simplifies vendor order processing.

---

### notifications
**Purpose:** Notification history and delivery status.

Fields:
- _id — ObjectId
- userId — ObjectId — Optional (system-wide notifications have null)
- stadiumId — ObjectId — Optional
- channel — string — "push","email","sms","in-app"
- payload — object — Required (title, body, meta)
- status — string — "queued","sent","failed"
- sentAt — date — Optional
- createdAt

Sample:
{
  "_id":"...",
  "userId":"...",
  "channel":"push",
  "payload":{"title":"Gate changed", "body":"Gate 2 -> Gate 4"}
}

---

### crowdReports
**Purpose:** Crowd density reports from sensors or staff, used for analytics and alerts.

Fields:
- _id — ObjectId
- stadiumId — ObjectId — Required
- matchId — ObjectId — Optional
- sectionId — ObjectId — Optional
- reportedAt — date — Required
- densityScore — number — Required (0-100)
- source — string — "sensor","staff","ai"
- metadata — object — Optional (cameraId, snapshotRef)

Sample:
{
  "_id":"...",
  "stadiumId":"...",
  "reportedAt":"2026-10-01T14:00Z",
  "densityScore":85,
  "source":"sensor"
}

---

### emergencyReports
**Purpose:** Official emergency incidents requiring action.

Fields:
- _id — ObjectId
- stadiumId — ObjectId — Required
- matchId — ObjectId — Optional
- reportedBy — ObjectId — Optional (staff user id)
- reportedAt — date — Required
- type — string — Required — "medical","fire","security"
- severity — string — "low","medium","high","critical"
- location — object — Optional
- status — string — "open","in-progress","resolved"
- notes — string — Optional

Sample:
{
  "_id":"...",
  "stadiumId":"...",
  "type":"medical",
  "severity":"high",
  "status":"open",
  "reportedAt":"2026-10-01T15:00Z"
}

---

### searchHistory
**Purpose:** User search queries for personalization and analytics.

Fields:
- _id — ObjectId
- userId — ObjectId — Optional
- query — string — Required
- filters — object — Optional
- createdAt — date — Required

Sample:
{
  "_id":"...",
  "userId":"...",
  "query":"best food near my seat",
  "createdAt":"2026-10-01T14:05Z"
}

---

### aiRecommendations
**Purpose:** Store AI-generated recommendations tied to users or matches.

Fields:
- _id — ObjectId
- userId — ObjectId — Optional
- matchId — ObjectId — Optional
- stadiumId — ObjectId — Optional
- type — string — Required — "seat","route","food","safety"
- payload — object — Required (model output)
- confidence — number — Optional (0-1)
- createdAt — date

Sample:
{
  "_id":"...",
  "userId":"...",
  "type":"seat",
  "payload":{ "suggestedSeats":[ "A12","A13" ] },
  "confidence":0.92
}

---

### auditLogs
**Purpose:** Immutable audit entries for critical system events and changes.

Fields:
- _id — ObjectId
- actorId — ObjectId — Optional
- action — string — Required — e.g., "booking.create"
- target — object — Optional — { collection, id }
- details — object — Optional
- createdAt — date — Required
- severity — string — Optional

Sample:
{
  "_id":"...",
  "actorId":"...",
  "action":"booking.create",
  "target":{"collection":"bookings","id":"..."},
  "createdAt":"2026-10-01T14:01Z"
}

---

## 4. Relationships

- One-to-One
  - `stadiumSections` ↔ `stadiums` (section belongs to one stadium).
- One-to-Many
  - `stadiums` → `stadiumSections`
  - `matches` → `bookings`
  - `users` → `bookings`
  - `users` → `notifications`
- Many-to-Many (modeled via references/arrays)
  - `users` ↔ `matches` via `bookings` (users can book many matches; match has many bookings).
- Embedding vs References
  - Use references for large collections or when subdocument has independent lifecycle (users, seats).
  - Embed for tightly-coupled small arrays (booking.seats, foodOrders.items) for read performance and atomicity.

Rationale: references avoid duplication of canonical data (seat definitions) and enable targeted updates; embedding improves read latency for common access patterns (fetching booking with seats).

---

## 5. Indexing strategy (per-collection highlights)

General guidance: create compound indexes that match read query patterns; limit number of indexes to balance write cost.

- users
  - Unique index on `email`
  - Index on `role`
  - Compound index on `isActive, createdAt` for admin queries

- stadiums
  - Index on `name`, geo/spatial index on location if geosearch required

- stadiumSections
  - Compound index on `stadiumId, name`

- matches
  - Compound index on `stadiumId, startAt`
  - Index on `status`

- seats
  - Compound unique index on `stadiumId, sectionId, seatNumber`
  - Index on `sectionId` for seat retrieval

- bookings
  - Index on `userId`
  - Compound index on `matchId, status`
  - TTL-like strategy: use `expiresAt` for ephemeral reservations (with TTL index)

- payments
  - Index on `bookingId`, `providerRef`(unique if provider guarantees uniqueness)

- foodOrders
  - Index on `vendorId, status`
  - Index on `userId`

- notifications
  - Index on `userId, status`

- crowdReports
  - Compound index on `stadiumId, reportedAt`
  - Potential TTL for transient sensor data

- emergencyReports
  - Index on `stadiumId, status, reportedAt`

- aiRecommendations
  - Index on `userId, matchId`
  - Text index on payload fields if needed

- auditLogs
  - Index on `actorId, action, createdAt`
  - Consider time-partitioning/archival for long-term retention

Text indexes: create per-collection as needed (e.g., seats description, vendors menu) with attention to index size.

---

## 6. Sample JSON documents

(One example per collection; ObjectId placeholders used)

users
{
  "_id":"ObjectId(...)",
  "email":"alice@example.com",
  "name":"Alice",
  "role":"attendee",
  "createdAt":"2026-07-16T00:00:00Z"
}

stadiums
{ "_id":"...", "name":"National Stadium", "timezone":"Asia/Kolkata", "location":{"address":"...","lat":12.34,"lng":56.78} }

stadiumSections
{ "_id":"...", "stadiumId":"...", "name":"West Stand - Block B", "capacity":800 }

matches
{ "_id":"...", "stadiumId":"...", "title":"Home vs Away", "startAt":"2026-10-01T13:00:00Z", "status":"scheduled" }

seats
{ "_id":"...", "stadiumId":"...", "sectionId":"...", "seatNumber":"B15", "row":"B" }

bookings
{ "_id":"...", "userId":"...", "matchId":"...", "stadiumId":"...", "seats":[{"seatId":"...","seatNumber":"B15","price":30}], "status":"confirmed", "totalAmount":30 }

payments
{ "_id":"...", "bookingId":"...", "amount":30, "currency":"INR", "provider":"razorpay", "status":"succeeded" }

foodVendors
{ "_id":"...", "stadiumId":"...", "name":"Pizza Truck" }

foodOrders
{ "_id":"...", "userId":"...", "vendorId":"...", "items":[{"itemId":"i1","name":"Margherita","qty":1,"price":8}], "total":8, "status":"pending" }

notifications
{ "_id":"...", "userId":"...", "channel":"push", "payload":{"title":"Gate Change","body":"Gate moved to 4"}, "status":"sent" }

crowdReports
{ "_id":"...", "stadiumId":"...", "reportedAt":"2026-10-01T14:00Z", "densityScore":86, "source":"sensor" }

emergencyReports
{ "_id":"...", "stadiumId":"...", "type":"medical", "severity":"high", "status":"open", "reportedAt":"2026-10-01T15:00Z" }

searchHistory
{ "_id":"...", "userId":"...", "query":"best food near me", "createdAt":"2026-10-01T14:05Z" }

aiRecommendations
{ "_id":"...", "userId":"...", "type":"route", "payload":{"route":["Gate 3","Section B"]}, "confidence":0.88 }

auditLogs
{ "_id":"...", "actorId":"...", "action":"booking.create", "target":{"collection":"bookings","id":"..."}, "createdAt":"2026-10-01T14:01Z" }

---

## 7. ER diagram (Markdown)

Users
│
├── Bookings
├── Notifications
├── SearchHistory
└── AIRecommendations

Stadiums
│
├── StadiumSections
├── Matches
└── FoodVendors

Matches
│
├── Seats
├── Bookings
└── CrowdReports

FoodVendors
│
└── FoodOrders

AuditLogs and Payments connect to multiple entities (bookings, users, payments)

---

## 8. Security considerations

- Password hashing: Store only bcrypt hashes (`passwordHash`), never plaintext.
- JWT: Use short-lived access tokens + refresh tokens; store secrets in env.
- Sensitive fields: `passwordHash`, `payment provider tokens` should be treated as sensitive; restrict projection and encryption at rest if required.
- Soft delete: Use `isActive` flags and archival retention for GDPR compliance.
- Audit logging: Write immutable `auditLogs` for critical actions (booking changes, refunds).
- Data privacy: PII minimization, retention policies for logs and analytics.
- Encryption-at-rest and field-level encryption: consider for payment/PII.
- Rate limiting & abuse protection for public endpoints (to be implemented later).

---

## 9. Scalability

- Multiple stadiums: All collections include `stadiumId` to scope queries; shard by `stadiumId` for large deployments.
- Multiple events: Index `stadiumId,startAt` for time-range queries of matches.
- International deployment: Use timezone in stadium metadata; consider geo-partitioning for regional clusters.
- AI analytics: Store AI outputs in `aiRecommendations` and offload heavy analytics to a separate analytical store (data warehouse) for batch processing.
- Real-time crowd monitoring: Use time-series or capped collections for high-frequency sensor data; aggregate down to `crowdReports`.
- Notifications: Use a queue (external) for delivery; store history in `notifications`.
- Payments: Keep authoritative transaction record in `payments`; integrate with provider webhooks.

---

## 10. Future expansion

- OAuth / Google Login (store providerId in users)
- Premium accounts, loyalty rewards (new collections)
- Ticket QR verification service (ticketTokens collection)
- AI chat history and enriched analytics
- Live tracking (separate tracking DB or time-series store)
- Admin analytics dashboards (data warehouse)

---

## 11. Design principles

- Prefer references for large/independent entities.
- Embed for small, immutable child arrays required with parent.
- Avoid duplicating authoritative data; maintain canonical records (e.g., seats).
- Design indexes to match primary read patterns.
- Keep collection responsibilities small and focused.
- Document schema changes in this document before implementing.

---

## 12. Development notes

- This document is the database blueprint. Implement Mongoose models after review.
- Do not change schema without updating this document and consulting stakeholders.
- Authentication will be implemented using `users` (JWT).
- Use migration scripts and versioned changes for schema evolution.

---

### Summary (end)

1. File created: `docs/DatabaseDesign.md`  
2. Collections designed: 15  
3. Architecture summary: Document-oriented MongoDB model with ObjectId identifiers, stadium-scoped collections, reference-first design with selective embedding for performance; read-optimized and designed for multi-stadium scaling and AI analytics.  
4. Recommendations before implementing Mongoose models:
   - Finalize query patterns and read/write workloads to refine indexes.
   - Decide retention policies and TTL for transient collections (crowdReports, sensor data).
   - Add field-level sensitivity list for encryption and masking.
   - Prepare migration/versioning plan (migration tool).
   - Define test data and sample payloads for model validation.