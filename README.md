# LastCall — Frontend

**Real-time auction marketplace interface built with Next.js, TypeScript, and Socket.IO.**

LastCall is a full-stack auction platform focused on live bidding, auction discovery, seller workflows, account management, watchlists, and a simulated wallet/ledger system.

This repository contains the **web application**.

> The wallet currently uses demo credit. No real payment is processed.


## Live application

**Frontend:** https://lastcall-frontend.vercel.app

Backend repository:

https://github.com/sebitsamir/lastcall-backend

---

## What LastCall demonstrates

LastCall goes beyond a static marketplace UI.

The frontend coordinates:

- authenticated application state,
- auction discovery and filtering,
- detailed auction views,
- live bid updates,
- seller listing creation,
- watchlists,
- profile and account flows,
- bid history,
- selling activity,
- wallet balances,
- transaction ledger pagination,
- real-time socket events.

The interesting engineering problem is keeping multiple views consistent while auction state can change in real time.

## Key features

### Auction marketplace

Users can browse auctions, view auction details, explore categories, and work with auction-specific state.

### Real-time bidding

Socket.IO is used to receive live auction updates and keep bidding surfaces synchronized with backend events.

### Auction detail experience

The auction detail route combines product information, current bidding state, countdown behavior, bid interaction, and real-time updates in one page.

### Seller workflow

Authenticated users can create auction listings and manage selling activity through account views.

### Watchlist

Users can save auctions they want to monitor and return to them from a dedicated watchlist.

### Account center

The application includes account surfaces for:

- profile,
- bids,
- selling,
- wallet,
- settings.

### Demo wallet and ledger

The wallet separates:

- available balance,
- funds reserved for bids,
- total buying power.

Transaction history is paginated and refreshed alongside user balance state after demo deposits.

**Important:** this is currently a simulated credit system—not a production payment wallet.

### Authentication state

The frontend maintains authenticated user state and coordinates authenticated API requests with the LastCall backend.

### Responsive interface

The product uses a dark editorial marketplace aesthetic with responsive layouts, reusable UI components, and motion.

## Technology stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn
- Framer Motion
- Zustand
- Axios
- Socket.IO Client
- React Hook Form
- Zod
- Lucide React
- Sonner

## Application structure

The App Router contains separate authenticated and main application areas.

Representative routes include:

```text
/login
/register

/auctions
/auctions/[id]
/auctions/create

/categories
/watchlist

/account
/account/profile
/account/bids
/account/selling
/account/wallet
/account/settings
```

## Backend integration

The frontend communicates with the LastCall API for:

- authentication,
- auctions,
- users,
- uploads,
- wallet/ledger operations.

Real-time updates are delivered through Socket.IO.

## Getting started

### Requirements

- Node.js 18+
- LastCall backend running locally or accessible remotely

### Clone

```bash
git clone https://github.com/sebitsamir/lastcall-frontend.git
cd lastcall-frontend
```

### Install

```bash
npm install
```

### Environment

Create `.env.local` and configure the public API base URL used by the application.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Use the actual backend URL for your environment.

### Run

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Architecture notes

### Client state

Zustand is used for global application state where cross-page continuity is required.

### API layer

Axios-based API modules centralize communication with backend resources.

### Real-time layer

Socket.IO Client handles server-pushed auction events rather than relying on aggressive polling.

### Validation

React Hook Form and Zod support structured form handling and validation.

## Current status

The frontend implements a broad marketplace experience and is connected to the LastCall backend.

The project should be described as a **portfolio-grade full-stack auction system** rather than a production financial platform. Payment flows remain simulated.

## Related repository

Backend:

https://github.com/sebitsamir/lastcall-backend


## Author

**Sebit Samir**

GitHub: [@sebitsamir](https://github.com/sebitsamir)
