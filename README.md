# Amhra Dashboard
This is the dashboard for the Discord music bot - [Amhra](https://github.com/irisariuan/amhra), aimed to provide a integrated, smooth music playing experience by using modern web technologies.

## Major Functions
### Administrating (Protective)
1. Logging - Message logs, server logs, voice status logs, etc.
2. Administrating
### Music Playing
1. Volume adjustment
2. Queue control - Rearranging, adding, deleting
3. History record
4. Relocate video
5. Playing directly from dashboard
6. One-time link for non-admin to control the bot

## Devlopment
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Configuration
Set the following variables in `.env` (see `docs/API.md` for details):
- `API_URL` — bot server base URL (proxied via Next.js rewrites)
- `NEXT_PUBLIC_URL` — public origin of this dashboard
- `NEXT_PUBLIC_INVITE_LINK` — Discord OAuth authorize URL
- `INVITE_LINK` — plain bot invite link

## Architecture
- `app/` — routes (App Router)
- `components/dashboard/` — dashboard feature components; `components/ui/` — shadcn primitives; `components/shared/` — generic building blocks
- `hooks/` — SWR data hooks and client utilities
- `lib/api/` — typed API client for the bot server (contract documented in [docs/API.md](docs/API.md))
- `lib/session.ts` — admin / bearer / visitor session handling

## Building
> Before building the production server, please make sure `API_URL` is correctly set in `.env`
```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

## Production
```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

## Bugs
Please open an issue whenever you discovered a bug!
Contributing is also welcomed

Enjoy your Amhra!
