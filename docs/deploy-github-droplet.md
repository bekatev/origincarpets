# GitHub → live site (Droplet auto-deploy)

Every push to **`main`** runs `.github/workflows/deploy.yml`, copies the repo to the server, and runs `scripts/deploy-docker.sh`.

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

Watch **Actions** tab on GitHub. First deploy takes ~10–15 minutes (Docker build).

## What is never overwritten on the server

- `backend/.env` (iPay, JWT, DB, etc.)
- `/opt/carp/.db-credentials`
- `backups/`

## Manual deploy (if needed)

```bash
ssh root@157.230.122.82 'cd /opt/carp && bash scripts/deploy-docker.sh'
```
