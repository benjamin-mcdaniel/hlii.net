# HLII v1

HLII stands for `Hard Limits & Incentives Index`.

This repo contains a small public-facing pilot for `hlii.net`:

- static site assets in `public/`
- a small Cloudflare Worker in `src/`
- Wrangler configuration in `wrangler.jsonc`

## Local development

```bash
npm install
npm run dev
```

## Deploy

```bash
npm run deploy
```

## Current scope

Version one is intentionally small:

- methodology-first
- pilot company universe
- hand-authored seed scorecards
- no paid data vendors
- no background services

The next practical step would be replacing the seed scorecards with a filings-backed scoring pipeline built from SEC data.
