# AI-assisted build history

This file is a process record of the actual build session on 29 October 2026. It is **not a verbatim export of the conversation**. No conversations, prompts, model outputs or test results have been fabricated. The native conversation export/share link should accompany this file when submitting.

## User request

The user supplied the ENAM main challenge and companion financial glossary PDFs and wrote: **“do the work in the assignment”**. They specifically distinguished instructions inside the attached documents from their request. The agent treated those PDFs as the assignment specification and did not treat the email instruction inside them as permission to send an email.

## Requirements and scope decisions

The agent extracted all four pages of the main brief and all three pages of the reference. It selected a mobile-first web app with two focused workflows: prioritised portfolio filings and evidence-led company research. It selected 18 NSE-listed companies across sectors, and kept four verified research snapshots separate from generic live retrieval.

The agent chose a single ESM Worker, plain HTML/CSS/JavaScript, deterministic domain logic and `unpdf` PDF extraction. It built an optional chat-completions-compatible model adapter but did not configure or claim a paid model call. No subagents were used.

## Actual implementation sequence

1. Read the PDF and Sites skills; extracted the assignment requirements; created a new private FINN Site and persisted its identity.
2. Installed `unpdf` and `esbuild`. Fetched all 18 Yahoo price histories and 62 matching NSE announcements. Captured data is preserved with a timestamp.
3. Retrieved company/exchange documents and checked factual examples against official TCS, Infosys, Reliance and HUL material. Some Infosys direct Python downloads returned HTTP 403. Verified historical facts retain original links; live source failures remain visible.
4. Implemented category prioritisation, IST timestamps, digest windows, deduplication, completed-session EOD handling, a volume baseline excluding today, browser-saved review states and alert preferences.
5. Implemented research discovery from Screener document links while restricting ingestion to eligible company/exchange annual reports and transcripts. Implemented sequential bounded PDF reads, visible partial coverage, lexical retrieval and abstention.
6. Added the Infosys FY2025 guidance comparison. The comparison uses the same full-year CC growth outcome across quarterly management updates and explicitly distinguishes the Q4 actual from an earlier forecast.
7. Built a responsive interface with filing drawers, source links, research tabs, portfolio search/sort, a historical results replay and visible data modes.
8. Added unit and bundled-API tests and a deployment validator. Detailed observed checks are recorded in VALIDATION.md.

## Observed failures and fixes

- PDF console extraction initially hit Windows cp1252 encoding; setting UTF-8 output allowed the full brief to be read.
- A source helper setup attempt used a directory before it existed; the agent created the project directory, reran setup and persisted the same Site identity.
- Network access was initially restricted; the user granted network access for fetching sources, dependencies and deployment.
- `unpdf` / PDF.js v6 changed cleanup from `pdf.destroy()` to `pdf.loadingTask.destroy()`. Live research for Dixon and Persistent exposed this error; the agent fixed it and repeated those real retrievals successfully.
- Localhost preview timed out in the in-app browser and Edge. Direct bundled API checks continued; hosted/browser validation is recorded separately, without claiming the failed local preview passed.
- GitHub CLI authentication was invalid. The agent suggested the GitHub connection and confirmed the connector profile after it became available. Repository publication status is recorded in the final submission notes.

## Model boundaries

The AI coding agent wrote and revised the source, used tools, inspected failures and added tests. Runtime financial facts in snapshots are manually checked source-backed facts. Runtime default answers are extractive passages, not model-generated financial advice. The optional model layer receives retrieved chunks as untrusted data and checks cited source IDs before display; valid IDs alone do not prove a claim is accurate.

## Reproducibility

Source, lockfile, captured data, tests, build scripts and limitations are included. Run `npm ci`, `npm run build`, `npm test` and `npm run validate`. Third-party sites can change; captured evidence and explicit errors make those differences reviewable.
