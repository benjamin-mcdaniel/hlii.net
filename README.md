# hlii.net

Harbor Legal Independent Index (HLII)

Harbor Legal Independent Index tracks American legal-source movement across
legislatures and higher courts, then packages the aggregate record for reports,
APIs, and future MCP access. MVP build: reports are public now; source status
and movement endpoints come next.

## Repo layout

Only two top-level folders contain code. Everything else is workflow or docs.

```text
frontend/
  web/   Static site. Auto-deployed by Cloudflare Pages on push to main.
         Includes the PDF viewer (pdf.js) and the /reports/ catalog + PDFs.
  api/   Cloudflare Worker - user-interface API at hlii.net/api/*.
         Deployed by GitHub Actions (deploy-frontend-api.yml).

backend/
  api/      Cloudflare Worker - ingest API at backend.hlii.net.
            Accepts data from the collector scripts. Writes to D1 / R2.
            Deployed by GitHub Actions (deploy-backend-api.yml).
  scripts/  Python collectors (bills, rulings). Run by GitHub Actions on a
            schedule, POSTed to backend.hlii.net/ingest/*.
```

## Deploys

| Surface             | How                                  | Where            |
| ------------------- | ------------------------------------ | ---------------- |
| Static site         | Cloudflare Pages on push to `main`   | `hlii.net`       |
| Frontend API worker | GitHub Actions -> `wrangler deploy`  | `hlii.net/api/*` |
| Backend API worker  | GitHub Actions -> `wrangler deploy`  | `backend.hlii.net` |
| Data collectors     | GitHub Actions scheduled run         | POST to backend  |

The two worker deploys are separate workflows with separate `wrangler.jsonc`
files, so they ship independently.

## Cloudflare Pages setup

Point the Cloudflare Pages project at this repo with:

- Root directory: `frontend/web`
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

Pages will redeploy automatically whenever `frontend/web` changes.

## GitHub Actions secrets

Set these once in repo Settings -> Secrets and variables -> Actions:

- `CLOUDFLARE_API_TOKEN`: used by both wrangler deploy workflows. It needs
  rights to deploy Workers and manage the D1 database and R2 bucket the
  backend binds to.
- `HLII_INGEST_TOKEN`: shared secret for the collector workflow and backend
  worker. The collectors send it as `X-Ingest-Token`, and the backend worker
  reads the same value as the `INGEST_TOKEN` wrangler secret.

On the backend worker, set the matching secret with:

```bash
cd backend/api
npx wrangler secret put INGEST_TOKEN
```

## Reports

Each report is a fixed PDF in `frontend/web/public/reports/` plus an entry in
`frontend/web/public/reports/index.json`. To publish a new report:

1. Drop the PDF into `frontend/web/public/reports/`.
2. Add an entry to `index.json` with `id`, `title`, `summary`, `date`,
   `topic`, and `file`.
3. Commit and push. Cloudflare Pages redeploys the site.

The viewer (`frontend/web/public/viewer.js`) loads PDFs by `?file=` query
param on `/reports`, so catalog links open inline.

## Local development

Each worker has its own package.json:

```bash
# Frontend API
cd frontend/api
npm install
npx wrangler dev

# Backend API
cd backend/api
npm install
npx wrangler dev
```

The static site is an Astro app in `frontend/web`:

```bash
cd frontend/web
npm install
npm run build
```

Astro outputs the production site to `frontend/web/dist`.

## Scope (MVP)

- Static MVP site explaining what Harbor Legal Independent Index tracks.
- PDF viewer on `/reports` with a demo report.
- Frontend API and backend API split, both deploying via GitHub Actions.
- Public dynamic endpoint is intentionally limited to `/api/reports` today.
- Collectors are placeholder stubs that POST sample payloads end-to-end.
- No contact info, no analytics, and no third-party trackers.
