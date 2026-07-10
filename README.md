[www.downloadmorebass.com](https://downloadmorebass.com)

## Project structure

- `src/` — Svelte frontend
- `worker/` — Cloudflare Worker API (TypeScript)
- `shared/` — Shared types between frontend and worker

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure SoundCloud credentials for local development:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` with your SoundCloud API credentials. Register an app at [SoundCloud Developers](https://developers.soundcloud.com/) to get a `client_id` and `client_secret`.

3. Set the SoundCloud user to pull tracks from in `wrangler.jsonc` (`vars.SOUNDCLOUD_USER`).

## Development

```bash
npm run dev
```

The Cloudflare Vite plugin serves the frontend and Worker together, so `/api/*` is handled by the Worker on the same origin.

## API

The worker exposes:

- `GET /api/tracks` — fetches tracks for the configured SoundCloud user
- `GET /api/tracks/:id/comments` — fetches comments for a track
- `GET /api/tracks/:id/stream` — resolves a stream URL for a track
- `GET /api/health` — health check

## Deployment

```bash
npm run deploy
```

Set production secrets (once per Worker):

```bash
wrangler secret put SOUNDCLOUD_CLIENT_ID
wrangler secret put SOUNDCLOUD_CLIENT_SECRET
```

If the frontend is hosted on a different domain than the Worker, set `VITE_API_URL` to the Worker URL when building the frontend.
