# CustomerLens AI — Deployment Guide

This guide covers deploying the full-stack app (AI Studio/Cloud Run) and the Cloudflare Worker (tracking backend).

## 1. AI Studio / Cloud Run (main app)

The main app runs as an Express server serving the React frontend and API.

**Build & deploy (AI Studio handles this automatically when you push to `main`):**
```bash
npm run build
npm start
```

**Required secrets (AI Studio injects automatically):**
- `GEMINI_API_KEY` — AI features (survey generation, chat, analytics)
- `APP_URL` — your deployed URL

**Optional:**
- `OPENAI_API_KEY` — overrides Gemini if set

## 2. Cloudflare Worker (tracking snippet backend)

The worker serves the tracking script (`tracker.js`), handles event ingestion, and evaluates behavioral triggers per visitor.

**Deploy:**
```bash
npm run worker:deploy
```

**Required secrets:**
```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put FIREBASE_PROJECT_ID
```

**Optional bindings for production scale:**
- `D1_DATABASE` — offline SQL storage of events/responses (survives worker restarts)
- `KV_SESSIONS` — fast session state
- `R2_STORAGE` — raw event storage

## 3. Firebase / Firestore

Ensure Firestore is enabled in project `customer-lens-bd503`:
https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=customer-lens-bd503

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Your Website   │────▶│  tracker.js   │────▶│  Worker      │
│  (installs script)│    │  (from CDN)   │     │  (ingest)    │
└─────────────────┘     └──────────────┘     └──────┬───────┘
                                                    │
                                                    ▼
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Dashboard       │◀────│  Firestore   │◀────│  Main App    │
│  (AI Studio)     │     │  (data)      │     │  (Express)   │
└─────────────────┘     └──────────────┘     └─────────────┘
```

- `tracker.js` sends events to the Worker → stored in Firestore
- Dashboard fetches real data from the main Express app
- AI features (Gemini) analyze real telemetry
