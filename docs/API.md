# Amhra Dashboard — API & Auth

The dashboard is the browser's only origin. It authenticates with the bot using **httpOnly
cookies** and proxies every bot call through its own route handlers under `app/api`, so the
browser never handles a token. Full account contract: `amhra/docs/ACCOUNTS.md`.

## Session model

| Cookie          | Set by                                   | Sent to bot as     |
| --------------- | ---------------------------------------- | ------------------ |
| `amhra_session` | passkey login/register, Discord callback | `Session <token>`  |
| `amhra_anon`    | visitor link validation (`/api/auth/anon`) | `Anon <token>`   |

Both are `httpOnly`, `SameSite=Lax`, and `Secure` in production. The generic proxy
[`app/api/[...path]/route.ts`](../app/api/[...path]/route.ts) reads whichever cookie is present
and attaches the Authorization header before calling the bot; the browser's JS never sees the
token.

## Auth flows

- **Passkey register:** `registerPasskey()` → `/api/auth/passkey/register/begin` → browser
  WebAuthn ceremony (`@simplewebauthn/browser`) → `/api/auth/passkey/register/finish`, which
  sets the session cookie.
- **Passkey login:** `loginPasskey()` → begin → ceremony → finish (usernameless).
- **Auto relogin:** the session cookie persists (30-day sliding expiry); `useAccount()` calls
  `/api/auth/session` on load and the user is already signed in.
- **Discord:** `/discord` → Discord OAuth → `/api/register?code=…` exchanges the code via the
  bot and sets the session cookie. If a session cookie is already present, the Discord identity
  is *linked* to that account instead of creating a new one.
- **Visitor (anonymous):** `/dashboard/<base64({guildId, auth})>` → `loginAnonymous()` validates
  the token via the bot and stores the `amhra_anon` cookie; the player renders for that guild only.

## Route handlers (dashboard `app/api`)

| Route | Purpose |
| --- | --- |
| `POST /api/auth/passkey/register/begin` · `…/finish` | Passkey registration (finish sets cookie) |
| `POST /api/auth/passkey/login/begin` · `…/finish` | Passkey login (finish sets cookie) |
| `POST /api/auth/passkey/add/begin` · `…/finish` | Add a passkey to the current account |
| `GET /api/auth/session` | Current account, or 401 |
| `POST /api/auth/logout` | Revoke session + clear cookies |
| `POST /api/auth/anon` | Validate visitor token, set anon cookie |
| `POST /api/auth/discord/unlink` | Unlink Discord |
| `GET /api/register?code=…` | Discord OAuth exchange → set cookie → `/dashboard` |
| `GET/POST /api/[...path]` | Authenticated proxy for all other bot endpoints |

## Player features preserved

Add-by-URL/search, play/pause/skip/stop, seek, volume, mute, loop, skip-non-music, drag-reorder
queue, remove, history re-queue, quit. **New:** radio mode toggle (autoplay suggestions) and a
Suggestions panel (`/api/suggestions/:guildId`). Message/voice logging was removed from the bot,
so the dashboard no longer has a Messages view.

## Environment

| Variable | Purpose |
| --- | --- |
| `API_URL` | Bot API base (e.g. `http://localhost:5001/api`), server-side only |
| `NEXT_PUBLIC_URL` | Public dashboard origin for OAuth redirects |
| `NEXT_PUBLIC_INVITE_LINK` | Discord OAuth authorize URL (login/link) |
| `INVITE_LINK` | Plain bot invite for `/invite` |

The bot must set `WEBAUTHN_RP_ID` to this dashboard's registrable domain and `WEBAUTHN_ORIGIN`
to its full origin for passkeys to verify.
