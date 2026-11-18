# CyberCheck — privacy-first mobile exposure checker

**Status:** Deployable MVP source project, not yet publicly hosted. Incident coverage is **November 16, 2026 Optimizely Web compromise only**.

CyberCheck gives mobile visitors a guided website lookup and a cautious, user-reported potential-exposure assessment. It does **not** detect malware, verify actual malicious JavaScript execution, scan a phone, automatically read browser history, or guarantee safety.

## What's included

- React + Vite + Tailwind responsive interface, with mobile browser-history walkthroughs (Safari, Chrome, Samsung Internet, Firefox).
- Searchable list of **178 organizations** and **253 explicitly published hostnames** transcribed from the Report URI original research.
- Exact hostname matching, separate brand/related-host hints, and cautious unknown results.
- User-provided visit/date/time/device/action questions and tailored next steps.
- Local, downloadable **text** summary without collecting personal information.
- Python data compiler and automated logic tests.
- HTTPS-ready Cloudflare Pages security headers and PWA install manifest.

**Privacy:** No backend API, tracking scripts, cookies, analytics, accounts, or browser-history uploads. A browser downloads the public incident JSON. Assessments and summaries are processed locally. Hosting providers may still collect standard web access logs. No third-party domains are contacted by the app; external research links only open when clicked.

See `DEPLOYMENT.md` and `TEST_REPORT.md` for current release readiness and outstanding verification.

## Getting started locally

Requires Node.js 22.12+ (24 recommended) and Python 3.9+.

```bash
npm ci
npm run data
npm test
npm run dev
```

Open the displayed localhost URL. To make a production build:

```bash
npm run build
npm run preview
```

A built directory named `dist/` is generated. You can deploy it without running Python on the hosting server.

## Deploy to Cloudflare Pages (GitHub route)

1. Create a GitHub repository and push this project's files (excluding `node_modules` and `dist`).
2. In Cloudflare dashboard choose **Workers & Pages → Create → Pages → Connect to Git** and select the repo.
3. Select the **React (Vite)** framework preset, **Build command** `npm run build`, and **Build output directory** `dist`.
4. Deploy. Cloudflare provides an HTTPS `pages.dev` address. Add a custom domain later if desired.
5. Verify `_headers` is present in the deployed static assets, check mobile UI, and test domain matching.

Official reference: https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/

### Deploy without GitHub

Run `npm ci && npm run build`, then use Cloudflare Pages direct upload of the generated `dist` folder through its dashboard (if available for your account) or the Wrangler Pages deployment workflow. Do not upload unbuilt React `src` files as a published website.

## Incident evidence and limitations

- Research: https://report-uri.ghost.io/worlds-largest-brands-infected-with-malware-via-optimizely/
- Vendor incident statement: https://pages.optimizely.com/rs/947-RKE-048/images/Security%20Incident%20Report%20-%20Optimizely%20Web%20Experimentation%20-%20Nov%2017%202026.pdf
- Report URI identified 188 infected Optimizely snippets tied to 178 organizations. The source abbreviates some domain lists (e.g., `+4 more`). We include only **explicitly printed** hostnames; therefore a negative match is never a proof of safety.
- The broad researcher observation window is approximately 04:21–21:52 UTC, November 16. Some sites were compromised later and cleaned earlier; the exact **per-host** exposure window is unknown. Earlier related campaigns may have affected other scripts and other days.
- An exact listed hostname establishes that it was associated with an infected snippet in the investigation, **not** that the user loaded malicious code on a specific visit. Some Content Security Policies blocked portions of the attack.
- Visit time is interpreted in the user's current local timezone when entered; travelers or users with changed device timezone should double-check.
- Card skimming behavior started later than the initial injection, and hosted card fields may not have been accessible. The questionnaire therefore recommends evaluation, never asserts theft.

## Updating the domain dataset

Edit `scripts/source_domains.txt`, carefully attributing additional hostnames to a reliable source, then run `python3 scripts/build_data.py`. The compiler enforces 178 rows for this incident snapshot; change the validation intentionally if a new source establishes an updated list. Test and review before publishing new data. **Do not scrape or execute live scripts from compromised websites.**

## Maintenance / accessibility checklist

- Verify incident updates and hostnames from primary references before each release.
- Test Safari iOS, Chrome Android, Samsung Internet, keyboard navigation, high zoom, and screen readers.
- Assess whether PWA installation is supported in each browser; an install manifest alone does not imply offline access.
- No alert emails or personal data collection without a separate privacy/security review.
- For legal or clinical implications of compromise, refer users to relevant service providers and device-security experts rather than claiming this is forensic proof.

## Project files

- `src/main.jsx`: interface
- `src/styles.css`: visual design
- `src/assessment.js`: browser-side logic
- `scripts/source_domains.txt`: manually curated domain inventory
- `scripts/build_data.py`: Python compiler
- `public/data/incident.json`: generated dataset
- `public/_headers`: Cloudflare Pages response headers
- `tests/assessment.test.mjs`: automated logic tests

MIT-style use: You may modify and deploy the code for your own use. Report URI's incident information remains attributed to its original publication.
