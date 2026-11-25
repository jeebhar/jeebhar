# Deployment — Bluehost

The site runs on Bluehost **shared hosting** (Starter plan, Frankfurt data centre).
Bluehost serves the files with Apache + PHP; there is no Node, no database and no
Docker on the server.

```
~/                                  your Bluehost home directory
├── public_html/                    ← npm run deploy:bluehost writes here
│   ├── index.html, assets/, brand/ the React site
│   ├── .htaccess                   HTTPS, www → apex, SPA routing, caching
│   ├── api/                        PHP API (+ generated config.php)
│   └── uploads/                    files added in the content editor
└── jeebhar-data/                   created by the API on first write — NOT public
    ├── content.json                the live site content
    ├── content.previous.json       the version before the last save (one-step undo)
    ├── enquiries.jsonl             every contact-form enquiry, one per line
    └── ratelimit/
```

A deploy only adds and replaces files in `public_html`. It never touches
`public_html/uploads` or `~/jeebhar-data`, so content and enquiries survive every deploy.

---

## One-time setup

### 1. The config file

```bash
cp jeebhar.config.example.json jeebhar.config.json
```

Fill in, at minimum:

| Key                | Value                                                                |
| ------------------ | -------------------------------------------------------------------- |
| `bluehost.sshUser` | your cPanel username (Bluehost → Websites → Settings → SSH Access)   |
| `admin.token`      | a long random string — the editor password                           |
| `mail.to`          | where enquiries go, e.g. `jeebhar410@gmail.com`                      |
| `mail.smtp.pass`   | a Gmail **App Password** (Google Account → Security → App passwords) |

Generate a token: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"`

### 2. PHP version

Bluehost → Websites → Settings → PHP version: **8.1 or newer** (8.3 recommended).

### 3. SSH access

Bluehost → Websites → Settings → **SSH Access** → enable. Then either add your
public key (`ssh-keygen -t ed25519`, paste `~/.ssh/id_ed25519.pub` into "Manage SSH Keys"
and authorise it) or type your cPanel password when prompted. Check:

```bash
ssh <sshUser>@50.6.35.167
```

`ssh`, `scp` and `tar` are built into Windows 10/11, so `npm run deploy:bluehost` works
from PowerShell.

### 4. The three domains

jeebhar.com is the primary domain on the account. Add the other two as **alias**
(formerly "parked") domains of jeebhar.com, so all three serve the same `public_html`:

Bluehost → Domains → jeebhar.de → **Assign** / "Add as alias of jeebhar.com"
(repeat for jeebhar.in). In cPanel this is _Domains → Create a New Domain_, with
"Share document root with jeebhar.com" ticked.

If a domain was bought elsewhere, point its nameservers to `ns1.bluehost.com` and
`ns2.bluehost.com` first.

Which language each domain opens in is set in `domains.sites` in the config —
`jeebhar.de` opens in Deutsch, the others in English. The toggle overrides it.

### 5. SSL

Bluehost issues free certificates (AutoSSL / Let's Encrypt) for each domain
automatically, usually within a few hours of the domain being added. Check under
Websites → Security → SSL. The site's `.htaccess` redirects every request to `https://`,
so **wait until each domain shows an active certificate before going live on it**.

---

## Deploy

```bash
npm run release        # build:bluehost, then deploy:bluehost
```

or in two steps:

```bash
npm run build:bluehost     # → dist-bluehost/
npm run deploy:bluehost    # tar → scp → unpack into ~/public_html
```

Then check `https://jeebhar.com/api/health` → `{"ok":true,…}`.

### Without SSH (File Manager or FTP)

1. `npm run build:bluehost`
2. Zip the **contents** of `dist-bluehost/` (not the folder itself). Include the hidden
   `.htaccess` files.
3. Bluehost → Files → File Manager → `public_html` → Upload the zip → Extract.

---

## After going live

**Edit content:** `https://jeebhar.com/#/admin`, enter `admin.token`, edit, **Save changes**.
The first save creates `~/jeebhar-data/content.json`; until then the site shows
`api/seed/default-content.json`.

**Change a setting** (email address, token, domains): edit `jeebhar.config.json`, run
`npm run release`. Nothing else holds settings.

**Read enquiries if an email went missing:** every enquiry is saved before it is emailed.
File Manager → `jeebhar-data/enquiries.jsonl`.

**Undo the last content save:** in File Manager, copy `content.previous.json` over
`content.json`.

**Back up:** download `~/jeebhar-data/` and `public_html/uploads/`.

---

## Search engines (once, after the first deploy)

1. Check what Google will see: open `https://jeebhar.de/` with **View page source** — the
   German `<title>`, `hreflang` links and the page text should be in the HTML.
2. [Google Search Console](https://search.google.com/search-console): add each domain as a
   **Domain property** (verified with a DNS TXT record in Bluehost's DNS zone editor), then
   **Sitemaps** → submit `sitemap.xml`. Repeat for jeebhar.de, jeebhar.in and jeebhar.com.
3. [Bing Webmaster Tools](https://www.bing.com/webmasters): **Import from Google Search
   Console** once the domains are verified there.
4. Test structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results)
   on `https://jeebhar.com/`.

## Troubleshooting

| Symptom                                           | Likely cause and fix                                                                                                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 500 error on every page                           | PHP older than 8.1 → raise it (step 2). Or a `.htaccess` edited by hand → redeploy.                                                                                                    |
| Site loads, "Cannot reach the server"             | `public_html/api` missing → redeploy and include hidden files.                                                                                                                         |
| Editor says "Admin editing is disabled"           | `admin.token` empty or shorter than 16 characters.                                                                                                                                     |
| Enquiry succeeds but no email                     | Wrong `mail.smtp.pass` (must be a Gmail App Password), or Gmail blocked it. Try `"transport": "mail"` with `"from": "website@jeebhar.com"`. The enquiry is still in `enquiries.jsonl`. |
| Upload fails with "larger than the server allows" | Raise `upload_max_filesize` in `api/.user.ini` (default 16 MB) and `uploads.maxMegabytes`.                                                                                             |
| jeebhar.de shows a certificate warning            | AutoSSL hasn't issued that certificate yet — wait, or run it manually under SSL.                                                                                                       |

## CI

`.github/workflows/ci.yml` checks the PHP API (on PHP 8.1, the oldest supported version),
lints, typechecks and tests the client, and builds the Bluehost bundle with a throwaway
config. Deploys run from your machine with `npm run release`, so your real config and
SSH key never leave it.
