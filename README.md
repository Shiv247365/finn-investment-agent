# FINN — Signal over noise

A mobile-first Indian-equity attention inbox and primary-source research workspace, built for the ENAM AI Engineer Build Challenge.

**Public demo:** https://finn-investment-agent.foamybull10.chatgpt.site

**Source:** https://github.com/Shiv247365/finn-investment-agent

## Run locally

Requires Node.js 22.14+ (Node 24 LTS recommended) and npm. No database or model key required.

```sh
npm ci
npm run build
npm test
npm run validate
npm run dev
```

Open http://localhost:4173. To change the port, set `PORT` in your shell. The source is portable across Windows, macOS and Linux. `npm run dev` serves the last build; run `npm run build` again after edits and restart the server.

## Try it in three minutes

1. **The brief:** a real captured snapshot of 62 NSE filings and 18 Yahoo Finance price histories, captured on 29 October 2026 at 17:45 IST. Start with the regulatory disclosure, open its source drawer, save it or mark it reviewed. Widen the window to seven days and expand the collapsed lower-priority disclosures.
2. **Your rules:** open Alert preferences. Change the price threshold or volume multiple and choose which material categories count. The inbox and EOD alerts recompute immediately. Preferences, reading state and saved filings persist in this browser.
3. **Research → INFY → Promise vs delivery:** FY2025 constant-currency growth was 4.2%, below the final 4.5–5.0% guidance range. See the sequence of quarterly management updates and links to the corresponding company transcripts.
4. **Try an unseen symbol:** enter `KPITTECH`, `CERA`, or another NSE symbol. FINN discovers report/transcript links, fetches primary PDFs, and retrieves evidence for a question. PDF downloads may take several seconds. Source failures are visible.
5. **Results replay:** select the clearly dated April 2025 replay in The brief and open Infosys results. Revenue and owner-attributable PAT show calculated QoQ/YoY changes. EBITDA/PBT stay blank where not verified. Current prices are excluded from this replay.
6. **Live refresh:** choose Fetch live data or Refresh sources. Yahoo and NSE are fetched server-side. Provider blocks/rate limits are surfaced. No old filings are silently substituted for a failed live feed.

## What works

- Mock portfolio of 18 NSE-listed companies spanning large, mid and smaller companies across 12 sector labels.
- NSE exchange-announcement adapter; configurable 1–720 hour digest; URL-based deduplication; category priority; routine disclosure collapse; saved and reviewed states.
- EOD Yahoo chart adapter (`.NS`); price movement and relative-volume triggers. Volume baseline is the previous 20 completed sessions and excludes today; at least 10 sessions are required. Current-session candles are excluded before 15:40 IST.
- Four verified historical research snapshots: Infosys, TCS, Reliance Industries and Hindustan Unilever. Annual reports and transcripts are linked individually, and snapshot dates and consolidation scopes remain visible.
- Generic research for any valid NSE symbol with eligible documents available. Screener is used as a **document link index only**, never as company financial evidence. Ingested research documents are annual reports or earnings-call transcripts on exchange or company domains.
- Bounded server-side PDF extraction and lexical evidence retrieval with query expansion; explicit abstention when no passage matches. Large annual reports read the first 25 and last 35 pages, visibly labelled partial coverage.
- Optional model synthesis through a server-only chat-completions-compatible endpoint. See `.env.example`. The default demo is **extractive, not LLM-generated**, and incurs no model cost. A model key is not bundled or configured. An answer with absent or invalid citation IDs is discarded. Valid IDs do not independently verify every claim.
- Mobile bottom navigation, keyboard navigation, focus styles, native accessible dialogs, reduced-motion support and responsive tables.

## Architecture and cost

`src/client.js` owns browser interactions; `src/core.js` owns deterministic financial arithmetic, timestamps, ranking and retrieval; `src/worker.js` owns HTTP ingestion, source restrictions, caching and optional model routing. `src/fixtures.js` holds manually verified facts, separate from the captured exchange/price feed in `data/snapshot.json`.

`scripts/build.mjs` bundles the client into the HTML and packages PDF.js through `unpdf` into one Worker ESM. The deployed Worker has no TCP/database dependency. `scripts/dev.mjs` uses the identical fetch handler through a small Node HTTP adapter.

Source discovery/documents cache for six hours; research responses cache for one hour; live market refresh caches for 15 minutes. Concurrent identical requests share an in-flight promise. Caches are bounded and ephemeral per Worker instance; this is not durable ingestion. Model synthesis uses only the top six source chunks, a small output budget and zero temperature. There is no model call for arithmetic, categorisation or verified snapshots.

API routes: `GET /api/health`, `GET /api/bootstrap`, `POST /api/sync`, `POST /api/research` with `{ticker, question?, live?}`, `POST /api/filing` with a monitored filing `{id}`.

## Deliberate boundaries

- Push means in-app monitoring. Optional polling runs only while the app is open and visible. No background notifications, scheduler or claimed real-time feed.
- No portfolio P&L, order execution, price targets, position sizes or invented transactions. The universe is a mock monitoring portfolio.
- No OCR. Downloads above 32 MB are declined; long PDFs have partial coverage. The extractor does not assert a comprehensive read of a 500-page annual report.
- No automatic financial-statement normalisation across accounting standards, currencies or consolidation scopes. Unknown figures remain unknown. Operating profit is not relabelled EBITDA.
- No automatic biographies, eight-section template generation or universal four-quarter guidance extraction. The focused worked comparison is Infosys FY2025; TCS explicitly does not give numeric revenue/earnings guidance.
- Yahoo closes are unadjusted. Splits/dividends can distort close-to-close alerts and need corporate-action normalisation before production use.
- Live availability depends on NSE/Yahoo/Screener/company access policies. These endpoints are not contractual APIs. The captured snapshot makes the main demo reproducible.
- The model adapter is implemented but not exercised against a paid model. Default retrieval is tested. Prompt injection is mitigated by separating instructions and documents, not claimed solved by a prompt.

## Validation

`npm test` exercises financial edge cases, IST conversion, volume baseline exclusion, window/future filtering, deduplication, classification, source URL validation, abstention, guidance comparability and bundled API behaviour. `npm run validate` checks deployable Worker ESM. See `VALIDATION.md` for observed end-to-end checks.

## Deployment / repository

The tracked `.openai/hosting.json` identifies the existing Site. The user approved public access for the demo and repository. Build and publish through Sites for the same project; preserve access unless deliberately changed. The generic Node server can also be hosted on a standard Node service using `npm run build` then `npm start`.

To put a clean copy on GitHub after authenticating the CLI:

```sh
git init -b main
git add .
git commit -m "Build FINN investment research prototype"
gh repo create finn-investment-agent --private --source . --remote github --push
```

If the working copy already has a Sites-managed Git history, skip `git init` and use a separate `github` remote. The source archive contains no credentials, dependencies or user account data. The submission covering note and AI build history live under `docs/`.
