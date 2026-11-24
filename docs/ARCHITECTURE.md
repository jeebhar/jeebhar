# Architecture

The rule for the whole codebase: **each layer knows only the layer directly beneath it, and every layer is replaceable without touching the ones above it.**

If you are about to add code and cannot say which layer it belongs to, that is the signal to stop and re-read this page.

---

## 1. Backend — a small PHP API for shared hosting

Bluehost shared hosting runs Apache + PHP, not Node or MongoDB, so the API is plain
PHP 8.1 with no Composer packages. Same idea as before — each piece knows only the one
beneath it — with fewer layers because there is less to do.

```
api/.htaccess        every /api/* request → index.php
    │
    ▼
api/index.php        the router: one switch, one line per endpoint. Reads config,
    │                checks the admin token, calls ONE class, writes the response.
    ▼
api/src/
  ContentValidator   the content schema, declared as data, + one recursive validator
  ContentRepository  the only code that touches content.json
  ContactService     validate → store → email (the order is the business rule)
  Mailer             SMTP (built in) or PHP mail(), chosen by config
  UploadService      checks the bytes, generates the name, stores in /uploads
  RateLimiter        file-based fixed window
  Request/Response   the HTTP edge: parsing, auth headers, the { ok, data } envelope
  Config             read-only view of the generated api/config.php
```

### Why these choices

**A JSON file instead of a database.** The whole site is one document edited by one person.
Writes go to a temp file and are renamed into place (atomic), and the previous version is
kept for a one-step undo. Data lives in `~/jeebhar-data`, outside the web root.

**The schema is data.** `ContentValidator::schema()` lists every field once with its type
(`string`, `text` = `{ en, de }`, `url`, `ref`, `email`, `list`, `object`). Validation on
save and normalisation on read both come from that one list, so a new field is one line —
and old content missing that field is completed on read with no migration.

**Store, then email.** `ContactService` appends the enquiry to `enquiries.jsonl` before it
sends mail. A broken mail server must never lose a lead.

**One config file.** `jeebhar.config.json` is the only source of settings. The build turns
it into `api/config.php` (secrets; a `.php` file so it executes rather than prints if the
server were misconfigured) and into the frontend's public `VITE_*` values.

**Same envelope as before.** `{ ok, data, message }` / `{ ok:false, message, details }`,
so the React client did not change when the backend moved from Node to PHP.

---

## 2. Frontend — the same layering, in React terms

```
pages/                    composition only. HomePage lists sections in order.
    │
    ▼
components/sections/      one section per file. Props in, JSX out.
components/ui/            primitives: Button, Card, Carousel, Logo, TextField…
    │
    ▼
features/*/hooks/         the controllers: state, async orchestration, validation
    │
    ▼
features/*/api/           typed endpoint functions
    │
    ▼
services/http-client.ts   the only place that calls fetch
    │
    ▼
models/                   types shared by every layer above
```

### What this replaced

The previous `App.tsx` was 513 lines holding content fetching, form state, form validation, two near-identical carousels, the whole public content editor, and every element of markup on the page. One file was responsible for everything, so nothing in it could be tested or reused in isolation.

Now:

| Concern                       | Lives in                                                 |
| ----------------------------- | -------------------------------------------------------- |
| Loading content               | `features/content/hooks/use-site-content.ts`             |
| Choosing the language         | `i18n/languages.ts` (pure) + `i18n/I18nProvider.tsx`     |
| Interface text, EN + DE       | `i18n/messages.ts`                                       |
| Content → one language        | `features/content/localize.ts` (pure)                    |
| Contact form state            | `features/contact/hooks/use-contact-form.ts`             |
| Contact validation rules      | `features/contact/contact.validator.ts` (pure functions) |
| Editor draft state            | `features/content/hooks/use-content-editor.ts`           |
| HTTP, timeouts, error mapping | `services/http-client.ts`                                |
| Each page section             | `components/sections/*.tsx`                              |
| Route choice                  | `app/App.tsx` (~60 lines)                                |

`contact.validator.ts` has no React import, so its 15 test cases run in milliseconds. That is the payoff of separating rules from rendering.

### Duplication that layering removed

- **Two carousels → one `<Carousel>`.** Work and Reels were near-identical blocks with their own refs and scroll handlers. `Carousel` is generic over its item type; each section supplies `keyOf` and `renderItem`.
- **Two editor tables → one `<EditableRowList>`.** Fields are described as data, so adding a field is one array entry.
- **Repeated input markup → `<TextField>`.** Label association, `aria-invalid`, `aria-describedby` and error styling are implemented once and therefore correct everywhere.
- **Nav declared three times → `config/navigation.ts`.** Desktop nav, mobile nav and scroll targets all read one list.
- **Two reel sections → one `<ReelsSection>`.** "Our Reels" and "Travel Reels" differ only in id, copy, badge and which collection they read, so they are two usages of one parameterised component rather than two files that drift apart.
- **Three editor tables → one `<EditableRowList>` + one `useEditableList`.** Work, food reels and travel reels each arrive as an `EditableList` handle. A fourth collection is one line in `useContentEditor` and one `<EditableRowList>`, not another four callbacks on the hook's public interface.
- **Every cover → `<MediaCover>`.** Work photos and reel covers share one component, so the lazy-load, fade-in and fallback behaviour is implemented and tested once.

### Things that must stay in exactly one place

| Concern                                        | The one place                                     |
| ---------------------------------------------- | ------------------------------------------------- |
| `fetch`, timeouts, the API envelope            | `services/http-client.ts`                         |
| `import.meta.env`                              | `config/app.config.ts`                            |
| Interface copy, both languages                 | `i18n/messages.ts`                                |
| Settings and secrets                           | `jeebhar.config.json` (repository root)           |
| Section list and order                         | `config/navigation.ts`                            |
| Brand colours                                  | `tailwind.config.ts`                              |
| Logo artwork paths                             | `config/app.config.ts` + `components/ui/Logo.tsx` |
| Turning an unknown error into user-facing copy | `utils/error.ts`                                  |

---

## 3. Accessibility, treated as architecture

These are structural choices, not a polish pass, and `eslint-plugin-jsx-a11y` fails CI on regressions.

- **Services are a real accordion.** Cards were previously `<button>` elements containing further content; each is now a `<button>` with `aria-expanded`/`aria-controls` and a separate `role="region"` panel.
- **Every field has a label.** `TextField` generates an id with `useId()` and links errors through `aria-describedby` with `role="alert"`.
- **Focus is always visible.** A global `:focus-visible` outline plus per-component focus rings.
- **Skip link.** First focusable element on the page jumps to `#main`.
- **Motion is opt-out.** `scrollToSection` checks `prefers-reduced-motion`, and the stylesheet neutralises animation for the same users.
- **Carousel arrows are labelled** and reachable by keyboard.
- **Layout does not shift.** `Logo` sets explicit width and height from the artwork's intrinsic ratio, and `MediaCover` reserves its aspect ratio.
- **One broken section cannot blank the page.** Each section on the homepage sits in an `ErrorBoundary`. React unmounts the whole tree when a render throws, so without this a single unexpected value produced a white screen with nothing but a console error.

---

## 4. Testing strategy

| Layer        | Tests                                                                  | Needs                   |
| ------------ | ---------------------------------------------------------------------- | ----------------------- |
| API rules    | `api/tests/run.php` — schema, translations, refs, ids, completion      | PHP only                |
| Client logic | validator, contact hook, editor hook, http-client, localize, languages | jsdom                   |
| Client views | Header, LanguageToggle, UploadField, MediaCover, Logo, HomePage        | jsdom + Testing Library |

Run everything with `npm test`. CI also runs the API checks on PHP 8.1, the oldest
version the code supports.

---

## 5. Translations

Two kinds of text, kept apart on purpose:

- **Interface text** (menu, buttons, form labels, errors) lives in `client/src/i18n/messages.ts`.
  The German dictionary is typed against the English one, so a missing translation fails the build.
- **Content** (hero, services, work, reels, numbers) is written by the owner in the editor and
  stored as `{ en, de }`. `App` resolves it to one language with `localizeContent()` **once**,
  so section components receive plain strings and know nothing about languages.

---

## 6. Adding something new

**A new API endpoint**

1. A class in `api/src/` for the logic (constructor takes `Config` and collaborators)
2. One `case 'METHOD /path':` in `api/index.php`
3. A test in `api/tests/run.php`

**A new page section**

1. `components/sections/NewSection.tsx` — props in, JSX out; compose from `components/ui`
2. Add `{ id, labelKey }` to `config/navigation.ts` and the label to both dictionaries in `i18n/messages.ts`
3. Render it in `pages/HomePage.tsx`

If it needs data, add a hook under `features/<name>/hooks/` and an endpoint under `features/<name>/api/`. Do not call `fetch` from a component.

**A new field on the content model**

`api/src/ContentValidator.php` (one line in `schema()`) → `client/src/models/site-content.model.ts` → `features/content/localize.ts` if it is translatable → the editor field in `pages/AdminPage.tsx` → the view that renders it. The compiler will point at every client place that needs attention.
