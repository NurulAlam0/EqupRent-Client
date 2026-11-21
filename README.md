# Rentora

Rentora is an equipment-rental marketplace connecting people who need
equipment with owners who want to rent it out. This repository contains the
Next.js frontend; the Express API runs separately.

## Live demo

[Open Rentora](https://equp-rent-client.vercel.app/)

## Features

- Browse, search, filter, sort, and paginate approved equipment listings.
- Create an account and sign in with email/password or Google.
- Role-based customer, owner, and admin dashboards.
- Submit equipment for approval and manage listings and rentals.
- Save favorite equipment and book available items for selected dates.
- Pay for rentals through Stripe Checkout.
- Leave a rating and review after a paid rental is completed.
- Manage users, equipment approvals, and rentals as an administrator.
- Responsive interface with a saved light or dark theme preference.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Authentication | Better Auth (email/password), Express API (Google OAuth) |
| API | Express, TypeScript |
| Data | MongoDB, Mongoose |
| Payments | Stripe Checkout |

## Requirements

- Node.js and npm
- MongoDB
- The separate Rentora Express API

## Getting started

1. Install the frontend dependencies:

   ```bash
   npm install
   ```

2. Create a private environment file (for example, `.env.local`) in the
   project root. Add the values for your local API, MongoDB, and Better Auth:

   ```dotenv
   BACKEND_URL=http://localhost:5050
   NEXT_PUBLIC_API_URL=http://localhost:5050
   BETTER_AUTH_URL=http://localhost:3000
   NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
   BETTER_AUTH_SECRET=replace-with-a-long-random-secret
   MONGODB_URI=mongodb://127.0.0.1:27017/rentora
   ```

   Use your own MongoDB connection string and generate a unique secret for
   `BETTER_AUTH_SECRET`. Keep environment files private and never commit
   credentials.

3. Start the Express API from its separate repository. Configure its MongoDB
   and Stripe settings there as required by that project. For Google OAuth,
   configure the callback URL as described below.

4. Start the frontend:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Google OAuth

Keep the Google OAuth credentials in the Express API's private environment.
For production, configure the API with:

```dotenv
CLIENT_URL=https://equp-rent-client.vercel.app
GOOGLE_REDIRECT_URI=https://equp-rent-client.vercel.app/backend-api/auth/google/callback
```

Add the same `GOOGLE_REDIRECT_URI` value to the OAuth client's authorized
redirect URIs in Google Cloud, and set `BACKEND_URL` in the frontend's Vercel
environment to the Express API origin. The callback goes through the frontend
proxy so the API session cookie is available to the app.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | Check TypeScript types |

## Project layout

- `app/` — Next.js routes and layouts
- `components/` — page sections and reusable UI
- `lib/` — authentication, API, favorites, and theme utilities
- `public/` — static assets

