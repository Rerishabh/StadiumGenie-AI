# StadiumGenie-AI Project Memory

## 1. Project Overview
- Project name: StadiumGenie-AI
- Purpose: Provide AI-driven assistance and operations for stadium events (navigation, recommendations, crowd insights, and management tools).
- Vision: A reliable, scalable platform that improves fan experience, stadium operations, and safety using AI and a clean MERN architecture.
- Target users: Event attendees, stadium staff, operations teams, and administrators.
- Primary goals:
  - Real-time assistance and navigation for attendees
  - Efficient stadium and event management tools
  - Data-driven crowd and safety insights
  - Modular, secure, and maintainable platform for future AI integrations

## 2. Project Status
- Current development phase: Scaffold and planning completed; ready to proceed to Phase 2 (Memory & Database Design).
- Completed milestones:
  - Monorepo scaffold created (client + server)
  - Core configs: Vite, Tailwind, PostCSS, Express app, MongoDB connector stub
  - Documentation skeleton (PRD, Architecture, Design, Rules)
- Upcoming milestones:
  - Phase 2: Memory.md and DatabaseDesign.md (schema definitions)
  - Phase 3: Core backend services and API endpoints
  - Phase 4: Frontend pages, routing, and AI integration phases

## 3. Technology Stack

Frontend
- React
- Vite
- Tailwind CSS
- React Router (planned)
- Axios (planned)

Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- dotenv
- Helmet
- Morgan
- express-validator
- cookie-parser

Development Tools
- VS Code
- Git / GitHub
- GitHub Copilot
- Cline (project assistant)

## 4. Folder Structure

Frontend (client)
- client/
  - package.json
  - index.html
  - postcss.config.cjs
  - tailwind.config.cjs
  - .eslintrc.cjs
  - src/
    - assets/
      - .gitkeep
    - components/
      - common/
        - .gitkeep
      - layout/
        - .gitkeep
      - ui/
        - .gitkeep
    - context/
      - .gitkeep
    - hooks/
      - .gitkeep
    - layouts/
      - .gitkeep
    - pages/
      - .gitkeep
    - routes/
      - .gitkeep
    - services/
      - .gitkeep
    - styles/
      - index.css
    - utils/
      - .gitkeep

Backend (server)
- server/
  - package.json
  - app.js
  - index.js
  - .env.example
  - config/
    - db.js
  - controllers/
    - .gitkeep
  - middleware/
    - .gitkeep
  - models/
    - .gitkeep
  - routes/
    - .gitkeep
  - services/
    - .gitkeep
  - validators/
    - .gitkeep
  - utils/
    - .gitkeep

## 5. Architecture Decisions
- MERN architecture selected for separation of concerns and proven ecosystem.
- Layered backend: routes → controllers → services → models for testability and maintainability.
- Component-based frontend with clear separation: presentational UI primitives (ui/), shared components (common/), layout components, and page views.
- REST API design for predictable endpoints and broad compatibility.
- ES Modules used throughout for modern syntax and clearer imports.
- Modular folder organization to support incremental feature development and easy testing.

## 6. Coding Standards
- Use ES Modules (import / export).
- Prefer functional React components and hooks.
- Use async/await for asynchronous operations; handle errors with try/catch and centralized error handling.
- Consistent naming conventions (camelCase for variables/functions, PascalCase for components).
- Build reusable components; avoid duplication.
- Keep functions small and focused; single responsibility principle.
- Validate inputs at the API boundary (validators) and sanitize where needed.
- Store secrets in environment variables; never commit secrets.
- Add unit/integration tests as features are implemented.

## 7. Naming Conventions
- Components: PascalCase (e.g., SeatMap, NavBar)
- Files: kebab-case or camelCase consistent per directory (e.g., seat-map.jsx or seatMap.js within components)
- Variables / Functions: camelCase
- Database Models: PascalCase singular (e.g., User, Booking)
- API routes: kebab-case endpoints (e.g., /api/v1/bookings)
- Environment variables: UPPER_SNAKE_CASE (e.g., MONGODB_URI, JWT_SECRET)

## 8. API Standards
- REST conventions: use nouns for resources, HTTP verbs for actions.
- Response format:
  - Success: { "ok": true, "data": ... }
  - Error: { "ok": false, "error": { "message": "...", "code": "..." } }
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 422, 500).
- Authentication: Bearer token in Authorization header (Authorization: Bearer <token>).
- Versioning: prefix API with /api/v1/ and increment as breaking changes are introduced.
- Pagination, filtering, and sorting via query parameters where applicable.

## 9. Database Strategy
- Primary DB: MongoDB with Mongoose ODM.
- Use modular schema definitions under server/models.
- Keep reference vs embedded documents decisions documented in DatabaseDesign.md.
- Maintain separate DatabaseDesign.md for detailed schema diagrams and migration plans.

## 10. AI Integration Plan
Planned AI features (implemented in later phases):
- Google Gemini API integration for advanced language/assistant features.
- AI Chat Assistant for attendee support.
- AI Recommendations for seats, concessions, and navigation.
- AI Route Assistance for indoor navigation and gate guidance.
- AI Crowd Insights for congestion detection and safety alerts.

AI work will be phased: prototype → secure API integration → monitoring and cost controls.

## 11. Security Standards
- JWT-based authentication for protected routes (implementation later).
- Passwords hashed with bcrypt before storage.
- Input validation via express-validator at route level.
- CORS policy: restrict origins in production.
- Use Helmet to set secure HTTP headers.
- Store secrets in environment variables; never commit secrets.
- Implement rate limiting in future for public endpoints.
- Centralized error handling and structured logging for incident response.

## 12. Development Workflow
- Plan → Review → Act → Test → Commit
- Use feature branches and meaningful commit messages.
- PRs must include description, testing steps, and reviewers.
- Always include tests for new backend logic and critical frontend flows.

## 13. Git Workflow
- Conventional commits encouraged (type: scope: subject).
- One feature per branch and one logical change per commit.
- Rebase or squash commits in PRs as policy dictates.

## 14. Future Modules
Planned modules (non-exhaustive):
- Authentication
- User Dashboard
- Stadium Management
- Match Management
- Seat Booking
- Food Ordering
- Navigation
- Emergency Mode
- Crowd Monitoring
- Notifications
- AI Assistant
- Admin Dashboard

## 15. Project Rules
Cline must follow these rules:
- Read Memory.md before implementing features.
- Follow existing architecture; avoid unnecessary refactors.
- Never change folder structure without explicit approval.
- Avoid placeholder code unless requested.
- Use PowerShell-compatible commands when running shell actions.
- Keep code production-ready and consistent.
- Preserve documentation and update Memory.md when architectural changes are approved.

---

This document is the single-source project memory. Maintain it as the authoritative reference for architecture, conventions, and roadmap. Update DatabaseDesign.md and other design docs as schemas and flows are finalized.