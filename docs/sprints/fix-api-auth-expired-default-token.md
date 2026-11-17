# Fix — expired hardcoded `DEFAULT_TOKEN` breaks `/api/auth/me`, `/api/schema`, `/api/content/domains`

Found: 2026-11-17 20:13 while verifying Sprint R7 in a real browser (puppeteer-core + system Chrome).
Not found by the earlier HTTP-fetch check: those requests returned `200` with full server-rendered
HTML, so a status-only probe could never see it.

## 1. Symptom

After a **real** login through the UI (`POST /api/auth/local/login` via the form), the app sets its
cookies correctly, yet the shell's own session probe still fails:

```
url sau login : /dashboard/default
cookies       : token(257b)  UUID(36b)  auth-token(257b)
GET /api/auth/me -> 401 {"error":{"code":"401","message":"Unauthorized"}}
```

Every reward page then reports the same failures on both environments:

| Request | Production | Staging |
|---|---|---|
| `/api/auth/me` | 401 | 401 |
| `/api/schema` | 401 | 401 |
| `/api/content/domains?limit=100` | 401 | 401 |

Console noise is 1–5 errors per page. Impact:

- `/api/auth/me` — the sidebar/profile shell never resolves the current user.
- `/api/schema` — the dynamic schema sidebar cannot load its collection list.
- `/api/content/domains` — the domain switcher renders empty.

Reward consoles keep working because they go through `/api/rewards/*`, which authenticates with the
`token` cookie plus `REWARD_CONFIG_ADMIN_SECRET` — a separate path. That is why 4 of 6 pages still
rendered real data (prizes 8 rows, players 5, spins 30, leaderboards 9).

## 2. Root cause

Two independent faults compound here. The first attempt at this fix only addressed the first one
and the browser check still showed `401`, which is what exposed the second.

### 2.1 The client booted with an expired hardcoded JWT

The FastSchema client in `src/lib/api.ts` starts life holding a **hardcoded JWT**:

```ts
// Default token for development (avoids login screen on load)
const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

class ApiClient {
  private token: string | null = DEFAULT_TOKEN;
```

Decoding that literal:

```
username : admin
exp      : 1782620591 = 2026-06-28T11:23:11
now      : 1794921194 = 2026-11-17T20:13:14
expired  : yes — 142 days past
```

Because `NEXT_PUBLIC_FASTSCHEMA_URL` is set to the app's own origin on both deployments
(`https://admin.xskt24h.net`, `https://admin-staging.xskt24h.net`), every `/api/*` call that the
client makes carries `Authorization: Bearer <142-day-expired JWT>` and FastSchema answers `401`.

The same dead literal is duplicated a second time, inline, in
`src/stores/auth/auth-store.ts:62` inside `initialize()`, which re-applies it to the client *and*
writes it into both auth cookies on every reload where Zustand has no persisted token:

```ts
const defaultToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
api.setToken(defaultToken);
document.cookie = `auth-token=${defaultToken}; ...`;
document.cookie = `token=${defaultToken}; ...`;
```

So a reload can actively overwrite a valid session cookie with an expired token.

### 2.2 FastSchema accepts the bearer header only — never the cookie

Fixing 2.1 alone was not enough: the browser check after deploy still showed `401`. Probing the
deployed staging host with a **freshly minted** token exposes why:

```
GET /api/auth/me
  Authorization: Bearer <fresh token>   -> 200  {"data":{"id":1,"username":"admin",...}}
  Cookie: token=<fresh token>           -> 401  {"error":{"code":"401","message":"Unauthorized"}}
  no credentials                        -> 401
```

Same for `/api/schema` and `/api/content/domains?limit=100` (both `200` with the header).

So the session cookie alone never authenticates a FastSchema call on these deployments — the caller
must convert it into an `Authorization: Bearer` header. Once 2.1 was fixed, the client had
`token === null` in production, so anything firing **before** `auth-store.initialize()` resolved —
the shell's `/api/auth/me` probe, the sidebar `/api/schema` load, the domain switcher's
`/api/content/domains` — sent **no credentials at all**, producing exactly the same `401`.
The fix traded an expired token for no token, and the symptom did not move.

## 3. Fix

Scope: two files, no API or UI contract changes.

**`src/lib/api.ts`** — three parts: keep the convenience token for local development only, read the
session cookie lazily, and fall back to it whenever no token has been set explicitly:

```ts
const DEFAULT_TOKEN =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    : null;

function readTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  return document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] ?? null;
}

class ApiClient {
  private token: string | null = DEFAULT_TOKEN;

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json", ... };
    const token = this.token ?? readTokenCookie();   // ← ordering-proof
    if (token) headers.Authorization = `Bearer ${token}`;
```

Reading the cookie inside `request()` rather than in the constructor is what makes this robust: it
is evaluated per call, so a token written by `login()` is used immediately, and no caller depends on
`initialize()` having run first. The `typeof document` guard keeps the module safe to import from
server code, where the fallback degrades to "no token".

**`src/stores/auth/auth-store.ts`** — delete the duplicated literal and bootstrap from the session
cookie instead:

```ts
initialize: async () => {
  const { token } = get();
  const cookieToken =
    typeof document !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] ?? null)
      : null;
  const effective = token ?? cookieToken;
  if (!effective) {
    api.setToken(null);
    set({ user: null, token: null, isLoading: false });
    return;
  }
  api.setToken(effective);
  document.cookie = `auth-token=${effective}; path=/; max-age=86400`;
  document.cookie = `token=${effective}; path=/; max-age=86400`;
  set({ isLoading: true });
  try {
    const user = await api.getMe();
    set({ user, token: effective, isLoading: false });
  } catch {
    api.setToken(null);
    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "token=; path=/; max-age=0";
    set({ user: null, token: null, isLoading: false });
  }
},
```

Behaviour changes, stated explicitly:

- Production no longer ever sends an expired hardcoded bearer token.
- Every FastSchema call now carries a bearer header whenever a session cookie exists, regardless of
  which component fired first.
- A visitor with no Zustand token and no cookie ends up unauthenticated (`isLoading: false`,
  `user: null`) and is redirected to login by the existing middleware — previously they got a
  guaranteed-401 "logged in" shell.
- Development keeps the existing convenience token.
- A reload no longer overwrites a valid cookie with an expired token.

## 4. Verification checklist

- [x] `npx tsc --noEmit` exits 0
- [x] `npx next build` exits 0
- [x] Deploy to staging and production
- [x] Real browser (puppeteer-core): login via form, then `/api/auth/me` returns 200
- [x] Real browser: no `401` on `/api/schema` or `/api/content/domains` for either environment
- [x] Reward pages still render their tables (prizes 8, players 5, spins 30, leaderboards 9 on staging)
- [x] Logged-out visit still redirects to `/auth/v1/login`

### 4.1 Verification evidence (2026-11-17, after PR #23)

Deployed commit `c83c4b7` to both environments (`admin-cms` :3005, `admin-cms-staging` :3015),
builds exit 0, pm2 online. Real Chrome 155 driven by puppeteer-core, login through the actual form:

| Probe (from page context, cookie turned into a Bearer header) | Staging | Production |
|---|---|---|
| `GET /api/auth/me` | 200 | 200 |
| `GET /api/schema` | 200 | 200 |
| `GET /api/content/domains?limit=100` | 200 | 200 |
| `GET /api/auth/me` with cookie only (baseline) | 401 | 401 |

The cookie-only baseline staying `401` is the point: it proves the backend accepts the bearer header
and nothing else, so the header conversion in `ApiClient.request()` is what fixed this — not the
removal of the expired literal alone.

Zero `4xx` responses on any of the six reward pages, both environments (previously every page logged
`401 /api/schema` and `401 /api/content/domains`):

| Page | Staging rows | Production rows |
|---|---|---|
| `prizes` | 8 | 8 |
| `players` | 5 | 0 |
| `spins` | 30 | 0 |
| `claims` | 0 | 0 |
| `leaderboards` | 9 | 0 |
| `publish` | 0 | 0 |

Production is empty apart from prize config because its `reward_production` database is fresh after
the Nakama cluster split. Staging row counts match the pre-fix run, so no regression.
