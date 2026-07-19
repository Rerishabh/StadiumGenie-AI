# StadiumGenie AI
## System Architecture Document

---

# Overview

StadiumGenie AI follows a modern client-server architecture powered by React, Node.js, Google Gemini AI, Google Maps, and Firebase.

The application separates the frontend, backend, AI services, authentication, and database into independent components for scalability and maintainability.

---

# High-Level Architecture

```
                    +----------------------+
                    |      User            |
                    +----------+-----------+
                               |
                               |
                      React Frontend
                               |
                REST API (HTTPS Requests)
                               |
                  Node.js + Express Backend
                               |
      +------------+-----------+-----------+------------+
      |            |                       |            |
 Google Maps    Gemini API          Firebase Auth   Firestore
     API           API                  Service      Database
```

---

# Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

---

## Backend

- Node.js
- Express.js

---

## Database

- Firebase Firestore

Alternative:
- MongoDB Atlas

---

## AI

- Google Gemini API

Purpose:

- Route recommendations
- Food recommendations
- Translation
- Travel suggestions
- Intelligent responses

---

## Maps

Google Maps Platform

Services:

- Maps JavaScript API
- Directions API
- Geocoding API
- Places API

---

## Authentication

Firebase Authentication

Methods:

- Google Login
- Email & Password

---

## Deployment

Frontend

- Vercel

Backend

- Render

Database

- Firebase Cloud

---

# Folder Structure

```
StadiumGenie-AI/

│
├── assets/
│
├── client/
│   ├── public/
│   ├── src/
│   │
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── context/
│   ├── routes/
│   ├── assets/
│   ├── App.jsx
│   └── main.jsx
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── services/
│   ├── utils/
│   ├── models/
│   ├── app.js
│   └── server.js
│
├── docs/
│
└── README.md
```

---

# Frontend Architecture

Pages

- Home
- Login
- Dashboard
- Navigation
- Crowd Map
- Food Recommendation
- Transport Assistant
- Accessibility
- Emergency Mode
- Organizer Dashboard

Reusable Components

- Navbar
- Sidebar
- AI Chat Widget
- Search Bar
- Route Card
- Food Card
- Crowd Card
- Map Component
- Footer

---

# Backend Architecture

Controllers

- Auth Controller
- AI Controller
- Navigation Controller
- Crowd Controller
- Food Controller
- Transport Controller

Routes

/api/auth

/api/navigation

/api/crowd

/api/food

/api/transport

/api/emergency

/api/chat

---

# API Flow

Example

User

↓

React sends request

↓

Express API

↓

Gemini API

↓

Response returned

↓

React displays result

---

# Database Design

Collections

Users

```
id
name
email
photoURL
role
createdAt
```

Search History

```
id
userId
search
timestamp
```

Crowd Reports

```
id
location
density
time
```

Food Vendors

```
id
name
category
priceRange
location
```

Emergency Reports

```
id
type
location
time
status
```

---

# Authentication Flow

User

↓

Firebase Login

↓

Receive User Token

↓

Frontend stores session

↓

Backend verifies token

↓

Access Protected APIs

---

# AI Integration

Gemini API is responsible for:

- Food recommendations
- Language translation
- Navigation suggestions
- FAQ assistant
- Transport recommendations
- Accessibility guidance
- Emergency assistance

---

# Google Maps Integration

Maps Features

- Interactive Stadium Map
- Route Planning
- Place Search
- Directions
- Distance Calculation

---

# Security

- Firebase Authentication
- HTTPS Requests
- Environment Variables
- API Key Protection
- Input Validation
- Error Handling

---

# Scalability

The architecture supports future expansion:

- Multiple stadiums
- Multiple tournaments
- Real-time crowd analytics
- Voice assistant
- AR navigation
- Ticket integration

---

# Performance Goals

- Fast page loading
- Responsive UI
- Mobile-first design
- Reusable React components
- Optimized API requests

---

# Future Architecture Improvements

- Redis Caching
- WebSockets for live crowd updates
- AI Agent workflows
- Notification Service
- Microservices Architecture

---

# Architecture Summary

Frontend

React + Tailwind CSS

↓

Backend

Node.js + Express

↓

Services

Gemini AI

Google Maps

Firebase Authentication

Firestore Database

↓

Deployment

Vercel + Render + Firebase