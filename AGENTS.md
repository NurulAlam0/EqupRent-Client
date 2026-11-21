# AGENTS.md

Single Next.js 16 (App Router) app — "Rentora", an equipment-rental frontend. Not a monorepo.
The backend is a **separate Express API (default `http://localhost:5050`, not in this repo)** — the
app is largely non-functional without it running.

## Commands

- `npm run dev` — dev server (Turbopack, http://localhost:3000)
- `npm run lint` — ESLint (passes clean; keep it that way — don't add code that trips `react-hooks/*`).
- `npx tsc --noEmit` — typecheck (no npm script; tsconfig is `strict` + `noEmit`, passes clean)
- `npm run build` — production build
- `node scripts/test-route-guard.mjs` — route-guard integration check. Requires the API on :5050
  **and** the web server on :3000 already running; registers a throwaway account each run.
- `npm run image:cut` — re-runs the sharp script that strips backgrounds from `public/image/*`
  and **overwrites those files in place**.

No test framework, CI, or pre-commit config exists.

## Architecture

- `proxy.ts` (repo root) is the route guard. Next 16 renamed `middleware.ts` → `proxy.ts`; do **not**
  create a `middleware.ts`.
  - Private: `/dashboard/*` and `/equipment/[id]` (single-segment match intentionally keeps the
    public `/equipment` list open).
  - Roles: `customer | owner | admin`. The role is resolved server-side by calling the API's
    `GET /api/auth/verify` — the JWT secret never lands in Next.js.
  - **Adding or renaming a dashboard route requires updating the matchers/role checks in `proxy.ts`**
    (see the `/dashboard/admin`, `/dashboard/owner`, customer-only sections).
- Auth lives in `lib/auth-context.tsx`: exports `useAuth()`, `API_URL`, and `api()` — a fetch wrapper
  that attaches the httpOnly cookie and surfaces the server's `message` as a thrown `Error`. Use
  `api()` for all API calls instead of raw `fetch`.
  - `user` is `undefined` while hydrating, `null` when signed out, object when in — handle all three
    (SSR renders `undefined` to avoid hydration mismatch).
  - **No localStorage/sessionStorage for JWT.** The JWT lives exclusively in the `access_token`
    httpOnly cookie set by the backend. The route guard (`proxy.ts`) reads that cookie server-side.
  - All auth actions (`register`, `login`, `logout`, `updateProfile`, `exchangeGoogleTicket`) live
    inside `AuthProvider` and call `setUser()` directly — React state is updated immediately without
    waiting for a page navigation + remount cycle.
  - **First-party cookie & `/backend-api` rewrite**: In production, the client and Express API are on
    different domains. All browser API requests go to same-origin `/backend-api/...` and are proxied
    via `rewrites()` in `next.config.ts` to `BACKEND_URL`. This ensures the cookie is set on the
    frontend domain as a first-party cookie, so both the browser and `proxy.ts` can read it.
    - `sameSite: "lax"` works because the rewrite makes it same-origin — no need for `"none"`.
  - **Google OAuth exchange ticket flow**: After the OAuth callback the backend issues a short-lived
    (60 s, single-use) random ticket and redirects the browser to `/login?exchange=<ticket>`.
    `login-form.tsx` picks it up, calls `POST /backend-api/auth/exchange`, which sets the
    httpOnly cookie on the frontend domain and returns the user. The JWT is **never** in the URL or
    localStorage.
- `app/` routes are thin wrappers. Real UI lives in `components/`:
  - `layout/` — global navigation & shell (`header.tsx`, `footer.tsx`)
  - `home/` — landing/marketing sections (`hero.tsx`, `featured.tsx`, `categories.tsx`, `why-choose-us.tsx`, `popular.tsx`, `how-it-works.tsx`, `reviews.tsx`)
  - `equipment/` — equipment cards, browser, details, reviews, and listing form (`equipment-card.tsx`, `equipment-browser.tsx`, `equipment-details.tsx`, `equipment-reviews.tsx`, `add-equipment-form.tsx`)
  - `dashboard/` — role-based dashboard views (`dashboard-view.tsx`, `admin-dashboard.tsx`, `owner-dashboard.tsx`, `customer-dashboard.tsx`)
  - `auth/` — authentication views and inputs (`login-form.tsx`, `register-form.tsx`, `auth-shell.tsx`, `form-field.tsx`)
  - `about/` — about page content (`about-content.tsx`)
  - `payment/` — payment status screens (`payment-success.tsx`, `payment-cancelled.tsx`)
  - `shared/` — shared exports and common wrappers
  - `ui/` — shadcn components (style `base-nova`, vendored). Only `button.tsx` and `dialog.tsx` are kept;
    every unused component/image was pruned, so add what you need with `npx shadcn add <component>`.
- Data fetching is client-side `api()` from `lib/auth-context.tsx` against `/api/...` paths (which
  rewrite to `BACKEND_URL/api/...` in production). Endpoints assume `/api/auth/*`, `/api/equipment/*`,
  `/api/bookings/*`, `/api/reviews`.
- **Do not add `app/api/` routes** — they would conflict with the `/api` → backend rewrite.

## Config quirks

- Path alias `@/*` → repo root (no `src/` dir).
- `next.config.ts`: `cacheComponents: true`, `experimental.agentFeedback: true`, Tailwind v4 loaded via
  the `@tailwindcss/turbopack` rule (no `tailwind.config` file), images allow any https host
  (users paste their own photo URLs), and two rewrites:
  - `/backend-api/:path*` → `${BACKEND_URL}/api/:path*` — same-origin tunnel for browser API calls
    (keeps the `access_token` cookie first-party).
  - `/api/:path*` (non-auth) → backend — legacy path alias for equipment/bookings/reviews calls.
- `.env` is gitignored; environment variables used:
  - `BACKEND_URL`: **Required in production.** Full URL of the Express API, no trailing slash
    (e.g. `https://api.rentora.dev`). Used by `next.config.ts` for both rewrites and by `proxy.ts`
    for the server-side `GET /api/auth/verify` call.
  - `NEXT_PUBLIC_API_URL`: Development fallback (`http://localhost:5050`). `lib/auth-context.tsx`
    uses `""` in production so all browser requests route through the same-origin `/backend-api` rewrite.
  - Other keys present (`BETTER_AUTH_*`, `MONGODB_URI`) are unreferenced — Better Auth has been removed.
- **Backend env vars** (set on the backend Vercel project, not here):
  - `CLIENT_URL` — the frontend origin, e.g. `https://equp-rent-client.vercel.app`
  - `GOOGLE_REDIRECT_URI` — must point to the **frontend** exchange endpoint:
    `https://equp-rent-client.vercel.app/backend-api/auth/google/callback`
    (the rewrite tunnels it to the backend, so the OAuth cookie is set on the frontend domain).
