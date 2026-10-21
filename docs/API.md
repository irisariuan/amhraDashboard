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

## Player features

Add by URL or live search (any YouTube video link form: `watch`, `youtu.be`, `shorts`,
`music.`/`m.` hosts), add a whole playlist with a preview (`/api/getPlaylistDetail`, then the
`addPlaylist` edit, optionally to play next), play/pause/skip/stop, seek, volume (0–500%), mute,
loop, skip-non-music, drag-reorder queue, remove, history re-queue, quit, radio mode (autoplay
suggestions) and a Suggestions panel (`/api/suggestions/:guildId`).

- **Lyrics:** a Lyrics tab backed by `GET /api/lyrics/:guildId[?q=…]`, which the bot answers
  from [LRCLIB](https://lrclib.net) as `{ link, content }`. `link` is the track the lookup was
  for, so an answer that arrives after a song change is dropped; `content` holds `plain` text
  and/or `synced` lines (`{ time: ms, text }`). Synced lyrics follow playback and seek on click;
  `?q=` replaces a wrong automatic match with a search.
- **Crossfade:** the `setCrossfade` edit (`crossfadeMs` ≤ 15000, `skipFadeMs` ≤ 5000), shown
  disabled when the player reports `canCrossfade: false` (the bot is not on its Rust voice path).
- **Scheduled plays:** a Scheduled tab backed by `POST /api/schedule/add`
  (`{ guildId, url, at? }`, `at` in epoch ms) and `POST /api/schedule/respond`
  (`{ guildId, id, action: "cancel" | "queue" }`). Pending entries arrive as `schedules` on
  `/api/song/get/:guildId`. At its time a scheduled video interrupts whatever is playing, and the
  interrupted track goes back to the head of the queue with a `seek` so it resumes after. Ten
  seconds before, the bot posts a warning in Discord and the entry reports `warning: true`;
  the dashboard shows a banner with the same "Don't cut in" / "Play next instead" choices.
  Leaving `at` out schedules an upcoming premiere for its start (`422` if the video is not one),
  `409` means the bot is not in voice, and adding a premiere through `addSong` answers `202`
  when the bot scheduled it instead of queueing. The bot leaving voice clears its schedules.
- **Mix:** a Mix tab plays songs on top of the queue, each at its own volume, with the player's
  volume as the master over everything. `/api/song/get/:guildId` reports `canMix` (false when the
  bot is not on its Rust voice path) and `mix: { mainVolume, layers: [{ id, title, url, volume }] }`,
  volumes linear like `volume`. Edits: `addLayer` (`{ url, volume? }`, a video link; answers once
  the download has started), `removeLayer` (`{ id }`), `setLayerVolume` (`{ id, volume }`) and
  `setMainVolume` (`{ volume }`, the queue song's own level). `addLayer` answers `501` when mixing
  is unavailable, `409` when the bot is not in voice, `422` when 8 songs are already mixed in,
  `404` for a video it cannot find and `502` when the download fails; a layer edit naming an id
  that has ended answers `404`. A mixed-in song plays once and leaves `layers` when it ends;
  stopping the player or the bot leaving voice clears them all.
- **Administration:** the settings form is generated from `/api/admin/settings/schema`, so new
  bot settings appear without a dashboard release.

## Environment

| Variable | Purpose |
| --- | --- |
| `API_URL` | Bot API base (e.g. `http://localhost:5001/api`), server-side only |
| `NEXT_PUBLIC_URL` | Public dashboard origin for OAuth redirects |
| `NEXT_PUBLIC_INVITE_LINK` | Discord OAuth authorize URL (login/link) |
| `INVITE_LINK` | Plain bot invite for `/invite` |

The bot must set `WEBAUTHN_RP_ID` to this dashboard's registrable domain and `WEBAUTHN_ORIGIN`
to its full origin for passkeys to verify.
