# Deploy to DigitalOcean with GitHub auto-deploy

Every push to `main` on [github.com/bekatev/origincarpets](https://github.com/bekatev/origincarpets) can automatically rebuild and go live.

## Architecture

| Component | URL | Role |
|-----------|-----|------|
| **web** | `https://origincarpets.com` | Next.js storefront + admin UI |
| **api** | `https://api.origincarpets.com` | NestJS API (`/api/...`) |
| **db** | (private) | Managed PostgreSQL |

iPay callback: `https://api.origincarpets.com/api/payments/ipay/callback`

---

## One-time setup

### 1. Push this repo to GitHub

```bash
git add .
git commit -m "Add DigitalOcean App Platform config"
git push origin main
```

### 2. Connect GitHub to DigitalOcean

1. Open [DigitalOcean → Apps](https://cloud.digitalocean.com/apps)
2. **Create App** → **GitHub**
3. Authorize DigitalOcean to access GitHub (if prompted)
4. Select repository **`bekatev/origincarpets`**, branch **`main`**
5. Choose **Use an existing app spec** and point to **`.do/app.yaml`**
6. Review the two services (`web`, `api`) and PostgreSQL database

### 3. Add secret environment variables

In the App → **Settings** → each component → **Environment variables**, set these as **encrypted**:

| Variable | Service | Value |
|----------|---------|--------|
| `JWT_SECRET` | api | Long random string |
| `IPAY_CLIENT_ID` | api | `3841` |
| `IPAY_CLIENT_SECRET` | api | From old origincarpets config |
| `GPOST_USERNAME` | api | `R.EBANOIDZE` |
| `GPOST_PASSWORD` | api | Georgian Post password |

`DATABASE_URL` is wired automatically from the managed database (`${db.DATABASE_URL}`).

### 4. Load your product database

**Before first production deploy**, restore your local Postgres dump into the DO database:

```bash
# Get connection string from DO → Databases → origincarpets-db → Connection details
pg_dump "YOUR_LOCAL_DATABASE_URL" > backup.sql
psql "YOUR_DO_DATABASE_URL" < backup.sql
```

Or on a fresh DB, after first deploy:

```bash
# SSH / one-off job — or run locally against DO DB
cd backend
npx prisma migrate deploy
npm run import:origincarpets
npm run sync:gpost
npm run backfill:shipping
```

Prefer **restore from backup** so shipping dimensions and admin edits are kept.

### 5. DNS (origincarpets.com)

In your domain DNS (DigitalOcean Networking or registrar):

| Type | Name | Value |
|------|------|--------|
| CNAME or A | `@` | DO provides this after you add the domain in App → Settings → Domains |
| CNAME | `www` | Same as above |
| CNAME | `api` | API component default hostname (from App → api → Domains) |

Add **both** custom domains in the App Platform UI for `web` (`origincarpets.com`, `www`) and `api` (`api.origincarpets.com`).

### 6. Create admin user

1. Register at `https://origincarpets.com/register`
2. In DO database console (or `psql`):

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Auto-deploy (after setup)

With `deploy_on_push: true` in `.do/app.yaml`:

1. You change code locally
2. `git push origin main`
3. DigitalOcean builds **api** and **web** automatically
4. Migrations run on api build (`prisma migrate deploy`)
5. New version goes live in a few minutes

Watch progress: **Apps → origincarpets → Activity**.

---

## Pre-launch checklist

- [ ] Postgres has 116 products (shop loads)
- [ ] `https://api.origincarpets.com/api/payments/config` → `{ "card": true }`
- [ ] Checkout: Georgia, free shipping
- [ ] Test iPay payment → order **PAID** in admin
- [ ] GP tracking or merchant cost shown on order
- [ ] Old MongoDB backed up (keep as archive)

---

## Updating secrets or domains

- **Secrets**: App → Settings → Environment variables → Save → **Redeploy**
- **Domain / spec changes**: Edit `.do/app.yaml` in GitHub → push → auto-redeploy

---

## Costs (rough)

- App Platform: 2 small services (~$10–24/mo depending on size)
- Managed PostgreSQL: ~$15/mo (dev tier) and up
- You can start smaller and scale later

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on `prisma migrate` | Check `DATABASE_URL` is `RUN_AND_BUILD_TIME` and DB is attached |
| Checkout API errors | Confirm `NEXT_PUBLIC_API_URL` is `https://api.origincarpets.com/api` |
| iPay redirect fails | `IPAY_REDIRECT_URL` must match api domain exactly |
| CORS errors | `FRONTEND_URL` on api must be `https://origincarpets.com` |
| Images missing | Product images may still load from `origincarpets.com` URLs until migrated to `/uploads` |
