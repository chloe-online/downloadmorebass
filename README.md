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

2. Configure SoundCloud credentials for local worker development:

```bash
cp worker/.dev.vars.example worker/.dev.vars
```

Edit `worker/.dev.vars` with your SoundCloud API credentials. Register an app at [SoundCloud Developers](https://developers.soundcloud.com/) to get a `client_id` and `client_secret`.

3. Set the SoundCloud user to pull tracks from in `worker/wrangler.toml` (`SOUNDCLOUD_USER`).

## Development

Run the frontend and worker together:

```bash
npm run dev:all
```

Or run them separately in two terminals:

```bash
npm run dev:worker   # http://localhost:8787
npm run dev          # http://localhost:5173 (proxies /api to the worker)
```

## API

The worker exposes:

- `GET /api/tracks` — fetches tracks for the configured SoundCloud user
- `GET /api/tracks/:id/comments` — fetches comments for a track
- `GET /api/health` — health check

## Deployment

Deploy the worker:

```bash
npm run deploy:worker
```

Set production secrets:

```bash
cd worker
wrangler secret put SOUNDCLOUD_CLIENT_ID
wrangler secret put SOUNDCLOUD_CLIENT_SECRET
```

If the frontend is hosted on a different domain than the worker, set `VITE_API_URL` to the worker URL when building the frontend.
