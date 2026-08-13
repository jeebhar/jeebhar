# Jeebhar

Marketing site for **Jeebhar**, a social media agency for restaurants and food brands.

React + TypeScript frontend, Express + MongoDB API, layered MVC on both sides, containerised, with CI/CD.

---

## Quick start

```bash
# 1. Install
npm install
npm run install:all

# 2. Configure the API
cp server/.env.example server/.env       # Windows: copy server\.env.example server\.env
#    Then set MONGODB_URI and ADMIN_TOKEN. Generate a token with:
#    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Configure the frontend (optional — defaults to localhost:5000)
cp client/.env.example client/.env.local

# 4. Run both
npm run dev
```

| Surface        | URL                              |
| -------------- | -------------------------------- |
| Website        | http://localhost:5173            |
| Content editor | http://localhost:5173/#/admin    |
| API            | http://localhost:5000/api        |
| Health         | http://localhost:5000/api/health |

The database seeds itself from `server/src/seed/default-content.js` on the first `GET /api/content`, so the site renders immediately against an empty database.

### With Docker

```bash
cp .env.docker.example .env      # set MONGO_PASSWORD and ADMIN_TOKEN
npm run docker:up
open http://localhost:8080
```

nginx serves the built frontend and proxies `/api` to the API container, so the browser sees one origin and MongoDB is never published to the host.

---

## Architecture

Both halves follow the same rule: **each layer knows only the layer directly beneath it.**

```
Backend                                  Frontend
────────────────────────────────────     ────────────────────────────────────
routes/       pipeline + middleware      pages/        route composition
   ↓                                        ↓
controllers/  HTTP in, HTTP out           components/   views (props in, JSX out)
   ↓                                        ↓
services/     business rules              features/*/hooks/  state + orchestration
   ↓                                        ↓
repositories/ data access                 features/*/api/    typed endpoints
   ↓                                        ↓
models/       schema + invariants         services/http-client  one place for HTTP
                                            ↓
                                          models/       shared types
```

A request walks exactly one path down and back:

```
POST /api/contact
  → contact.routes.js         throttle, then validate against the Zod schema
  → contact.controller.js     read req.validated, call the service, shape the response
  → contact.service.js        persist first, then notify; a mail failure never fails the user
  → contact-submission.repository.js
  → contact-submission.model.js
```

### How SOLID shows up here

| Principle                 | Where you can see it                                                                                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single responsibility** | `App.tsx` went from 513 lines doing fetching, validation, carousels, the editor and all markup to a 60-line shell that only chooses a route.                                                                                                |
| **Open–closed**           | A new nav section is one entry in `client/src/config/navigation.ts`. A new API resource is one line in `server/src/routes/index.js`. A new editor field is one entry in a `fields` array. Nothing else changes.                             |
| **Liskov substitution**   | `SmtpMailer` and `NoopMailer` implement the same `send()` shape, so a missing SMTP config degrades to a warning instead of a 500.                                                                                                           |
| **Interface segregation** | Views take only the slice of content they render — `WorkSection` receives `work`, not the whole document.                                                                                                                                   |
| **Dependency inversion**  | Services receive their repository and mailer through the constructor, so the unit tests run with no database and no SMTP server. `env.js` is the only module that reads `process.env`; `http-client.ts` is the only one that calls `fetch`. |

Full detail in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Project layout

```
jeebhar/
├── client/                       React + TypeScript + Tailwind
│   ├── public/                   favicons, PWA icons, brand artwork, manifest
│   │   └── brand/                logo lockups (light + dark tones), OG image
│   └── src/
│       ├── app/                  App shell
│       ├── components/
│       │   ├── admin/            editor widgets
│       │   ├── layout/           Header, Footer, page states
│       │   ├── sections/         one file per page section
│       │   └── ui/               Button, Card, Carousel, Logo, TextField…
│       ├── config/               app config + navigation (single source of truth)
│       ├── features/
│       │   ├── contact/          api, hooks, validator
│       │   └── content/          api, hooks
│       ├── hooks/                cross-feature hooks
│       ├── models/               shared types
│       ├── pages/                HomePage, AdminPage
│       ├── services/             http-client
│       └── utils/                error mapping, scrolling
│
├── server/                       Express + MongoDB
│   ├── src/
│   │   ├── config/               env (validated at boot), database
│   │   ├── controllers/          thin HTTP adapters
│   │   ├── middleware/           auth, validate, rate limit, error handling
│   │   ├── models/               Mongoose schemas
│   │   ├── repositories/         data access
│   │   ├── routes/               request pipelines
│   │   ├── seed/                 default content + seeder
│   │   ├── services/             business rules
│   │   ├── utils/                logger, HttpError, asyncHandler
│   │   └── validators/           Zod schemas
│   └── tests/                    unit + HTTP + integration
│
├── docker/                       Dockerfiles + nginx config
├── docker-compose.yml            mongo + api + nginx
├── .github/workflows/            ci.yml, cd.yml, security.yml
└── docs/                         ARCHITECTURE, API, DEPLOYMENT, BRAND
```

---

## Branding

The favicon and logo are generated from the source artwork into `client/public/`:

| File                                                    | Used for                                       |
| ------------------------------------------------------- | ---------------------------------------------- |
| `favicon.ico` (16→64px)                                 | browser tabs, bookmarks                        |
| `favicon-16/32/48x48.png`                               | modern browsers                                |
| `apple-touch-icon.png`                                  | iOS home screen (opaque, iOS ignores alpha)    |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | PWA install and Android                        |
| `brand/jeebhar-logo-light*.png`                         | header and footer — reversed for the dark UI   |
| `brand/jeebhar-logo*.png`                               | original artwork, for light surfaces and print |
| `brand/jeebhar-mark*.png`                               | square mark, used in tight spaces              |
| `brand/og-image.png`                                    | link previews                                  |

Every use of the logo goes through `<Logo variant tone height />`, so swapping the artwork is a one-file change. Palette tokens live in `client/tailwind.config.ts`. See [`docs/BRAND.md`](docs/BRAND.md).

---

## Commands

Run from the repository root.

| Command                                             | What it does                                                |
| --------------------------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                                       | client and API together, with reload                        |
| `npm run verify`                                    | lint, format, typecheck, tests, build — the same gate as CI |
| `npm test`                                          | server and client test suites                               |
| `npm run lint` / `lint:fix`                         | ESLint across both packages                                 |
| `npm run format`                                    | Prettier write                                              |
| `npm run typecheck`                                 | `tsc --noEmit` on the client                                |
| `npm run build`                                     | production frontend build                                   |
| `npm run seed`                                      | seed content (`-- --force` to overwrite)                    |
| `npm run docker:up` / `docker:down` / `docker:logs` | full stack in containers                                    |

---

## API

| Method | Path           | Auth        | Purpose                            |
| ------ | -------------- | ----------- | ---------------------------------- |
| `GET`  | `/api/health`  | —           | liveness + database state          |
| `GET`  | `/api/content` | —           | site content, seeded on first read |
| `PUT`  | `/api/content` | admin token | replace site content               |
| `POST` | `/api/contact` | —           | submit an enquiry (throttled)      |

Every response uses one envelope:

```json
{ "ok": true,  "data": { } }
{ "ok": false, "message": "Validation failed.", "details": [{ "field": "email", "message": "…" }] }
```

Full reference in [`docs/API.md`](docs/API.md).

---

## Security

- **Writes are authenticated.** `PUT /api/content` requires `ADMIN_TOKEN` via `Authorization: Bearer …` or `x-admin-token`, compared in constant time. The editor moved off the public homepage to `/#/admin`; the token is typed in per session and held in memory only — never in `localStorage`, never in the bundle.
- **Everything is validated at the edge.** Zod schemas run before controllers and strip unknown keys, so no request field reaches a model unchecked.
- **Throttled.** 100 requests / 15 min per IP on the API, 5 on the contact endpoint.
- **Hardened headers.** Helmet on the API; CSP, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy` from nginx.
- **No secrets in git.** Only `*.example` files are tracked; CI fails if a `.env` is ever committed, and gitleaks scans history.
- **Errors do not leak.** Unexpected 5xx responses are redacted in production and logged server-side instead.

> **If this repository ever contained a real `MONGODB_URI` or SMTP password, rotate those credentials now.** Deleting them from the working tree does not remove them from git history.

---

## CI/CD

| Workflow       | Trigger                  | Jobs                                                                                                |
| -------------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| `ci.yml`       | push, PR                 | server lint/format/test · client lint/format/typecheck/test · production build · Docker image build |
| `cd.yml`       | push to `main`, `v*` tag | publish images to GHCR · deploy over SSH · `/api/health` smoke test                                 |
| `security.yml` | push, PR, weekly         | `npm audit` · dependency review · CodeQL · secret scan                                              |

Deployment is opt-in: without `DEPLOY_HOST` the pipeline still publishes images and reports a skipped deploy, so CI is green from the first commit. See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the secrets and variables to configure.

---

## Editing content

1. **Before go-live** — edit `server/src/seed/default-content.js`, then `npm run seed -- --force`.
2. **After go-live** — open `/#/admin`, paste your `ADMIN_TOKEN`, edit Work and Reels, save.
3. **Media kit** — drop your PDF at `client/public/brand/jeebhar-kit.pdf`, or point `mediaKitUrl` at a hosted file.

---

## License

Proprietary — © Jeebhar. All rights reserved.
