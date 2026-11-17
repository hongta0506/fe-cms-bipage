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

## 3. Fix

Scope: two files, no API or UI contract changes.

**`src/lib/api.ts`** — keep the convenience token for local development only; in any other
environment start with no token so the client never sends a stale one:

```ts
const DEFAULT_TOKEN =
  process.env.NODE_ENV === "development"
    ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    : null;

class ApiClient {
  private token: string | null = DEFAULT_TOKEN;
```

**`src/stores/auth/auth-store.ts`** — delete the duplicated literal and bootstrap from the session
cookie instead, which is what the middleware already trusts:

```ts
initialize: async () => {
  const { token } = get();
  const cookieToken =
    typeof document !== "undefined"
      ? (document.cookie.match(/(?:^|;\s*)token=([^;]+)/)?.[1] ?? null)
      : null;
  const effective = token ?? cookieToken;
  if (!effective) {
    set({ isLoading: false });
    return;
  }
  api.setToken(effective);
  document.cookie = `auth-token=${effective}; path=/; max-age=86400`;
  document.cookie = `token=${effective}; path=/; max-age=86400`;
  set({ isLoading: true });
  try {
    const user = await api.getMe();
    set({ user, isLoading: false });
  } catch {
    api.setToken(null);
    document.cookie = "auth-token=; path=/; max-age=0";
    document.cookie = "token=; path=/; max-age=0";
    set({ user: null, token: null, isLoading: false });
  }
},
```

Behaviour changes, stated explicitly:

- Production no longer ever sends an unauthenticated hardcoded bearer token.
- A visitor with no Zustand token and no cookie now ends up unauthenticated (`isLoading: false`,
  `user: null`) and is redirected to login by the existing middleware — previously they got a
  guaranteed-401 "logged in" shell.
- Development keeps the existing convenience token.
- A reload no longer overwrites a valid cookie with an expired token.

## 4. Verification checklist

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npx next build` exits 0
- [ ] Deploy to staging and production
- [ ] Real browser (puppeteer-core): login via form, then `/api/auth/me` returns 200
- [ ] Real browser: no `401` on `/api/schema` or `/api/content/domains` for either environment
- [ ] Reward pages still render their tables (prizes 8, players 5, spins 30, leaderboards 9 on staging)
- [ ] Logged-out visit still redirects to `/auth/v1/login`
