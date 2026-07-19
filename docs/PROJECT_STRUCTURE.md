# Project Structure — StadiumGenie-AI

This document explains the backend project layout and responsibilities of each top-level folder.

Project tree (high level)
- server/
  - config/         -> configuration helpers (e.g. DB connection)
  - controllers/    -> HTTP request handlers (thin, call services)
  - middleware/     -> Express middleware (auth, admin, validation)
  - models/         -> Mongoose models and schemas
  - routes/         -> Express route definitions
  - services/       -> Business logic, data access, and orchestrations
  - validators/     -> express-validator rules for inputs
  - docs/           -> Swagger/OpenAPI and API docs
  - seeds/          -> Idempotent developer seed scripts
  - utils/          -> Small utilities and helpers
- client/           -> Frontend placeholder (Vite + React)
- docs/             -> Project-level documentation (API.md, PROJECT_STRUCTURE.md)

Folder responsibilities

- config
  - Contains database connection helpers and config loaders. Keep environment-specific wiring here.

- controllers
  - Receive validated requests from routes, call services, and format HTTP responses following APIStandards.
  - Controllers should remain thin — most heavy lifting happens in services.

- middleware
  - Express middleware for authentication (auth.middleware), admin RBAC (admin.middleware), and request validation.

- models
  - Mongoose schemas and model definitions. Do not put application logic here.

- routes
  - Express routing layer. Route definitions attach middleware and controllers.

- services
  - Core application logic, database queries, and orchestration. Services are reusable from controllers or other services.

- validators
  - Request validation rules using express-validator.

- docs
  - OpenAPI/Swagger specs and generated docs.

- seeds
  - Developer idempotent seed scripts to populate sample data.

- scripts
  - Utility scripts and one-off verification scripts used during development.

Request flow
Client
  ↓
Routes (route definitions + middleware)
  ↓
Controllers (validate + format)
  ↓
Services (business logic, DB queries)
  ↓
Models (Mongoose)
  ↓
MongoDB

Authentication flow
- Clients authenticate using email/password via /api/v1/auth/login.
- Server returns a JWT access token.
- Client includes token in Authorization: Bearer <token>.
- auth.middleware verifies token, populates req.user from JWT payload.
- Controllers use req.user to enforce ownership or pass to services.

Admin RBAC flow
- admin.middleware checks req.user.role === 'admin' (no DB query).
- Admin-only routes are protected by auth.middleware then admin.middleware.
- Non-admins receive 403 with standardized response.

Notes
- Keep controllers thin and move database logic to services.
- Seed scripts are idempotent and safe to run multiple times.
- API documentation is maintained in docs/API.md and server/docs/openapi.yaml.