/**
 * Verifies the Next.js route guard (proxy.ts) against the dev server.
 * Usage: node scripts/test-route-guard.mjs   (API :5050 + web :3000 running)
 */
const API = process.env.API_URL ?? "http://localhost:5050";
const WEB = process.env.WEB_URL ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(name, cond, extra = "") {
  if (cond) {
    passed++;
    console.log(`  ok  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name} ${extra}`);
  }
}

async function probe(path, cookie) {
  const res = await fetch(`${WEB}${path}`, {
    headers: cookie ? { Cookie: cookie } : {},
    redirect: "manual",
  });
  return { status: res.status, location: res.headers.get("location") };
}

// Fresh account so this test is repeatable
const email = `guard.${Date.now()}@rentora.dev`;
const reg = await fetch(`${API}/api/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Guard Tester",
    email,
    photo: "https://i.imgur.com/g.png",
    password: "TestPass1",
  }),
});
const cookie = (reg.headers.get("set-cookie") ?? "").split(";")[0];
check("test account registered + cookie issued", reg.status === 201 && cookie.includes("access_token="), `got ${reg.status}`);

const isRedirectTo = (r, part) => r.status >= 300 && r.status < 400 && (r.location ?? "").includes(part);

// 1. Private route, no session → login
const dashAnon = await probe("/dashboard");
check("guest → /dashboard redirects to /login", isRedirectTo(dashAnon, "/login"), `got ${dashAnon.status} ${dashAnon.location}`);

// 2. Private route with session → renders
const dashAuth = await probe("/dashboard", cookie);
check("signed in → /dashboard renders (200)", dashAuth.status === 200, `got ${dashAuth.status} ${dashAuth.location ?? ""}`);

// 3. Login page with session → bounced to dashboard
const loginAuth = await probe("/login", cookie);
check("signed in → /login redirects to /dashboard", isRedirectTo(loginAuth, "/dashboard"), `got ${loginAuth.status} ${loginAuth.location}`);

// 4. Login page as guest → renders
const loginAnon = await probe("/login");
check("guest → /login renders (200)", loginAnon.status === 200, `got ${loginAnon.status}`);

// 5. Public page unaffected
const home = await probe("/");
check("public / renders (200)", home.status === 200, `got ${home.status}`);

// 6. Forged cookie → treated as guest
const forged = await probe("/dashboard", "access_token=forged.jwt.value");
check("forged cookie → redirects to /login", isRedirectTo(forged, "/login"), `got ${forged.status} ${forged.location}`);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
