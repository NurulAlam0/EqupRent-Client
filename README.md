# Rentora

Rentora is an equipment rental marketplace that connects people who need
equipment with owners who want to rent out their equipment.

## Key features

- Browse approved equipment and search, filter, sort, and paginate listings.
- Register or sign in with email/password or Google.
- Role-based customer, owner, and admin workspaces.
- Owners can submit listings for approval and manage their equipment and rentals.
- Customers can save favorites and book available equipment for selected dates.
- Secure Stripe Checkout for rental payments.
- Verified renters can leave a star rating and comment after a paid rental is
  completed.
- Admin tools for managing users, equipment approvals, and rentals.
- Responsive layouts and a light/dark theme preference saved in local storage.

## Tech stack

- Frontend: Next.js App Router, React, TypeScript, and Tailwind CSS.
- Backend API: Express, TypeScript, and MongoDB with Mongoose.
- Authentication: JWT and Google OAuth.
- Payments: Stripe Checkout.

## NPM packages

### Frontend runtime

`@base-ui/react`, `@shadcn/react`, `class-variance-authority`, `cmdk`, `cn`,
`date-fns`, `embla-carousel-react`, `framer-motion`, `input-otp`, `lucide-react`,
`next`, `react`, `react-day-picker`, `react-dom`, `react-hot-toast`,
`react-resizable-panels`, `recharts`, `shadcn`, `shiki`, `tw-animate-css`.

### Frontend development

`@tailwindcss/turbopack`, `@types/node`, `@types/react`, `@types/react-dom`,
`eslint`, `eslint-config-next`, `sharp`, `tailwindcss`, `typescript`.

### Backend runtime

`bcryptjs`, `cookie-parser`, `cors`, `dotenv`, `express`, `jsonwebtoken`,
`mongoose`, `stripe`.

### Backend development

`@types/cookie-parser`, `@types/cors`, `@types/express`,
`@types/jsonwebtoken`, `@types/node`, `tsx`, `typescript`.

## Local development

Start the frontend from this repository:

```bash
npm install
npm run dev
```

Start the Express API from the separate backend repository with `npm run dev`.
Configure required API, MongoDB, OAuth, and Stripe settings in private
environment files; do not commit credentials.

For frontend checks:

```bash
npm run lint
npm run build
```