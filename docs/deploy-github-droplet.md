# GitHub → live site (Droplet auto-deploy)

Every push to **`main`** runs `.github/workflows/deploy.yml`, which pulls the latest code on the server and runs `scripts/deploy-production.sh` (builds a new image while the site stays up, then swaps containers).

Production URL: **https://origincarpets.com**

## One-time GitHub setup

### 1. Deploy SSH key (recommended)

On your Mac:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/origincarpets-deploy -N "" -C "github-actions-deploy"
cat ~/.ssh/origincarpets-deploy.pub
```

On the droplet:

```bash
ssh root@157.230.122.82
echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys
```

In GitHub: **Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
|--------|--------|
| `DROPLET_HOST` | `157.230.122.82` |
| `DROPLET_USER` | `root` |
| `DROPLET_SSH_KEY` | Contents of `~/.ssh/origincarpets-deploy` (private key) |

### 2. Push code

```bash
git push origin main
```

Watch **Actions** tab on GitHub. Small frontend-only changes usually deploy in **~3–5 minutes**; full rebuilds can take ~10 minutes. The live site keeps running during the build and is only down for a few seconds during the container swap.

## What is never overwritten on the server

- `backend/.env` (iPay, JWT, DB, etc.)
- `/opt/carp/.db-credentials`
- `backups/`

## Manual deploy (if needed)

```bash
ssh root@157.230.122.82 'cd /opt/carp && git pull origin main && bash scripts/deploy-production.sh'
```
