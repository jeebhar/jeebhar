# Jeebhar

Marketing site for **Jeebhar**, a social media agency for restaurants and food brands.
One site on **jeebhar.com**, **jeebhar.de** and **jeebhar.in**, in **English and Deutsch**.

React + TypeScript single-page app, a small PHP API, hosted on **Bluehost** shared hosting.
No database and no Node on the server: content is one JSON file, and every setting
lives in **one config file**.

---

## Quick start

```bash
npm run install:all
cp jeebhar.config.example.json jeebhar.config.json   # Windows: copy …
#   fill in admin.token, mail.*, bluehost.sshUser — see the comments in the file
npm run dev                                           # needs PHP 8.1+ on your PATH
```

| Surface        | URL                              |
| -------------- | -------------------------------- |
| Website        | http://localhost:5173            |
| Content editor | http://localhost:5173/#/admin    |
| API            | http://localhost:5000/api/health |

No PHP locally? `npm run dev:client` runs the site alone, and you can test the API on Bluehost
itself. On Windows, `winget install PHP.PHP.8.3` installs PHP.

## Go live

```bash
npm run release          # = build:bluehost + deploy:bluehost
```

Step-by-step first-time setup (SSH, the three domains, SSL, email) is in
[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

---

## The one config file

`jeebhar.config.json` (git-ignored; template: `jeebhar.config.example.json`) is the
**only** place for settings and secrets. The build turns it into everything else.

| Section     | What it controls                                                     |
| ----------- | -------------------------------------------------------------------- |
| `bluehost`  | SSH host/user for deploys, web root, where data is kept              |
| `domains`   | the three domains and which language each opens in (`.de` → Deutsch) |
| `admin`     | the password (token) for the content editor                          |
| `mail`      | where contact-form enquiries are emailed; SMTP or Bluehost's mailer  |
| `uploads`   | max upload size                                                      |
| `rateLimit` | contact-form submissions allowed per IP per 15 minutes               |

```
jeebhar.config.json ──► npm run build:bluehost ──► dist-bluehost/  (= public_html)
                            ├─ api/config.php          server secrets (PHP, never served)
                            ├─ VITE_* env              public values baked into the frontend
                            └─ .htaccess               HTTPS, www → apex, SPA routing
```

---

## What's on the page

| Section                  | Edited in `/#/admin` as        | Notes                                                       |
| ------------------------ | ------------------------------ | ----------------------------------------------------------- |
| Hero (first screen)      | Top of the page                | The pitch to restaurants, with a call to action             |
| Our Services             | Our Services                   | Tiles; click one to expand the long text                    |
| Our Experience           | Media kit numbers              | Reach, followers, interactions… from the media kit          |
| Our Work                 | Our Work                       | Photo cards, → arrow for more; **Upload…** for photos       |
| Our Reels / Travel Reels | Reels                          | Cover photo opens the Instagram reel in a new tab           |
| Contact Us               | —                              | Name, email, phone, subject, message → emailed to you       |
| Footer                   | Contact details & social links | Address, email, phone, Facebook, YouTube, Instagram, TikTok |
| Media Kit (menu)         | Media kit                      | PDF or Word file, opens in a new tab                        |

Default photos (hero, reel covers, Our Work) are free [Unsplash](https://unsplash.com) photos loaded from `images.unsplash.com`. Replace any of them with **Upload…** in the editor.

Every text field has an **English** and a **Deutsch** box. Leave German empty and the German
page shows the English text, so you can translate gradually. Interface text (menu, buttons,
form labels) is in [`client/src/i18n/messages.ts`](client/src/i18n/messages.ts).

**Regions:** every work card and reel has a **Shown for** setting in the editor: Everywhere,
Europe or India. jeebhar.de shows Europe first, jeebhar.in India, jeebhar.com everything;
visitors switch with **All | Europe | India** in the header. Each domain is also served to
search engines with its own region's work.

**Which language a visitor sees first:** their earlier choice from the EN | DE toggle, then the
domain (`jeebhar.de` → Deutsch), then their browser language, then English.

---

## SEO

Every page is served by `index.php`, which fills the built `index.html` with what search
engines and link previews need (`api/src/PageRenderer.php`):

| Added on the server                    | Why                                                               |
| -------------------------------------- | ----------------------------------------------------------------- |
| `<html lang>`, `<title>`, description  | In the domain's language: jeebhar.de German, .com and .in English |
| canonical + `hreflang` (de, en-IN, en) | The three domains are one site in three versions, not duplicates  |
| Open Graph / Twitter tags              | Proper previews on WhatsApp, LinkedIn, Facebook, X                |
| JSON-LD (`ProfessionalService`)        | Business, areas served, services and social profiles for Google   |
| Plain-HTML copy of the page in `#root` | Crawlers that don't run JavaScript still read every heading       |
| `/robots.txt`, `/sitemap.xml`          | Generated per domain                                              |

The title and description are edited under **Search engines (Google)** in `/#/admin`.

```
jeebhar/
├── jeebhar.config.example.json   template for THE config file
├── api/                          PHP 8.1+ API (no Composer, no database)
│   ├── index.php                 front controller: one switch, five routes
│   ├── src/                      one class per responsibility
│   │   ├── ContentValidator.php  content schema as data + validation
│   │   ├── ContentRepository.php content.json, atomic writes, one-step undo
│   │   ├── ContactService.php    validate → store → email
│   │   ├── Mailer.php            SMTP (built in) or PHP mail()
│   │   ├── UploadService.php     images / PDF / Word → /uploads
│   │   └── RateLimiter.php, Request.php, Response.php, Config.php
│   ├── seed/default-content.json first content, both languages
│   └── tests/run.php             dependency-free tests
├── client/                       React + TypeScript + Tailwind
│   └── src/
│       ├── i18n/                 EN/DE dictionary, language detection, provider
│       ├── features/content/     load, localize, edit content
│       ├── features/contact/     form state + validation
│       ├── components/           layout, sections, ui, admin
│       └── pages/                HomePage, AdminPage
├── deploy/                       .htaccess templates
├── scripts/                      build-bluehost, deploy-bluehost, dev-api
└── docs/                         ARCHITECTURE, API, DEPLOYMENT, BRAND
```

## Commands

| Command                   | What it does                                        |
| ------------------------- | --------------------------------------------------- |
| `npm run dev`             | PHP API + Vite together                             |
| `npm run build:bluehost`  | build `dist-bluehost/`, a mirror of `public_html`   |
| `npm run deploy:bluehost` | upload `dist-bluehost/` over SSH                    |
| `npm run release`         | both of the above                                   |
| `npm test`                | API tests (PHP) + client tests (Vitest)             |
| `npm run verify`          | lint, format, typecheck, tests, build — the CI gate |

---

## API

| Method | Path           | Auth        | Purpose                                  |
| ------ | -------------- | ----------- | ---------------------------------------- |
| `GET`  | `/api/health`  | —           | liveness                                 |
| `GET`  | `/api/content` | —           | site content, both languages             |
| `PUT`  | `/api/content` | admin token | replace site content                     |
| `POST` | `/api/contact` | —           | enquiry → stored, then emailed (5/15min) |
| `POST` | `/api/upload`  | admin token | image / PDF / Word upload                |

Full reference: [`docs/API.md`](docs/API.md). Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Security

- **Editor writes need the admin token**, compared in constant time; wrong guesses are rate
  limited. The token is typed in per session and never stored in the browser or the build.
- **Data lives outside the web root** (`~/jeebhar-data`): content, enquiries, rate-limit files.
- **Uploads can't run as code**: type detected from the bytes, name generated, PHP switched off
  in `/uploads`.
- **Secrets never reach git**: only `jeebhar.config.json` holds them and it is git-ignored.
  `api/config.php` is generated and also ignored.

> The old `server/.env` held a real Gmail app password and admin token. They are no longer
> used by this code. If that file was ever committed or shared, rotate both.

## License

Proprietary — © Jeebhar. All rights reserved.
