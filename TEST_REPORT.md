# CyberCheck verification — November 18, 2026

## Passed

- Dependency installation and Vite/Tailwind production compilation; static output generated in `dist/`.
- Python dataset compiler: 178 organizations, 253 published hostnames.
- Independent HTML table comparison: all organization names and host sets matched the original Report URI research; zero differences.
- 18 automated assertions: inventory, URL normalization, path ignoring, credential/scheme rejection, malformed DNS labels, exact/related/unknown matches, attacker suffixes, no infection conclusion, card follow-up, pre-observation time, late visits without a false all-clear, invalid time, timezone equivalence and visit uncertainty.
- Source privacy checks: only a fixed same-origin incident-data fetch, no storage/cookies/beacons/history uploads or HTML injection API, normalized-host-only summary.
- Header file checks: restrictive CSP, frame restrictions, no-referrer, nosniff, HSTS; generated build includes the same header file.
- Production dependency audit: zero reported vulnerabilities at the time checked.

## Remaining / blocked

- Browser flow, layout widths 320/390/768/1280, summary download, runtime requests/storage/errors: test script prepared but NOT passed. System Chromium cannot create its process socket in this environment. Playwright browser installation also failed. No mobile responsiveness claim is made from CSS review alone.
- Full development dependency audit still flags the unpatched `picomatch` glob dependency propagated through Vite's development tooling. The dependency is not included in the static website bundle. Do not expose a development server publicly. Retained current Vite rather than accepting the audit's downgrade to an older release with other known advisories. Review for a patched release before future builds.
- Live HTTPS, effective Cloudflare headers, GitHub CI, Git integration and physical mobile-browser checks remain pending publication authorization and account access.

## Fixes

- Company selection now requires choosing an explicit hostname; it no longer silently picks the first host for a brand.
- Visits after the last observation retain cautious follow-up because infection was still present at that observation.
- Invalid visit times and malformed DNS labels return unknown/invalid results.
- Download excludes pasted URL paths, queries and fragments.
- Reset clears device and help state.
- Tailwind integrated with existing design; overflow safeguards added for long hostnames and date inputs.
- Updated Vite/build tooling, added lockfile, Node version, CI workflow, reproducible source validator and browser test script.

This is a potential-exposure screening app, not a malware scanner or proof of infection/safety.
