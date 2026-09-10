# OneNiaga

A seller workspace for Southeast Asian multi-channel e-commerce sellers (Shopee, TikTok Shop, Lazada, and your own webstore) — combining:

- **Seller workspace** (ported from the original prototype): sign-in/onboarding, unified Orders and Products, AI listing generation (Automate), AI weekly analysis (Analyze), AI prioritised recommendations (Advise), AI customer reply drafting (Messages), subscription gating, and an EN/MS/ZH language switcher.
- **Inventory-sync engine** (new): a deterministic, math-backed AI Action Console with 1-click executable recommendations, a universal Master Catalog with cross-channel SKU mapping, a Dynamic Reservation & Buffer Engine for Live Drop/Flash Sale holds, and a real-time Sync Event Ledger.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React, and Recharts.

## AI features require an API key

The listing assistant in Products, insights and priorities in Overview, and reply drafts in Messages call Agnes AI through a real, secure server-side route (`app/api/*/route.ts`) — the API key never reaches the browser. To enable them:

```bash
cp .env.example .env.local
# then edit .env.local and set:
# AGNES_API_KEY=your-agnes-key
```

Use the API key issued by Agnes AI. The client calls `https://apihub.agnes-ai.com/v1/chat/completions` with model `agnes-2.5-flash`. Restart the local server or redeploy after changing the key. Without a key, those four tabs will show an error toast/message when you try to generate — everything else in the app works with zero configuration.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with any email (or "Continue as demo seller"), link at least one platform, and explore.

## Deploy to Vercel

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Framework preset: **Next.js** (auto-detected).
4. Add an environment variable: `AGNES_API_KEY` = your key (Project Settings → Environment Variables).
5. Click **Deploy**.

Or via CLI:

```bash
npm install -g vercel
vercel --prod
# then set the env var:
vercel env add AGNES_API_KEY
```

## Deploy to Netlify

1. Push this folder to a new GitHub repository.
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
3. Build command: `npm run build` · Publish directory: `.next` (Netlify auto-adds the Next.js Runtime plugin for App Router + API routes).
4. Add `AGNES_API_KEY` under Site settings → Environment variables.
5. Deploy.

## Project structure

```
oneniaga/
├── app/
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── page.tsx               # Thin wrapper rendering <App />
│   ├── globals.css            # Tailwind base + light brand theme utilities
│   └── api/
│       ├── automate/route.ts  # Server-side Agnes AI call — listing generation
│       ├── analyze/route.ts   # Server-side Agnes AI call — weekly interpretation
│       ├── advise/route.ts    # Server-side Agnes AI call — prioritised recommendations
│       └── messages/route.ts  # Server-side Agnes AI call — customer reply drafts
├── components/
│   ├── App.tsx                 # Root state machine: auth → onboarding → main shell
│   ├── Sidebar.tsx, SignIn.tsx, ui.tsx
│   ├── pages/                  # Overview, Orders, Products, Automate, Analyze, Advise, Messages, Subscription, Settings
│   └── inventory/               # Action Console, Master Catalog, Reservation Engine, Sync Ledger, Impact Banner
├── lib/
│   ├── types.ts, theme.ts, platforms.ts, i18n.tsx, utils.ts, seed.ts
│   └── agnes.ts                # Server-only Agnes AI HTTP client (never imported by client components)
├── tailwind.config.js, postcss.config.js, next.config.js, tsconfig.json
└── .env.example
```

## Notes

- Every product in the catalog is a single source of truth shared across all tabs — e.g. reallocating stock on the Action Console updates the same record the Products and Master Catalog pages read from.
- `.env.local` is gitignored; never commit real API keys.

## Demo plans and AI allowances

| Plan | Monthly price | Connected stores | Shared AI credits / calendar month |
| --- | --- | --- | --- |
| Free | RM 0 | 2 | 20 |
| Growth | RM 79 | 3 | 200 |
| Pro | RM 179 | 4 | 1,000 |

All tiers include AI listing generation, sales analysis, recommendations, and reply drafts, plus the existing order, product, and inventory tools. One successful generation costs one credit, including a multi-platform listing set. Regenerations count; failed requests do not. Reading, editing, or publishing existing results remains available at zero credits.

Onboarding and Settings share connection limits. One connection represents one store on a supported platform; this prototype supports at most one store per platform. Downgrades require disconnecting extra stores first. Switching plans preserves usage. Credits reset on the first day of the local calendar month without rollover. AI requests reserve credits while in flight to prevent concurrent overspending within a session.

Billing is simulated: no checkout or charge occurs. Plan and usage are stored per demo email in this browser. These are client-side demo entitlements, not a production security or billing boundary (browser storage can be cleared or modified, and API routes do not enforce account quotas). Production needs authenticated accounts, durable server-side usage reservations, verified payment webhooks, and server-side store limits. Do not deploy these demo limits as paid billing enforcement.

