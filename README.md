# LastCall - Premium Real-Time Auction Platform

**LastCall** is a high-end, full-stack real-time auction platform where collectors, investors, and connoisseurs compete for verified masterpieces. Built with a focus on security, millisecond-precision bidding, and a bespoke luxury user interface.

**Live Frontend:** [https://lastcall-frontend.vercel.app]
**Live Backend API:** [https://lastcall-backend.render.com]
**Frontend Repo:** [https:/github.com/sebitsamir/lastcall-frontend.git]
**Backend Repo:** [https://github.com/sebitsamir/lastcall-backend.git]

## Key Features

### Real-Time Bidding Engine

- Powered by **Socket.io** for bi-directional, millisecond-precision communication.
- Instant UI updates via optimistic rendering and WebSocket events when new bids are placed.
- Live countdown timers that synchronize across all connected clients.

### Enterprise-Grade Security

- **Authentication:** JWT-based auth using **HttpOnly cookies** to prevent XSS attacks, paired with silent refresh token rotation.
- **Data Sanitization:** Protected against NoSQL injection (`express-mongo-sanitize`), XSS (`xss`), and HTTP Parameter Pollution (`hpp`).
- **Rate Limiting:** Strict, tiered rate limiting (100 req/15min globally, 10 req/15min for auth endpoints) to prevent brute-force and DoS attacks.
- **Security Headers:** Implemented via `Helmet.js`.

### Bespoke Luxury UI/UX

- Custom design system built with **Tailwind CSS** and **shadcn/ui**.
- Editorial typography, sharp borders, and intentional whitespace (zero generic SaaS gradients).
- Fully responsive, dark-mode-first aesthetic with smooth **Framer Motion** animations.

### Advanced Functionality

- **Watchlist:** Users can save auctions and track them across sessions (persisted via Zustand & MongoDB).
- **Smart Filtering:** Debounced search, category filtering, and price range sorting.
- **State Management:** Global state handled efficiently using **Zustand** with custom Axios interceptors.

## ️ Tech Stack

### Frontend

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, shadcn/ui, Framer Motion
- **State Management:** Zustand
- **Networking:** Axios (Custom interceptors for auth & token refresh), Socket.io-client

### Backend

- **Runtime:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Real-time:** Socket.io
- **Security:** Helmet, CORS, Cookie-Parser, Bcrypt, JSON Web Tokens (JWT)

## Architecture & Security Flow

### Authentication & Token Refresh

To ensure maximum security, access tokens are never stored in `localStorage`.

1. Upon login, the backend sets an **HttpOnly cookie** containing the JWT.
2. The frontend Axios interceptor reads this cookie (via `js-cookie`) and attaches it to the `Authorization: Bearer` header for API requests.
3. If a request returns a `401 Unauthorized`, the Axios response interceptor **silently** calls the `/auth/refresh` endpoint using the refresh cookie, obtains a new access token, and retries the original failed request without interrupting the user.

### Real-Time Socket Integration

- Clients join specific "auction rooms" upon viewing an auction detail page (`socket.emit('joinAuction', id)`).
- When a bid is placed, the backend validates the bid, updates MongoDB, and broadcasts a `newBid` event exclusively to that room, ensuring low latency and reduced server load.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas URI)

### 1. Clone the Repositories

````bash
# Frontend
git clone [Frontend-Repo-URL]
cd lastcall-frontend

# Backend (in a separate terminal)
git clone [Backend-Repo-URL]
cd lastcall-backend






## Table of Contents
- [Key Features](#-key-features)]
- [Tech Stack](#-tech-stack)]
- [System Architecture & Security](#-system-architecture--security)
- [API Endpoints](#-api-endpoints)]
- [Getting Started](#-getting-started)]
- [Engineering Challenges & Learnings](#-engineering-challenges--learnings)
- [Author](#-author)


## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - Create a new user account (Rate limited)
- `POST /login` - Authenticate and receive JWT (Rate limited)
- `POST /refresh` - Silently refresh access token
- `POST /logout` - Invalidate session

### Auctions (`/api/v1/auctions`)
- `GET /` - Get all active auctions (supports filtering, pagination, sorting)
- `GET /:id` - Get single auction details
- `POST /` - Create a new auction (Admin/Seller)
- `POST /:id/bid` - Place a real-time bid

### Users (`/api/v1/users`)
- `GET /me` - Get current user profile
- `POST /watchlist/:auctionId` - Toggle auction watchlist
- `GET /watchlist` - Get user's saved auctions


### 2. Install Dependencies
npm install

3. Environment Variables
Backend (lastcall-backend/.env)
env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3001

Frontend (lastcall-frontend/.env.local)
env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
4. Run the Application
# Start Backend
npm run dev
# Start Frontend (in a new terminal)
npm run dev -- -p 3001
Visit http://localhost:3001 to view the app.


Engineering Challenges & Learnings:

Building LastCall involved solving several complex, real-world engineering hurdles:
1.	Mongoose Async Hook Conflicts: Resolved a critical TypeError: next is not a function crash caused by modern Mongoose's handling of async pre-save hooks. Learned the strict distinction between callback-based (function(next)) and promise-based (async function()) middleware execution.
2.	Deployment Routing Desyncs: Diagnosed and fixed a production 404 error caused by a mismatch between the frontend's compiled Axios baseURL and the backend's Express route mounting. Implemented strict environment variable synchronization between Vercel and Render.
3.	Dark Mode Autofill Styling: Overcame browser-level CSS overrides that forced white backgrounds and black text on autofilled inputs, implementing custom :-webkit-autofill pseudo-class overrides to maintain the luxury dark theme.
4.	State Persistence vs. Security: Balanced the need for persistent user sessions with security best practices by utilizing Zustand for client-side state while keeping sensitive JWTs strictly in HttpOnly cookies.


License
This project is licensed under the MIT License.

Author:
Sebit Samir

[Your LinkedIn URL] | https//:sebitsamir.vercel.app | sebitsamir@gmail.com

