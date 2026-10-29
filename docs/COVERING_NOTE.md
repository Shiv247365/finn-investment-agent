To: assessment@enam.com
Subject: ENAM - IIT screening - 2027

Hello ENAM team,

Please find FINN, a mobile-first Indian equity monitoring and research prototype.

Prototype: https://finn-investment-agent.foamybull10.chatgpt.site
Repository: https://github.com/Shiv247365/finn-investment-agent
AI build history: see docs/AI_BUILD_HISTORY.md and docs/CONVERSATION_EXPORT.json in the repository. The export contains the actual visible dialogue and tool-event metadata, with credentials and private reasoning excluded.

I focused on two workflows: an attention inbox that ranks portfolio filings and collapses routine disclosures, and a research workspace that lets an investor test management’s story against primary evidence. The portfolio covers 18 NSE companies, with configurable EOD price/volume triggers, saved filings and review states. The captured demo contains actual NSE announcements and Yahoo price histories from 29 October 2026; live refresh is separate and exposes provider failures.

The research view includes four historical company snapshots and a generic report/transcript discovery and PDF retrieval pipeline for other NSE tickers. The Infosys FY2025 worked example follows guidance through quarterly management updates: actual constant-currency growth of 4.2% missed the final 4.5–5.0% range, even though it exceeded earlier expectations. Each comparison links to the original company transcript. Company reporting scope, dates and missing evidence remain explicit.

The main trade-off was reliability and cost over breadth. Arithmetic, categorisation, ranking and evidence retrieval are deterministic. The default prototype uses no paid inference and does not disguise extraction as model analysis. An optional server-only, citation-checked model adapter can synthesise retrieved evidence when configured. Short source chunks, caching and shared in-flight requests keep repeated work inexpensive.

I deliberately left out background mobile notifications, trading, OCR, automatic biographies and universal financial-table normalisation. Large annual reports have clearly labelled partial coverage; unverified EBITDA/PBT values stay blank. The next step would be durable ingestion and source/page indexing, corporate-action-adjusted prices, evaluated model synthesis, and automated guidance extraction with a human-verifiable audit trail.

The repository includes setup instructions, a reproducible snapshot, a short demo walkthrough and automated tests. The AI-assisted build history describes decisions, observed failures and fixes without presenting a summary as a verbatim transcript.

Regards,
Shivesh Shukla

---
Submission preparation note: this is a draft, not a sent email. Both the prototype and repository have public access as approved by the user. The exported conversation was captured during the build; the history summary and validation record document later work.
