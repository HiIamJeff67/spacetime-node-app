# spacetime-node app

The demo web app connects to the Spacetime Node backend for the user preference,
entry, recommendation, and redemption flow.

## Local setup

```bash
nvm use
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm run dev
```

Set `VITE_API_BASE_URL` to the backend's public URL (for local development,
`http://localhost:8000`). This is browser-visible configuration: do not put
service credentials, device tokens, or other secrets in `.env.local`.
Set `VITE_VAPID_PUBLIC_KEY` to the backend's matching public VAPID key to enable
real browser Web Push; leave it empty to keep the deterministic mock flow.
The public gateway serves the user, recommendation, and redemption routes on
the same origin.

## Demo flow

1. Complete onboarding with favorite stations, categories, and notification timing.
2. The app saves preferences, creates an entry event, and polls the latest recommendation.
3. Open the recommended offer, redeem it once, and read the persisted redemption status.

### Chrome Beacon demo

On a supported Chrome build, use the `Chrome Beacon` button in the station
section. The page scans Apple iBeacon advertisements, parses UUID/Major/Minor/
Power, and sends the observation to the backend `/v1/entry-events` API. The
backend resolves the actual station through the TRTC Beacon provider; the
frontend does not send a `station_id` for this path.

Beacon scanning requires HTTPS, Bluetooth permission, and a user gesture. The
Chrome scanning implementation may require enabling
`chrome://flags/#enable-experimental-web-platform-features`. If scanning is
unavailable, use the Demo map selector. iOS Safari does not provide a reliable
Web Bluetooth scanning path, so the report should describe this as a Chrome
MVP limitation.

The demo station selector exposes the full 122-station catalog from the backend
Beacon migration. The backend must apply `000012_beacon_station_catalog.sql`
before using the complete station list in the deployed demo.

When the backend is unavailable, the static demo content remains visible so the
UI can still be previewed. Public HTTPS hosting and backend CORS configuration
are tracked separately in SCRUM-42.

## Demo container

Build and run the static frontend container with a public backend URL injected
at build time:

```bash
VITE_API_BASE_URL=https://api.example.com \
  docker compose -f docker-compose.demo.yml up --build -d
curl http://localhost:8080/healthz
```

The container serves the SPA on port 8080 and exposes only `/healthz` for the
hosting health probe. Put TLS termination and the public domain at the hosting
ingress; never add backend credentials to `VITE_*` variables.
