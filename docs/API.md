# API reference

Base URL: `http://localhost:5000/api` in development, `/api` behind nginx in production.

## Response envelope

Every response — success or failure — uses the same shape, so clients need one code path.

**Success**

```json
{ "ok": true, "data": {} }
```

**Failure**

```json
{
  "ok": false,
  "message": "Validation failed.",
  "details": [{ "field": "email", "message": "Enter a valid email address." }]
}
```

`details` is present only for validation failures. Unexpected 5xx errors return a generic message in production; the real cause is logged server-side.

| Status | Meaning                              |
| ------ | ------------------------------------ |
| 200    | OK                                   |
| 201    | Created                              |
| 400    | Validation failed or malformed JSON  |
| 401    | Admin token missing                  |
| 403    | Admin token invalid                  |
| 404    | No such route                        |
| 413    | Payload over 256 kB                  |
| 429    | Rate limit exceeded                  |
| 503    | Health check: database not connected |

---

## `GET /api/health`

Liveness and readiness. Used by the Docker health check and the CD smoke test.

```json
{
  "ok": true,
  "data": {
    "status": "ok",
    "environment": "production",
    "database": "connected",
    "uptimeSeconds": 3814
  }
}
```

Returns **503** with `"status": "degraded"` when the database is not connected, so an orchestrator can pull the container out of rotation.

---

## `GET /api/content`

Public. Returns the single site-content document, seeding it from `server/src/seed/default-content.js` if the collection is empty — a fresh database still renders a complete site.

```json
{
  "ok": true,
  "data": {
    "brandName": "Jeebhar",
    "heroEyebrow": "For restaurants and food brands",
    "heroHeading": "Reimagine your restaurant's digital story…",
    "heroSubheading": "Jeebhar helps restaurants and food brands…",
    "mediaKitUrl": "/brand/media-kit.pdf",
    "services": [{ "_id": "…", "title": "…", "shortDescription": "…", "longDescription": "…" }],
    "work": [{ "_id": "…", "title": "…", "imageUrl": "https://…", "description": "…" }],
    "reels": [
      { "_id": "…", "title": "…", "thumbnailUrl": "https://…", "instagramUrl": "https://…" }
    ],
    "mediaKitMetrics": [{ "_id": "…", "label": "Followers reached", "value": "250K+" }],
    "contact": {
      "address": "…",
      "email": "hello@jeebhar.com",
      "phone": "+91-90000-00000",
      "facebookUrl": "",
      "youtubeUrl": "",
      "instagramUrl": "https://www.instagram.com/",
      "tiktokUrl": ""
    }
  }
}
```

---

## `PUT /api/content`

**Requires the admin token.** Replaces the whole content document — send the full object, not a patch.

**Auth** — either header works:

```
Authorization: Bearer <ADMIN_TOKEN>
x-admin-token: <ADMIN_TOKEN>
```

The comparison is constant-time, so response timing does not leak the token's prefix. A missing token is **401**; a present but wrong token is **403**.

**Validation** (`server/src/validators/content.validator.js`)

| Field               | Rule                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| `brandName`         | 1–80 chars                                                                    |
| `heroEyebrow`       | ≤160 chars, defaults to `""`                                                  |
| `heroHeading`       | 1–300 chars, required                                                         |
| `heroSubheading`    | 1–600 chars, required                                                         |
| `mediaKitUrl`       | ≤500 chars, defaults to `/brand/media-kit.pdf`                                |
| `services[]`        | ≤24; `title` ≤120, `shortDescription` ≤300, `longDescription` ≤2000           |
| `work[]`            | ≤60; `imageUrl` is an image reference (below); `description` ≤600             |
| `reels[]`           | ≤60; `instagramUrl` must be a valid URL; `thumbnailUrl` optional              |
| `travelReels[]`     | ≤60; identical rules to `reels[]`                                             |
| `mediaKitMetrics[]` | ≤12; `label` ≤120, `value` ≤40                                                |
| `contact`           | `address`, `email`, `phone` required; social URLs must be a valid URL or `""` |

**Image references.** `work[].imageUrl` and `reels[].thumbnailUrl` accept either an
absolute `http(s)://` URL or a root-relative path beginning with `/`, so images can
be self-hosted from `client/public`. Anything else (e.g. `work/photo.jpg`) is rejected.

`thumbnailUrl` is optional and defaults to `""`. Instagram does not expose reel
covers to third parties, so a blank cover is a normal state — the frontend renders a
branded tile for it.

Unknown keys are stripped rather than rejected, so a client cannot smuggle extra fields into the model.

```bash
curl -X PUT http://localhost:5000/api/content \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @content.json
```

---

## `POST /api/contact`

Public and throttled to **5 requests per 15 minutes per IP**, because it writes to the database and sends mail.

**Request**

```json
{
  "name": "Asha Rao",
  "email": "asha@example.com",
  "phone": "+91 90000 00000",
  "subject": "Campaign enquiry",
  "body": "We would like help launching our new outlet."
}
```

| Field     | Rule                                                |
| --------- | --------------------------------------------------- |
| `name`    | 2–120 chars                                         |
| `email`   | valid address, ≤254 chars, lowercased on the way in |
| `phone`   | 7–40 chars, digits and `+ - ( )` and spaces only    |
| `subject` | 3–200 chars                                         |
| `body`    | 10–5000 chars                                       |

**Response — 201**

```json
{
  "ok": true,
  "message": "Thanks — your enquiry has been received. We will be in touch shortly.",
  "data": { "id": "6712…", "notified": true }
}
```

`notified` reports whether the email notification was delivered. **A `false` here still means the enquiry was stored** — persistence is the contract with the visitor, and delivery is best-effort by design. With SMTP unconfigured, submissions are stored and a warning is logged.

---

## Rate limits

| Scope               | Limit                 | Env var                                  |
| ------------------- | --------------------- | ---------------------------------------- |
| All `/api`          | 100 per 15 min per IP | `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` |
| `POST /api/contact` | 5 per 15 min per IP   | `RATE_LIMIT_CONTACT_MAX`                 |

Responses carry the standard `RateLimit-*` headers. Limits are disabled when `NODE_ENV=test`.

---

## CORS

Allowed origins come from `CLIENT_ORIGIN` (comma-separated). Allowed headers: `Content-Type`, `Authorization`, `x-admin-token`. Methods: `GET`, `PUT`, `POST`, `OPTIONS`.

In production, nginx serves the frontend and the API from the same origin, so CORS never comes into play.
