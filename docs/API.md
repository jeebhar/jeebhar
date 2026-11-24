# API reference

Base URL: `/api` on the same domain as the site (`https://jeebhar.com/api`). In development, Vite proxies `/api` to `npm run dev:api` on `http://localhost:5000`.

Implementation: `api/index.php` (routes) and `api/src/*.php` (one class per concern). PHP 8.1+, no dependencies.

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

| Status | Meaning                             |
| ------ | ----------------------------------- |
| 200    | OK                                  |
| 201    | Created                             |
| 400    | Validation failed or malformed JSON |
| 401    | Admin token missing                 |
| 415    | Upload type not allowed             |
| 403    | Admin token invalid                 |
| 404    | No such route                       |
| 413    | Body over 512 kB / upload too large |
| 429    | Rate limit exceeded                 |
| 503    | Admin token not configured          |

---

## `GET /api/health`

Liveness. Used after a deploy.

```json
{ "ok": true, "data": { "status": "ok", "php": "8.3.6" } }
```

---

## `GET /api/content`

Public. Returns the site content in **both languages**. Until the first save it is
`api/seed/default-content.json`; afterwards `~/jeebhar-data/content.json`.

Translatable fields are `{ "en": "…", "de": "…" }`. The client picks one language and
falls back to English when German is blank.

```json
{
  "ok": true,
  "data": {
    "brandName": "Jeebhar",
    "heroEyebrow": { "en": "For restaurants and food brands", "de": "Für Restaurants und Food-Marken" },
    "heroHeading": { "en": "Reimagine your restaurant's…", "de": "Erfinden Sie…" },
    "heroSubheading": { "en": "…", "de": "…" },
    "mediaKitUrl": "/brand/media-kit.pdf",
    "services": [{ "_id": "service-01", "title": { "en": "…", "de": "…" }, "shortDescription": {…}, "longDescription": {…} }],
    "work": [{ "_id": "…", "title": {…}, "imageUrl": "/uploads/…", "description": {…} }],
    "reels": [{ "_id": "…", "title": {…}, "thumbnailUrl": "", "instagramUrl": "https://www.instagram.com/reel/…/" }],
    "travelReels": [],
    "mediaKitMetrics": [{ "_id": "metric-01", "label": { "en": "Reach", "de": "Reichweite" }, "value": "3M" }],
    "contact": { "address": "…", "email": "jeebhar410@gmail.com", "phone": "…", "facebookUrl": "", "youtubeUrl": "", "instagramUrl": "…", "tiktokUrl": "" }
  }
}
```

---

## `PUT /api/content`

**Requires the admin token.** Replaces the whole content document — send the full object, not a patch.

**Auth** — either header works (the client sends both, because some shared hosts strip `Authorization`):

```
Authorization: Bearer <admin.token>
X-Admin-Token: <admin.token>
```

The token is `admin.token` from `jeebhar.config.json`. The comparison is constant-time. A missing token is **401**, a wrong one **403** (10 wrong attempts per 15 minutes per IP, then **429**).

The previous content is kept as `content.previous.json` (one-step undo).

**Validation** (`api/src/ContentValidator.php` — the schema is declared there as data). For translatable fields, English is required where marked; German is always optional.

| Field               | Rule                                                                          |
| ------------------- | ----------------------------------------------------------------------------- |
| `brandName`         | 1–80 chars                                                                    |
| `heroEyebrow`       | text, ≤160 chars, optional                                                    |
| `heroHeading`       | text, ≤300 chars, English required                                            |
| `heroSubheading`    | text, ≤600 chars, English required                                            |
| `mediaKitUrl`       | image/file reference (below), defaults to `/brand/media-kit.pdf`              |
| `services[]`        | ≤24; `title` ≤120, `shortDescription` ≤300, `longDescription` ≤3000 (text)    |
| `work[]`            | ≤60; `imageUrl` is an image reference (below); `description` ≤600             |
| `reels[]`           | ≤60; `instagramUrl` must be a valid URL; `thumbnailUrl` optional              |
| `travelReels[]`     | ≤60; identical rules to `reels[]`                                             |
| `mediaKitMetrics[]` | ≤12; `label` ≤120, `value` ≤40                                                |
| `contact`           | `address`, `email`, `phone` required; social URLs must be a valid URL or `""` |

**Image references.** `work[].imageUrl` and `reels[].thumbnailUrl` accept either an
absolute `http(s)://` URL or a root-relative path beginning with `/` (for example an
upload, `/uploads/photo-1a2b.jpg`). Anything else (e.g. `work/photo.jpg`) is rejected.

`thumbnailUrl` is optional and defaults to `""`. Instagram does not expose reel
covers to third parties, so a blank cover is a normal state — the frontend renders a
branded tile for it.

Unknown keys are stripped rather than rejected. List items without an `_id` get one. A bare string where `{ en, de }` is expected is accepted as English.

```bash
curl -X PUT https://jeebhar.com/api/content \
  -H "X-Admin-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d @content.json
```

---

## `POST /api/contact`

Public and throttled to **5 requests per 15 minutes per IP** (`rateLimit.contactPer15Min`), because it writes to disk and sends mail.

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
  "message": "Thanks — your enquiry has been received.",
  "data": { "id": "20261103-164923-e8158c", "notified": true }
}
```

The enquiry is appended to `~/jeebhar-data/enquiries.jsonl` **first**, then emailed to `mail.to` with every detail the visitor entered (plus time, domain and IP). `Reply-To` is the visitor, so replying in Gmail answers them directly.

`notified` reports whether the email left. **A `false` still means the enquiry was stored** — a mail outage never loses a lead. The reason is written to the PHP error log.

---

## `POST /api/upload`

**Requires the admin token.** `multipart/form-data` with one field, `file`.

Allowed: JPG, PNG, WebP, GIF, PDF, Word (`.doc`, `.docx`) — detected from the file's bytes,
not its name. Max `uploads.maxMegabytes` (default 10). Stored as
`public_html/uploads/<name>-<random>.<ext>`.

```json
{ "ok": true, "message": "File uploaded.", "data": { "url": "/uploads/dosa-1a2b3c4d.jpg" } }
```

---

## Rate limits

| Scope               | Limit                | Config                      |
| ------------------- | -------------------- | --------------------------- |
| `POST /api/contact` | 5 per 15 min per IP  | `rateLimit.contactPer15Min` |
| Wrong admin token   | 10 per 15 min per IP | —                           |

Stored as small files in `~/jeebhar-data/ratelimit/`, keyed by a hash of the IP.

---

## CORS

The site and the API share a domain on Bluehost, so CORS is not needed in production. Allowed
origins (for local development and the three domains) are generated from `domains.sites` in
`jeebhar.config.json`.
