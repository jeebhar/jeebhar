# Deployment

## Pipelines

| Workflow       | Trigger                              | What it does                                                                                                             |
| -------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `ci.yml`       | push / PR to `main`, `develop`       | server lint + format + test · client lint + format + typecheck + test + coverage · production build · Docker image build |
| `cd.yml`       | push to `main`, `v*.*.*` tag, manual | publish images to GHCR · deploy over SSH · `/api/health` smoke test                                                      |
| `security.yml` | push / PR, weekly Monday 06:00 UTC   | `npm audit` (high+) · dependency review · CodeQL · tracked-`.env` check · gitleaks                                       |

`ci.yml` runs client and server as independent jobs so a frontend failure never hides a backend one. `build` and `docker` only run once both pass.

---

## One-time setup

### Repository secrets

_Settings → Secrets and variables → Actions → Secrets_

| Secret           | Needed for | Notes                                                                         |
| ---------------- | ---------- | ----------------------------------------------------------------------------- |
| `DEPLOY_HOST`    | SSH deploy | hostname or IP. **Absent = deploy step skips cleanly**, images still publish. |
| `DEPLOY_USER`    | SSH deploy | user with permission to run `docker compose`                                  |
| `DEPLOY_SSH_KEY` | SSH deploy | private key, full PEM including header and footer                             |
| `DEPLOY_PATH`    | SSH deploy | directory on the host holding `docker-compose.yml` and `.env`                 |

`GITHUB_TOKEN` is provided automatically and is what pushes to GHCR.

### Repository variables

_Settings → Secrets and variables → Actions → Variables_

| Variable            | Purpose                                    | Example               |
| ------------------- | ------------------------------------------ | --------------------- |
| `VITE_API_BASE_URL` | baked into the frontend at build time      | `/api`                |
| `DEPLOY_URL`        | smoke-test target and the Environment link | `https://jeebhar.com` |

### Environments

Create `staging` and `production` under _Settings → Environments_. Add required reviewers to `production` to gate deploys behind a manual approval — the `deploy` job already references the environment.

---

## Host setup

```bash
# On the server
mkdir -p /srv/jeebhar && cd /srv/jeebhar

# Bring across docker-compose.yml and .env.docker.example
cp .env.docker.example .env
```

Fill in `.env`:

```ini
HTTP_PORT=8080
MONGO_USER=jeebhar
MONGO_PASSWORD=<strong password>
MONGO_DB=jeebhar
ADMIN_TOKEN=<64 hex chars>
CLIENT_ORIGIN=https://jeebhar.com
```

Generate the admin token:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then:

```bash
docker compose up -d --build
curl -fsS http://localhost:8080/api/health
```

To pull published images instead of building on the host, replace each `build:` block with the GHCR image:

```yaml
services:
  server:
    image: ghcr.io/<owner>/<repo>/server:latest
  client:
    image: ghcr.io/<owner>/<repo>/client:latest
```

Then `docker compose pull && docker compose up -d` — which is exactly what the CD job runs.

---

## TLS

The bundled nginx listens on port 80 inside the container. Terminate TLS in front of it — a reverse proxy (Caddy, Traefik, or a second nginx with certbot), or a platform load balancer.

Minimal host-level nginx in front of the stack:

```nginx
server {
    listen 443 ssl http2;
    server_name jeebhar.com;

    ssl_certificate     /etc/letsencrypt/live/jeebhar.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/jeebhar.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name jeebhar.com;
    return 301 https://$host$request_uri;
}
```

The API sets `trust proxy`, so rate limiting sees real client IPs through `X-Forwarded-For`.

---

## Split deployment (static host + API host)

The frontend is a static bundle, so it can go to Vercel, Netlify, S3 + CloudFront or GitHub Pages while the API runs elsewhere.

1. Build with the absolute API URL:
   ```bash
   VITE_API_BASE_URL=https://api.jeebhar.com/api npm --prefix client run build
   ```
2. Publish `client/dist`.
3. Set `CLIENT_ORIGIN=https://jeebhar.com` on the API so CORS allows the static origin.
4. Configure the static host to rewrite unknown paths to `/index.html`.

---

## Environment variables

### Server (`server/.env`)

| Variable                                              | Required | Default                 | Notes                                                     |
| ----------------------------------------------------- | -------- | ----------------------- | --------------------------------------------------------- |
| `NODE_ENV`                                            | no       | `development`           |                                                           |
| `PORT`                                                | no       | `5000`                  |                                                           |
| `LOG_LEVEL`                                           | no       | `info`                  | `error` \| `warn` \| `info` \| `debug`                    |
| `MONGODB_URI`                                         | **yes**  | —                       | boot fails without it                                     |
| `ADMIN_TOKEN`                                         | **yes**  | —                       | ≥24 chars enforced in production                          |
| `CLIENT_ORIGIN`                                       | no       | `http://localhost:5173` | comma-separated                                           |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | no       | —                       | all blank ⇒ notifications skipped, enquiries still stored |
| `MAIL_TO` / `MAIL_FROM`                               | no       | —                       | required for delivery                                     |
| `RATE_LIMIT_WINDOW_MS`                                | no       | `900000`                |                                                           |
| `RATE_LIMIT_MAX`                                      | no       | `100`                   |                                                           |
| `RATE_LIMIT_CONTACT_MAX`                              | no       | `5`                     |                                                           |

### Client (build time)

| Variable                  | Default                     | Notes                   |
| ------------------------- | --------------------------- | ----------------------- |
| `VITE_API_BASE_URL`       | `http://localhost:5000/api` | inlined into the bundle |
| `VITE_REQUEST_TIMEOUT_MS` | `15000`                     |                         |
| `VITE_DEV_API_TARGET`     | `http://localhost:5000`     | dev proxy only          |

> `VITE_*` values are **compiled into the JavaScript** and readable by anyone. Never put a secret there. The admin token is entered at runtime for exactly this reason.

---

## Rollback

Images are tagged with the release version and the short commit SHA:

```bash
cd /srv/jeebhar
docker compose down
# pin the previous tag in docker-compose.yml, e.g. server:1.2.3
docker compose up -d
```

Content is data, not code, so a rollback does not revert content edits. Take a Mongo dump before a risky change:

```bash
docker compose exec mongo mongodump --archive=/tmp/jeebhar.gz --gzip \
  -u "$MONGO_USER" -p "$MONGO_PASSWORD" --authenticationDatabase admin
docker compose cp mongo:/tmp/jeebhar.gz ./backup-$(date +%F).gz
```

---

## Troubleshooting

| Symptom                                                | Cause                                | Fix                                                                               |
| ------------------------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------------- |
| Boot fails: `Missing required environment variable(s)` | `MONGODB_URI` or `ADMIN_TOKEN` unset | fill in `server/.env` or the compose `.env`                                       |
| `/api/health` returns 503                              | database not connected               | check `MONGODB_URI` and that `mongo` is healthy                                   |
| Site loads, content does not                           | wrong `VITE_API_BASE_URL`, or CORS   | check the browser network tab; align `CLIENT_ORIGIN`                              |
| `PUT /api/content` → 401                               | no token sent                        | set `Authorization: Bearer …`                                                     |
| `PUT /api/content` → 403                               | token mismatch                       | compare with `ADMIN_TOKEN` on the server                                          |
| Contact form succeeds, no email                        | SMTP unset or refused                | check `SMTP_*`; the response's `notified: false` reports this                     |
| CI: integration tests skipped                          | in-memory MongoDB binary unavailable | expected on restricted runners; `http-pipeline.test.js` still covers the pipeline |
| CD: "Deploy skipped"                                   | `DEPLOY_HOST` not set                | add the deploy secrets, or deploy manually from GHCR                              |
