# CyberCheck deployment

Prepared November 18, 2026. Publication and account changes await James's authorization.

## Proposed deployment

- GitHub repository: `cybercheck` in the authorized personal account. Proposed visibility: public.
- Cloudflare Pages project: `cybercheck` (availability to be checked).
- Git production branch: `main`; project root: repository root.
- Build command: `npm run build`; output: `dist`; Node: `24`.
- Use Pages Free and its included HTTPS `pages.dev` hostname. No custom domain purchase, Workers functions, database, analytics, or paid services.
- GitHub integration authorization is required. Grant access to this repository only where supported.
- Both repository and project URLs remain pending; no live website exists from this release yet.

## Reproduce locally

```sh
npm ci
npm run data
npm run build
npm test
npm run preview -- --port 4173
```

In a second terminal, install supported test browsers and run:

```sh
npx playwright install --with-deps chromium webkit
npm run test:browser
```

The browser suite requires a functioning browser runtime. It fails when browsers cannot launch; a blocked launch is never a successful browser test. Automated viewports supplement real iPhone Safari, Android Chrome, and Samsung Internet checks.

## Data provenance

Original: https://report-uri.ghost.io/worlds-largest-brands-infected-with-malware-via-optimizely/

All 178 organization rows and 253 explicitly printed hostnames were compared against the original article HTML with zero differences on November 18. Save the article HTML and run:

```sh
python3 scripts/validate_source.py /path/to/research.html
```

The table abbreviates some additional hostnames. Those omitted hosts are not invented or inferred. The timestamps describe observations, not a complete compromise interval. One snippet was still infected at the final observation.

## Publication verification

1. Confirm Pages Free and no paid services before creation.
2. Connect the approved repository and deploy using the settings above.
3. Confirm HTTPS loads the app and `/data/incident.json` returns the expected dataset.
4. Inspect live response headers using `curl -I https://ACTUAL-HOST.pages.dev/`; verify CSP, no-referrer, nosniff, frame restrictions, permissions policy and HSTS. Vite preview does not apply Cloudflare `_headers`.
5. Run the assessment on a real Android phone and iPhone. Confirm an exact hostname, a related www hostname, an unlisted hostname, uncertain visit, card activity, back/edit, reset, and summary download. Check small screens and landscape for overflow.
6. Inspect network requests and storage: assessments must never be transmitted; no analytics, cookies or browser-history access. Cloudflare may retain ordinary access logs, including IP addresses; do not promise anonymous hosting.
7. Record actual repository URL, deployment URL, commit and live results in this file.

## Maintenance and rollback

Review primary research before changing source data. Run Python compiler, production build, unit checks and browser suite before pushing. GitHub CI is supplied but has not run in an external repository yet. Cloudflare's Git integration redeploys pushes. Use the Pages deployment rollback control for a verified prior deployment or revert the Git commit. No server-side Python runtime is necessary; Python data and validation tools remain in source.

References:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-react-site/
- https://developers.cloudflare.com/pages/platform/limits/
