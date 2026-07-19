# StadiumGenie AI
## Development Rules & Coding Guidelines

---

# Purpose

This document defines the coding standards, project rules, AI usage guidelines, and development practices for StadiumGenie AI.

The objective is to keep the codebase clean, scalable, secure, and easy to maintain throughout development.

---

# General Rules

- Write clean and readable code.
- Use meaningful variable and function names.
- Follow consistent folder structure.
- Keep components small and reusable.
- Avoid duplicate code.
- Comment only when necessary.
- Never hardcode sensitive information.
- Use environment variables for API keys.

---

# Technology Rules

## Frontend

Use:

- React
- Vite
- Tailwind CSS
- React Router
- Axios

Do NOT use:

- jQuery
- Bootstrap
- Inline CSS
- Class Components

Always use Functional Components.

---

## Backend

Use:

- Node.js
- Express.js

Follow REST API principles.

Each API should have:

- Validation
- Error handling
- Proper HTTP status codes

---

## Database

Primary database:

Firebase Firestore

Collections should use:

- camelCase field names
- unique IDs
- timestamps

Example:

```
userName
createdAt
profileImage
```

---

# AI Rules

Google Gemini API should only be used for:

- Navigation suggestions
- Food recommendations
- Translation
- Emergency guidance
- Transport recommendations
- AI Chat Assistant

Do NOT use AI for:

- Authentication
- Database operations
- Sensitive data processing

---

# Google Maps Rules

Always use Google Maps APIs for:

- Navigation
- Distance calculation
- Place search
- Route generation

Do not manually calculate routes.

---

# Authentication Rules

Use Firebase Authentication.

Allowed login methods:

- Google Login
- Email & Password

Never store passwords manually.

---

# API Rules

Each API endpoint should:

Return JSON

Example

```
{
    "success": true,
    "message": "Data fetched successfully",
    "data": {}
}
```

Error response

```
{
    "success": false,
    "message": "Invalid request"
}
```

---

# Folder Rules

Frontend

```
components/
pages/
layouts/
hooks/
services/
context/
utils/
assets/
```

Backend

```
controllers/
routes/
middleware/
services/
config/
models/
utils/
```

Never mix frontend and backend files.

---

# Naming Convention

Components

```
NavigationCard.jsx
FoodCard.jsx
EmergencyButton.jsx
```

Functions

```
getUserLocation()
generateRoute()
translateLanguage()
```

Variables

```
userName
crowdDensity
selectedRoute
```

Constants

```
MAX_USERS
API_URL
DEFAULT_LANGUAGE
```

---

# Git Rules

Commit frequently.

Good commit messages:

```
Added Login Page

Integrated Gemini API

Implemented Navigation Module

Fixed Authentication Bug

Improved Dashboard UI
```

Avoid:

```
update

changes

fix

new
```

---

# UI Rules

Maintain consistent design.

Primary Color

Blue

Secondary Color

White

Accent Color

Green

Use:

- Rounded corners
- Modern cards
- Icons
- Responsive layouts

Support:

- Desktop
- Tablet
- Mobile

---

# Accessibility Rules

Every page should support:

- Keyboard navigation
- Proper color contrast
- Alt text for images
- Screen readers
- Large buttons

Accessibility is a core feature of this project.

---

# Performance Rules

- Lazy load pages.
- Optimize images.
- Reuse React components.
- Avoid unnecessary re-renders.
- Cache API requests where possible.

---

# Security Rules

Never expose:

- Gemini API Key
- Firebase Keys (private credentials)
- Google Maps Secret Keys

Always use:

```
.env
```

Example

```
VITE_GEMINI_API_KEY=

VITE_GOOGLE_MAPS_API_KEY=

FIREBASE_API_KEY=
```

Never upload `.env` to GitHub.

---

# Error Handling

Always handle:

- Network failures
- Invalid API responses
- Empty data
- Authentication failures
- Location permission denial

Display friendly error messages.

---

# AI Coding Rules

When generating code using AI:

- Keep functions modular.
- Avoid unnecessary libraries.
- Follow project folder structure.
- Write reusable components.
- Explain complex logic with comments.
- Do not generate unused code.

Every generated file should be production-ready.

---

# Documentation Rules

Whenever a new feature is added:

Update:

- README.md
- Phases.md
- Memory.md (after coding starts)

Keep documentation synchronized with the project.

---

# Testing Rules

Before every commit:

- Check UI responsiveness.
- Verify API responses.
- Test authentication.
- Test Gemini AI responses.
- Test Google Maps functionality.
- Test accessibility features.

---

# Code Quality Checklist

Before marking any feature complete:

✔ No console errors

✔ Responsive UI

✔ Clean folder structure

✔ No duplicated code

✔ Proper error handling

✔ Secure API usage

✔ Environment variables configured

✔ Mobile friendly

✔ Accessible design

✔ Documentation updated

---

# Project Goal

The project should be:

- Scalable
- Secure
- Responsive
- AI-powered
- Accessible
- Production-ready
- Easy to maintain
- Suitable for Hack2Skill PromptWars Challenge 4