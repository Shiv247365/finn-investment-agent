# Validation record

Observed on 29 October 2026. These are actual checks, not proposed tests.

| Check | Observed result |
| --- | --- |
| Production build | Passed; one Worker ESM bundle, about 1.8 MB before archive compression |
| Automated checks | 14 tests passed, 0 failed |
| Artifact validation | Valid ESM with `default.fetch` |
| Captured price ingestion | 18/18 Yahoo Finance histories available |
| Captured exchange ingestion | 62 NSE filings for the monitored universe |
| Historical research | Infosys returned 5 source links and source-backed evidence |
| Generalised research: DIXON | 3 live primary PDF documents, 6 retrieved passages, no source errors |
| Generalised research: PERSISTENT | 3 live primary PDF documents, 6 retrieved passages, no source errors |
| Long-report coverage | Explicit first-25 / last-35 page sampling for 520-page Dixon and 500-page Persistent reports |
| Local UI preview | Localhost timed out in both supported browsers; not counted as a pass |
| Runtime model synthesis | Not configured or tested against a live model; extractive mode is the default |

The live PDF checks initially failed on cleanup because PDF.js v6 exposes `loadingTask.destroy()` rather than `destroy()` on the proxy. The fix was followed by successful real downloads and retrievals for both symbols.

## Hosted checks

- Sites deployment succeeded and public access was confirmed on 29 October 2026.
- The hosted inbox displayed 3 material disclosures, 7 lower-priority disclosures and 2 EOD threshold crossings in the captured 24-hour window.
- A 390 × 844 mobile viewport displayed the bottom navigation, inbox and research forms without page-level horizontal overflow. The visible content width was 375 px including browser scrollbar allocation.
- Mobile research navigation loaded the verified Infosys snapshot, all four guidance rows and linked source documents.
- Hosted generic DIXON research returned three primary PDF documents and six evidence passages through the Cloudflare Worker, confirming this path works outside the local Node environment.
- Source-site authentication and GitHub integration scope limitations were handled separately from product runtime checks. No paid model inference was used.

Network-dependent results can vary later with upstream access policies.
