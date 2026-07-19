# 🏟️ StadiumGenie-AI

> An AI-powered stadium discovery, event booking, ticketing, and management platform with a context-aware stadium assistant.

StadiumGenie-AI is a full-stack web application designed to simplify the stadium and live-event experience for visitors while providing management capabilities for administrators.

The platform combines stadium discovery, event exploration, booking, simulated payments, QR-based ticketing, ticket verification, and administration with a context-aware AI assistant powered by Google Gemini.

The AI assistant can use the user's current stadium or event context to provide more relevant guidance about venues, events, facilities, accessibility, transportation, navigation, ticket assistance, and stadium-related queries.

---

## 📌 Challenge Vertical

**Chosen Vertical:** Smart Stadium & Event Experience

StadiumGenie-AI focuses on improving the experience of people attending stadium events by bringing multiple parts of the visitor journey into a single platform.

The solution is designed around two primary personas:

### 👤 Stadium Visitor

A visitor can:

- Discover stadiums
- Browse upcoming events
- View detailed stadium and event information
- Search and filter available options
- Register and authenticate securely
- Book an event
- Complete a simulated payment
- Receive a digital ticket
- Access QR-based ticket information
- Verify tickets
- Ask the AI assistant stadium and event-related questions

### 🛡️ Administrator

An administrator can access protected management functionality for:

- Stadium management
- Event management
- Booking oversight
- User management
- Administrative dashboards

---

# 🎯 Problem Statement

Attending a large stadium event often requires users to interact with fragmented sources of information.

A visitor may need to separately search for:

- Stadium information
- Event schedules
- Ticket availability
- Venue facilities
- Accessibility information
- Transportation options
- Stadium rules
- Booking details
- Ticket verification

Generic AI assistants can answer broad questions but often lack the context of the specific stadium or event a visitor is currently viewing.

**StadiumGenie-AI addresses this problem by combining the event journey with a context-aware AI assistant in one application.**

Instead of functioning only as a generic chatbot, the assistant can receive stadium and event context from the application and use data retrieved from MongoDB to construct a more relevant prompt for the generative AI model.

---

# 💡 Solution Overview

StadiumGenie-AI combines three major capabilities:

### 1. Stadium & Event Discovery

Users can browse stadiums and events through a React-based interface and access detailed information about each venue or event.

### 2. Booking & Digital Ticket Workflow

Authenticated users can move through a booking workflow, complete a simulated payment, and receive ticket information with QR generation.

### 3. Context-Aware AI Stadium Assistant

The integrated AI assistant uses Google Gemini and can be supplied with the stadium or event currently being viewed.

The backend retrieves relevant information from MongoDB and includes that context when communicating with the AI model.

This enables the assistant to provide responses that are better grounded in the application's available stadium and event information.

---

# 🤖 StadiumGenie AI Assistant

The AI assistant is a core part of StadiumGenie-AI.

It is designed to behave as a digital stadium concierge rather than a disconnected general-purpose chatbot.

## Context-Aware Assistance

When available, the application passes context such as:

- `stadiumId`
- `eventId`

The backend can then retrieve relevant stadium or event data from MongoDB.

### Stadium context may include:

- Stadium name
- City
- State or region
- Country
- Address
- Seating capacity
- Description
- Facilities
- Amenities
- Supported sports
- Geographic coordinates

### Event context may include:

- Event title
- Sport
- Organizer
- Description
- Start time
- End time
- Event status
- Available seats
- Ticket price
- Venue information
- Venue facilities
- Venue amenities

This information is used to construct contextual instructions for the Gemini model.

---

# 🧠 AI Decision Logic

The assistant follows a context-first workflow.

```text
User opens StadiumGenie-AI
          │
          ▼
User navigates to a stadium or event
          │
          ▼
Application detects available context
(stadiumId / eventId)
          │
          ▼
User sends a question to StadiumGenie AI
          │
          ▼
Backend receives the request
          │
          ├── Stadium context available?
          │       └── Retrieve stadium data from MongoDB
          │
          ├── Event context available?
          │       └── Retrieve event + venue data from MongoDB
          │
          ▼
Construct contextual AI instructions
          │
          ▼
Send request to Google Gemini
          │
          ▼
Return relevant response to the user
```

This approach allows the same assistant to adapt its response according to where the user is in the application.

If contextual data cannot be retrieved, the service is designed to handle the failure gracefully rather than allowing a database context lookup to crash the assistant workflow.

---

# 💬 Example Assistant Use Cases

The StadiumGenie assistant is designed to help with questions such as:

- How do I navigate to my seating section?
- What accessibility services are available?
- How can I reach the stadium using public transport?
- What facilities or amenities are available?
- Where can I find food courts or washrooms?
- What items may be restricted inside the stadium?
- How can I verify my ticket?
- What information is available about this event?
- What is the seating capacity of this stadium?

The frontend also provides quick assistance categories to make common stadium questions easier to access.

---

# ✨ Key Features

## 🏟️ Stadium Discovery

- Browse available stadiums
- Search stadium information
- Filter stadium listings
- View detailed stadium pages
- Display facilities and amenities
- Access venue-specific information

## 🎫 Event Discovery

- Browse events
- Search and filter events
- View detailed event information
- Access venue information associated with events
- View ticket-related event details

## 👤 Authentication

- User registration
- User login
- JWT-based authentication
- Protected application routes
- Authentication middleware
- Role-aware authorization

## 📅 Booking

- Authenticated booking workflow
- Booking management through backend APIs
- User-specific booking operations
- Integration with payment and ticket workflows

## 💳 Simulated Payments

The project uses a simulated payment workflow for demonstration purposes.

Supported application logic includes simulated payment processing without requiring users to provide real payment credentials to a third-party gateway.

Payment references are generated by the backend and payment records are stored in MongoDB.

For demo reliability:

- Digital payment methods can be simulated as successful
- Cash payments can remain pending while reserving the booking
- Successful payment can confirm the associated booking

> **Note:** This is a demonstration payment system and should not be treated as a production financial transaction system.

## 🎟️ Digital Ticketing

- Ticket generation following eligible payment flows
- QR-based ticket functionality
- Ticket retrieval
- Ticket verification route
- Digital ticket workflow integrated with bookings

## 🔍 Ticket Verification

The application includes a public ticket verification route:

```text
/verify-ticket/:ticketNumber
```

This allows ticket information to be verified using its ticket identifier.

## 🛡️ Admin Dashboard

Role-protected administration functionality includes pages for:

- Dashboard overview
- Stadium management
- Add stadium
- Edit stadium
- Event management
- Add event
- Edit event
- Booking management
- User management

Admin routes are protected separately from normal authenticated user routes.

## 🤖 AI Stadium Assistant

- Google Gemini integration
- Context-aware stadium assistance
- Event-aware assistance
- MongoDB-backed context retrieval
- Quick question categories
- Multilingual-oriented frontend assistant interface
- Graceful handling when AI configuration or contextual information is unavailable

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────┐
│          React + Vite Client         │
│                                      │
│ Stadiums │ Events │ Booking │ Admin  │
│ Tickets  │ Profile │ AI Chat Widget  │
└──────────────────┬───────────────────┘
                   │
                   │ REST API
                   ▼
┌──────────────────────────────────────┐
│        Node.js + Express API         │
│                                      │
│ Routes → Controllers → Services      │
│             ↓                        │
│           Models                     │
└───────────────┬──────────────┬───────┘
                │              │
                ▼              ▼
       ┌───────────────┐  ┌───────────────┐
       │    MongoDB    │  │ Google Gemini │
       │   + Mongoose  │  │      API      │
       └───────────────┘  └───────────────┘
```

---

# 🔄 Application Workflow

```text
Discover Stadium / Event
          │
          ▼
View Details
          │
          ├──────────────► Ask StadiumGenie AI
          │                       │
          │                       ▼
          │               Context-aware response
          │
          ▼
Authenticate
          │
          ▼
Create Booking
          │
          ▼
Simulated Payment
          │
          ▼
Booking Confirmation
          │
          ▼
Ticket Generation
          │
          ▼
QR / Ticket Verification
```

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- React Router
- JavaScript
- Component-based UI architecture
- Context API for authentication state

## Backend

- Node.js
- Express
- ES Modules
- REST API architecture

## Database

- MongoDB
- Mongoose

## Artificial Intelligence

- Google Gemini
- `@google/generative-ai`

## Authentication & Security

- JSON Web Tokens (JWT)
- bcrypt
- Helmet
- CORS
- Express Rate Limit
- express-validator

## Additional Tools

- Morgan
- Cookie Parser
- Nodemailer
- QR Code generation
- Swagger UI

---

# 📁 Project Structure

```text
StadiumGenie-AI/
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js
│   │   │
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── ChatWidget.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Pagination.jsx
│   │   │   │
│   │   │   ├── event/
│   │   │   ├── layout/
│   │   │   ├── stadium/
│   │   │   └── ui/
│   │   │
│   │   ├── config/
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Stadiums.jsx
│   │   │   ├── StadiumDetails.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Payment.jsx
│   │   │   ├── Tickets.jsx
│   │   │   ├── VerifyTicket.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Admin*.jsx
│   │   │
│   │   ├── routes/
│   │   │   ├── AppRouter.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── AdminRoute.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── admin.service.js
│   │   │   ├── ai.service.js
│   │   │   ├── auth.service.js
│   │   │   ├── booking.service.js
│   │   │   ├── event.service.js
│   │   │   ├── payment.service.js
│   │   │   ├── stadium.service.js
│   │   │   └── ticket.service.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── ai.routes.js
│   │   ├── auth.routes.js
│   │   ├── booking.routes.js
│   │   ├── event.routes.js
│   │   ├── payment.routes.js
│   │   ├── stadium.routes.js
│   │   └── ticket.routes.js
│   │
│   ├── services/
│   │   ├── admin.service.js
│   │   ├── ai.service.js
│   │   ├── auth.service.js
│   │   ├── booking.service.js
│   │   ├── email.service.js
│   │   ├── event.service.js
│   │   ├── payment.service.js
│   │   ├── stadium.service.js
│   │   └── ticket.service.js
│   │
│   ├── validators/
│   ├── seeds/
│   ├── scripts/
│   ├── app.js
│   ├── index.js
│   ├── swagger.js
│   └── package.json
│
├── docs/
├── scripts/
├── .env.example
├── .gitignore
├── IMPLEMENTATION_PLAN.md
└── README.md
```

---

# 🔌 API Modules

The backend exposes REST API modules under `/api/v1`.

| Module | Endpoint |
|---|---|
| Authentication | `/api/v1/auth` |
| Stadiums | `/api/v1/stadiums` |
| Events | `/api/v1/events` |
| Bookings | `/api/v1/bookings` |
| Payments | `/api/v1/payments` |
| Tickets | `/api/v1/tickets` |
| Administration | `/api/v1/admin` |
| AI Assistant | `/api/v1/ai` |

Additional endpoints:

```text
GET /health
```

API documentation is configured through Swagger UI when available.

```text
/api-docs
```

---

# 🔐 Authentication & Authorization

StadiumGenie-AI uses JWT-based authentication.

Protected API requests use a bearer token:

```text
Authorization: Bearer <token>
```

The application separates authorization into different levels.

### Public Access

Examples include:

- Home
- Stadium browsing
- Stadium details
- Event browsing
- Event details
- Ticket verification
- Privacy page

### Authenticated User Access

Protected functionality includes:

- Booking
- Payment
- Tickets
- User profile

### Administrator Access

Administrator-only functionality includes:

- Admin dashboard
- Stadium management
- Event management
- Booking management
- User management

The frontend uses protected route components, while the backend applies authentication and administrative authorization middleware.

---

# 🔒 Security Considerations

The project includes several security-oriented practices:

- Password hashing using bcrypt
- JWT-based authentication
- Role-based access control
- Helmet security headers
- CORS middleware
- API rate limiting support
- Input validation using `express-validator`
- Protected administrator routes
- Environment-based secret configuration
- MongoDB ObjectId validation in service logic
- Booking ownership validation during payment processing

Sensitive values should always be stored in environment variables.

**Never commit the following to GitHub:**

```text
.env
MongoDB credentials
GEMINI_API_KEY
JWT secrets
Email credentials
Private API keys
```

The repository should contain only `.env.example` files with placeholder values.

---

# ⚙️ Environment Configuration

Create a `.env` file inside the server directory based on:

```text
server/.env.example
```

Example configuration:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority

PORT=5000

GEMINI_API_KEY=your_gemini_api_key_here

GEMINI_MODEL=gemini-1.5-flash
```

Additional environment variables may be required depending on the authentication and email configuration used in your environment.

> Never expose real credentials in the repository.

---

# 🚀 Getting Started

## Prerequisites

Install:

- Node.js 18+
- npm
- Git

You will also need:

- A MongoDB database, such as MongoDB Atlas
- A Google Gemini API key for AI functionality

---

## 1. Clone the Repository

```bash
git clone https://github.com/Rerishabh/StadiumGenie-AI.git
cd StadiumGenie-AI
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

## 3. Configure Backend Environment

Create:

```text
server/.env
```

Use `server/.env.example` as the template and provide your own credentials.

---

## 4. Start the Backend

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

By default, the server is configured to use the port defined by the `PORT` environment variable.

---

## 5. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

---

## 6. Start the Frontend

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

---

# 🗄️ Database

StadiumGenie-AI uses MongoDB with Mongoose.

The application stores data related to core entities such as:

- Users
- Stadiums
- Events
- Bookings
- Payments
- Tickets

MongoDB Atlas can be used as the hosted database for development and deployment.

Developer seed scripts are available under:

```text
server/seeds/
```

These can be used to populate development data when required.

---

# 💳 Payment Design

The current implementation intentionally uses a **simulated payment gateway**.

This design was chosen to:

- Keep the demonstration self-contained
- Avoid processing real financial information
- Allow evaluators to test the complete booking workflow
- Demonstrate payment-to-ticket application logic without requiring paid third-party infrastructure

The backend generates unique payment references and maintains payment state in MongoDB.

This implementation is intended for demonstration and development purposes only.

---

# 🎟️ Ticket Flow

A typical ticket workflow is:

```text
User selects event
      ↓
User creates booking
      ↓
Payment is processed through simulator
      ↓
Booking status is updated
      ↓
Ticket is generated
      ↓
User accesses ticket
      ↓
QR / ticket number can be verified
```

Ticket creation is designed to integrate with eligible successful or confirmed payment flows.

---

# 🧪 Testing & Validation

The project contains development and verification scripts under:

```text
server/scripts/
```

These include utilities for areas such as:

- AI endpoint testing
- Gemini connectivity testing
- Booking inspection
- Model inspection
- Image verification

Example scripts present in the project include:

```text
test-ai-endpoint.js
test-gemini-live.js
check-bookings.js
check-model.js
verify-images.js
```

In addition to script-based checks, the application should be manually validated across the following workflows:

1. User registration
2. User login
3. Stadium discovery
4. Event discovery
5. Stadium detail navigation
6. Event detail navigation
7. AI assistant interaction
8. Booking creation
9. Simulated payment
10. Ticket generation
11. Ticket verification
12. Protected-route access
13. Administrator authorization

---

# ♿ Accessibility & Usability

StadiumGenie-AI aims to provide an accessible and understandable user experience through:

- Clear navigation
- Consistent application layouts
- Loading states
- Empty states
- Search and filtering
- Pagination components
- Dedicated accessibility-related AI quick questions
- Responsive component-oriented frontend design
- Separation of public, authenticated, and administrative workflows

Accessibility remains an area for continued improvement and should be validated with automated accessibility tools and keyboard/screen-reader testing before production use.

---

# ⚡ Efficiency & Maintainability

The project uses a modular architecture to separate responsibilities.

Backend logic is organized into:

```text
Routes
   ↓
Controllers
   ↓
Services
   ↓
Models / Database
```

Frontend logic is separated into:

```text
Pages
Components
Layouts
Routes
Services
Context
Hooks
Configuration
```

This separation helps make the application easier to:

- Maintain
- Debug
- Test
- Extend
- Refactor

Database queries use Mongoose, and contextual AI data is retrieved only when relevant stadium or event identifiers are available.

---

# 🧩 Assumptions

The current implementation makes the following assumptions:

1. Users have internet connectivity to access the application and AI service.
2. MongoDB is available through either MongoDB Atlas or another configured MongoDB instance.
3. The Gemini API key is configured for AI functionality.
4. AI responses may occasionally be inaccurate and should not replace official venue or emergency instructions.
5. Payment functionality is simulated and does not represent real financial processing.
6. Ticket generation and verification are demonstration implementations and would require additional anti-fraud controls for production use.
7. Stadium and event information is dependent on the accuracy of data stored in the application database.
8. Administrative users are trusted to manage stadium and event data responsibly.
9. Production deployment would require stricter CORS configuration, monitoring, secret management, logging policies, and infrastructure hardening.

---

# 📊 Evaluation Alignment

The project was structured with the challenge evaluation criteria in mind.

## Code Quality

- Modular frontend and backend architecture
- Separation of routes, controllers, services, and models
- Reusable React components
- Dedicated service layers
- Clear separation between user and administrator functionality

## Security

- JWT authentication
- bcrypt password hashing
- Role-based access control
- Helmet
- CORS
- Input validation
- Environment-based secret handling
- Protected user and admin routes

## Efficiency

- Context is retrieved only when relevant identifiers are available
- Mongoose is used for structured database interaction
- Service-oriented architecture reduces duplicated business logic
- AI context is assembled dynamically rather than hardcoding individual venue responses

## Testing

- Development verification scripts
- AI endpoint testing utilities
- Gemini connectivity testing
- Booking and model inspection utilities
- Manual end-to-end workflow validation

## Accessibility

- Clear navigation structure
- Loading and empty states
- Search/filter functionality
- Accessibility assistance as an AI use case
- Component-based frontend suitable for continued accessibility improvements

## Problem Statement Alignment

The application directly addresses the challenge expectation of building a:

- Smart assistant
- Dynamic assistant
- Context-aware system
- Logically adaptive experience
- Practical real-world solution

The AI assistant is integrated into the actual stadium and event experience rather than existing as an isolated chatbot.

---

# 🌐 Deployment

**Live Application:** `Deployment link will be added here`

**GitHub Repository:**  
https://github.com/Rerishabh/StadiumGenie-AI

> The deployment URL will be updated after production deployment is completed.

---

# 📸 Screenshots

Screenshots or demonstrations of the following can be added here:

- Home page
- Stadium discovery
- Stadium details
- Event discovery
- Event details
- StadiumGenie AI assistant
- Booking workflow
- Digital ticket
- Ticket verification
- Admin dashboard

---

# 🔮 Future Improvements

Potential future enhancements include:

- Production payment gateway integration
- Real-time seat selection
- Interactive stadium maps
- Turn-by-turn indoor stadium navigation
- Live event updates
- Real-time crowd information
- Push notifications
- Parking availability integration
- Public transport integration
- Advanced AI recommendations
- Voice-based stadium assistant
- Improved multilingual support
- Enhanced accessibility auditing
- Automated unit and integration test suites
- CI/CD pipeline
- Production analytics and monitoring
- Stronger production ticket anti-fraud mechanisms

---

# ⚠️ AI Disclaimer

StadiumGenie AI responses are generated using artificial intelligence and may occasionally contain inaccurate or incomplete information.

For emergencies, security incidents, medical situations, or official stadium policies, users should always follow instructions from stadium staff, event organizers, emergency services, and official venue information.

---

# 👨‍💻 Author

**Rishabh Paira**

Developed as an AI-powered full-stack solution for the PromptWars coding challenge.

---

## ⭐ StadiumGenie-AI

**Discover. Book. Attend. Ask.**

A smarter digital companion for the stadium experience.