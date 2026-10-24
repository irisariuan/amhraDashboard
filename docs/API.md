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
- **Tracks (the mix):** a Tracks view edits the mix like a track editor. The guild's queue is
  the top lane; under it, up to 8 mix tracks play on top of it, each one song at a time with its
  own volume, its own queue, a gap of silence between songs and an optional loop (a song that
  ends goes to the back of the track's queue). Tracks run independently of the queue: they play
  on when it runs dry, and pausing the player pauses them too. `/api/song/get/:guildId` reports
  `canMix` (false when the bot is not on its Rust voice path) and `mix: { mainVolume, maxTracks,
  tracks: [{ id, volume, gapMs, loop, playing, loading, queue, dueInMs }] }`. Songs are
  `{ title, url, durationMs, gapBeforeMs }` (`durationMs` null when unknown; `gapBeforeMs` is
  the silence before the song in place of the track's gap, null for the track's); `playing` adds `positionMs`;
  `loading` is a song being downloaded to play next; `dueInMs` is how long until the next song
  while the track waits out its gap. Times are as of the reply and hold still while `paused`.
  Volumes are linear like `volume`. Edits, named by track `id`:
  `addMixTrack` (`{ volume?, gapMs?, loop? }`), `removeMixTrack` (`{ track }`), `setMixTrack`
  (`{ track, volume?, gapMs?, loop? }`), `skipMixTrack` (`{ track }`, the next song now, cutting
  any gap short), `swapMixTrack` (`{ track }`), `addMixSong` (`{ url, track?, index? }`, on a new
  track with the given settings when `track` is left out), `removeMixSong` (`{ track, index, url? }`),
  `moveMixSong` and `setMainVolume` (`{ volume }`, the queue song's own level). `gapMs` is at most
  600000.
  `moveMixSong` (`{ from: { track, index }, to: { track, index? }, url? }`) drags a queued song
  anywhere: `track` is a mix track's id or `null` for the guild's queue, and as a destination
  `"new"` makes a track for it; `index` is counted after the song has left, and left out means
  the end. On a mix track, `to.gapMs` sets the song's `gapBeforeMs`: where the editor dropped
  it, as silence after the song before it, or after now when it lands first on a track with
  nothing playing. The editor snaps a dragged song's start or end to the start or end of any
  song on any lane. `url` is what was at `from`, guarding against a reorder landing at the same moment.
  The queue's sideways drag is a move to `"new"`.
  They answer `501` when mixing is unavailable, `409` when the bot is not in voice, `422` when the
  mix has as many tracks as it can or a track's queue is full, and `404` for a track, song or
  video that is gone. `swapMixTrack` trades the track's playing song with the queue's:
  inaudible, each keeps its place and volume, and afterwards skip, seek, lyrics and now playing
  follow the swapped-in song while the old queue song plays on in the track (`409` when either
  is not playing, `502` when the bot could not make the exchange, such as mid-crossfade).
  Stopping the player or the bot leaving voice clears every track.
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
