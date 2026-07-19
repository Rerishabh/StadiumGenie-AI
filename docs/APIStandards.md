# API Standards — StadiumGenie-AI

Version: 1.0  
Status: Draft  
Project: StadiumGenie-AI  
Last Updated: 2026-07-16  
Purpose: Define REST API standards, conventions and best practices as the single source of truth before implementation.

---

## 1. API architecture

- RESTful, resource-based JSON APIs.
- Stateless servers: each request contains all required auth/context.
- JSON used for request and response bodies.
- Versioned endpoints (see Base URL) to enable backward-compatible changes.
- Resources represent collections/entities defined in DatabaseDesign.md.

---

## 2. Base URL

- Base: `/api/v1/`
- Versioning rationale: supports safe evolution, easy rollback, client compatibility.

Example: GET /api/v1/stadiums, POST /api/v1/bookings

---

## 3. Resource groups (purpose)

- Authentication — login, token issuance, token refresh (design only; implementation later).
- Users — user profiles, preferences, admin user management.
- Stadiums — stadium metadata and listing.
- Stadium Sections — sections/blocks within stadiums.
- Matches — events scheduling and status.
- Seats — seat inventory retrieval (read-only canonical).
- Bookings — reservations and ticket lifecycle.
- Payments — payment transactions and reconciliation.
- Food Vendors — vendors and menus.
- Food Orders — ordering, status and fulfillment.
- Notifications — delivery history and statuses.
- Crowd Reports — sensor/staff crowd density reports.
- Emergency Reports — official emergency incidents.
- Search — user search endpoints / autocomplete.
- AI Recommendations — expose AI outputs (read-only).
- Admin — management endpoints (restricted).
- Analytics — aggregated metrics and reporting (read-only).
- Audit Logs — system audit retrieval (admin only).

Each group maps to one or more collections in DatabaseDesign.md.

---

## 4. HTTP methods & usage

- GET — retrieve resources or lists (safe, idempotent).
- POST — create resources or run actions that change state.
- PUT — full replace of a resource (idempotent).
- PATCH — partial update of a resource (idempotent for same payload).
- DELETE — logical remove or hard delete (prefer soft-delete flags).

Use method semantics consistently; prefer PATCH for partial updates.

---

## 5. URL design rules

- Use plural resource names: `/users`, `/bookings`.
- Avoid verbs in paths: use HTTP verbs instead.
- Use nested resources sparingly, only when resource context is required:
  - /api/v1/stadiums/{stadiumId}/matches
- Use query parameters for filtering, pagination, and sorting.
- Use path parameters for resource identity.

---

## 6. Request format

Headers
- Content-Type: application/json
- Accept: application/json
- Authorization: Bearer <token> for protected endpoints
- Prefer: return=minimal (optional)

Path parameters
- Use canonical ObjectId strings for IDs.

Query parameters
- Use snake_case or camelCase consistently (choose one; project prefers camelCase in query keys).
- Examples: `?page=1&limit=25&sort=startAt&order=desc&q=search`

Request body
- JSON object matching resource schema.
- Avoid sending server-managed fields (createdAt, _id).

---

## 7. Response format

Standard success response:
{
  "success": true,
  "message": "human readable",
  "data": { ... } | [ ... ],
  "meta": { "page": 1, "limit": 25, "total": 100 } // optional
}

- success: boolean
- message: brief human-friendly message (optional)
- data: resource payload
- meta: pagination/extra info

For list endpoints, data is an array and meta contains pagination.

---

## 8. Error response format

Standard error response:
{
  "success": false,
  "message": "Short error message",
  "errors": [
    { "field":"email", "message":"Invalid email", "code":"INVALID_EMAIL" }
  ],
  "statusCode": 400
}

- message: short description
- errors: array of field-level or global error objects
- statusCode: HTTP status code (duplicative for clarity)

Validation errors should return statusCode 400 or 422 with errors array.

---

## 9. HTTP status codes (guidelines)

- 200 OK — successful GET or idempotent action with body.
- 201 Created — resource created; include Location header.
- 204 No Content — successful action with no response body (DELETE, state-changing).
- 400 Bad Request — invalid request syntax or validation failure.
- 401 Unauthorized — missing/invalid authentication.
- 403 Forbidden — authenticated but insufficient permission.
- 404 Not Found — resource absent.
- 409 Conflict — resource conflict (duplicate booking, idempotency).
- 422 Unprocessable Entity — semantic validation failure.
- 429 Too Many Requests — rate limiting.
- 500 Internal Server Error — unhandled server failure.

Use the most specific code; include structured error body.

---

## 10. Pagination

- Use query params: `?page=1&limit=25` (defaults: page=1, limit=25, maxLimit=200)
- Response meta:
  - total: total items
  - page: current page
  - limit: page size
  - pages: total pages

Cursor-style pagination (after/limit) recommended for high-volume feeds (analytics).

---

## 11. Filtering, sorting, searching

- Filtering via query params: `?stadium=stadiumId&status=live`
- Sorting: `?sort=field&order=asc|desc`
- Searching: `?q=searchTerm` (server-side mapping to text indexes)
- Date filtering: `?start=YYYY-MM-DD&end=YYYY-MM-DD` or ISO datetimes
- Avoid complex query DSL in GET URLs; use POST for advanced search payloads if required.

---

## 12. Authentication

- Use JWT Bearer tokens: Authorization: Bearer <access_token>
- Short-lived access tokens; refresh token flow planned (refresh endpoint).
- Protect routes requiring user identity or elevated roles.
- Public endpoints allowed for unauthenticated read operations (stadium list, basic match info).

---

## 13. Validation standards

- Validate and sanitize all input at validator layer (server/validators).
- Required fields must be enforced; return structured validation errors.
- Email: RFC-compliant pattern; normalize to lowercase.
- Passwords: min length 8, complexity rules enforced client & server.
- File uploads: validate MIME type and size.

---

## 14. Security standards

- Helmet for HTTP header hardening.
- CORS: restrict origins in production; allowlist by config.
- Rate limiting: enforce per-IP and per-user quotas on sensitive endpoints.
- Environment variables for secrets; never commit secrets.
- Password hashing: bcrypt.
- Proper error handling: avoid leaking stack traces in production.

---

## 15. File uploads

- Use multipart/form-data endpoints for file uploads (design only).
- Accept only whitelisted types (images: jpeg,png; pdf for docs; qr: png/svg).
- Enforce size limits; store in object storage (S3) and store references in DB.

---

## 16. API documentation & versioning

- Maintain OpenAPI/Swagger specification (planned).
- API docs must reflect /api/v1/ contract.
- Add changelog when new versions are introduced.

---

## 17. Development rules

- Controllers: thin; orchestrate validators, services, and responses.
- Services: contain business logic and DB interaction.
- Validators: input validation and sanitization (server/validators).
- Utils: shared helpers (server/utils).
- Middleware: reusable cross-cutting concerns (auth, error handler, rate limit).
- Keep endpoints consistent and predictable; write tests for each endpoint behavior.

---

## 18. Future APIs & expansion

- AI Assistant endpoints (read-only recommendation endpoints initially).
- Real-time notifications and crowd updates (websockets / push).
- Emergency mode endpoints and admin controls.
- Analytics endpoints (aggregated read-only APIs).

---

## 19. Project rules

Cline must:
- Follow this API standard for all backend work.
- Keep response formats consistent.
- Preserve endpoint naming conventions and versioning.
- Use PowerShell-compatible commands when running shell actions.
- Update this document before breaking API changes.

---

## 20. Final notes

- This document is a standards reference only — no implementation included.
- Before implementation: finalize authentication flows, rate limits, and OpenAPI spec.