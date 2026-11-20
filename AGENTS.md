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
  that attaches the JWT and surfaces the server's `message` as a thrown `Error`. Use `api()` for all
  API calls instead of raw `fetch`.
  - `user` is `undefined` while hydrating, `null` when signed out, object when in — handle all three
    (SSR renders `undefined` to avoid hydration mismatch).
  - The client keeps the JWT in localStorage/sessionStorage (`rentora:token`); the proxy guard instead
    trusts the `access_token` httpOnly cookie. The two stores are intentionally different.
  - **First-party cookie & `/api` rewrite**: In production, the client and Express API are on different
    domains. To avoid cross-origin cookie loss (where the API sets `access_token` on its own domain,
    leaving `proxy.ts` on the frontend unable to read it and causing an auth redirect loop), all browser
    API requests go to same-origin `/api/...` and are proxied via `rewrites()` in `next.config.ts` to
    `BACKEND_URL`. This ensures the cookie is set on the frontend domain as a first-party cookie.
- `app/` routes are thin wrappers. Real UI lives in `components/`:
  - `layout/` — global navigation & shell (`header.tsx`, `footer.tsx`)
  - `home/` — landing/marketing sections (`hero.tsx`, `featured.tsx`, `categories.tsx`, `why-choose-us.tsx`, `popular.tsx`, `how-it-works.tsx`, `reviews.tsx`)
  - `equipment/` — equipment cards, browser, details, reviews, and listing form (`equipment-card.tsx`, `equipment-browser.tsx`, `equipment-details.tsx`, `equipment-reviews.tsx`, `add-equipment-form.tsx`)
  - `dashboard/` — role-based dashboard views (`dashboard-view.tsx`, `admin-dashboard.tsx`, `owner-dashboard.tsx`, `customer-dashboard.tsx`)
  - `auth/` — authentication views and inputs (`login-form.tsx`, `register-form.tsx`, `auth-shell.tsx`, `form-field.tsx`, `google-icon.tsx`)
  - `about/` — about page content (`about-content.tsx`)
  - `payment/` — payment status screens (`payment-success.tsx`, `payment-cancelled.tsx`)
  - `shared/` — shared exports and common wrappers
  - `ui/` — shadcn components (style `base-nova`, vendored). Only `button.tsx` and `dialog.tsx` are kept;
    every unused component/image was pruned, so add what you need with `npx shadcn add <component>`.
- Data fetching is client-side `fetch` against `${API_URL}/api/...` (see `components/home/featured.tsx`,
  `components/equipment/equipment-browser.tsx`). Endpoints assume `/api/auth/*`, `/api/equipment/*`, `/api/reviews`.

## Config quirks

- Path alias `@/*` → repo root (no `src/` dir).
- `next.config.ts`: `cacheComponents: true`, `experimental.agentFeedback: true`, Tailwind v4 loaded via
  the `@tailwindcss/turbopack` rule (no `tailwind.config` file), and images allow any https host
  (users paste their own photo URLs).
- `.env` is gitignored; environment variables used:
  - `BACKEND_URL`: URL of the Express API (e.g. `https://api.rentora.dev`, no trailing slash). Used by
    `next.config.ts` for the `/api/:path*` rewrite and by `proxy.ts` for server-side role verification.
  - `NEXT_PUBLIC_API_URL`: Fallback for local development (`http://localhost:5050`). In production,
    `lib/auth-context.tsx` uses `""` so all browser requests route through the `/api` rewrite on the same origin.
  - Other keys present (`BETTER_AUTH_*`, `MONGODB_URI`) are unreferenced.
