# Cloudflare Deployment Guide

## Setup

1. Install Wrangler CLI:
```bash
npm install wrangler -g
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Configure Supabase secrets:
```bash
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_ANON_KEY
```

## Deployment

### Local Build
```bash
npm run build
```

### Deploy to Cloudflare Pages
```bash
npm run deploy
```

### Deploy to Staging
```bash
npm run deploy:staging
```

### Deploy to Production
```bash
npm run deploy:production
```

## Environment Variables

Set these in Cloudflare Pages dashboard or via secrets:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key

## Notes

- This project uses TanStack Router (client-side) with Supabase
- No server-side rendering required for this deployment
- Cloudflare Pages will serve the static build
- All data fetching happens client-side via Supabase
