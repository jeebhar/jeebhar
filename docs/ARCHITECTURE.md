# Architecture

The rule for the whole codebase: **each layer knows only the layer directly beneath it, and every layer is replaceable without touching the ones above it.**

If you are about to add code and cannot say which layer it belongs to, that is the signal to stop and re-read this page.

---

## 1. Backend — MVC with an explicit service and repository layer

```
HTTP request
    │
    ▼
routes/           the pipeline: throttle → authenticate → validate
    │             Knows nothing except which middleware runs in which order.
    ▼
controllers/      translation only: read req.validated, call one service method,
    │             shape the response. No branching on business rules.
    ▼
services/         the business rules. Pure application logic — no req, no res,
    │             no Mongoose. Receives collaborators through the constructor.
    ▼
repositories/     the only code that touches a collection.
    │
    ▼
models/           schema, types and invariants. No behaviour beyond validation.
```

### Why each boundary exists

**`routes` → `controllers`.** Middleware guarantees preconditions. By the time a controller runs, the caller is authenticated and `req.validated` conforms to the schema — so controllers contain no defensive checks, which is what keeps them 15 lines instead of 60.

**`controllers` → `services`.** Controllers are the only HTTP-aware code. Because `ContactService` never sees a request object, its tests construct it directly and pass a plain object.

**`services` → `repositories`.** Services state _what_ must happen; repositories know _where_ data lives. Swapping MongoDB for Postgres means rewriting two files in `repositories/` and nothing else.

**Configuration.** `config/env.js` is the only module that reads `process.env`, and it validates at boot via `assertEnv()`. A missing `ADMIN_TOKEN` crashes on startup with a clear message rather than 500-ing on the first write six hours later.

**Response shape is a guarantee, not a reflection of the database.** Mongoose applies schema defaults when a document is _created_, not when an existing one is read, so a document written before a field existed comes back without it. `ContentService.complete()` fills those in on every read and write, which means adding a content field never needs a database migration — and a missing collection can never reach the frontend as `undefined`. This is the fix for a real failure: adding `travelReels` blanked the entire site for anyone whose database already held a document.

**Errors.** Services and controllers throw; `middleware/error.middleware.js` is the only code that turns an error into a response. It maps Mongoose `ValidationError`, `CastError`, duplicate keys, oversized payloads and malformed JSON onto the same envelope, and redacts unexpected 5xx detail in production.

### Worked example: `POST /api/contact`

```
contact.routes.js
  contactLimiter                    5 per 15 min per IP — this endpoint writes and sends mail
  validateBody(contactSubmissionSchema)
                                    normalises (email lowercased, fields trimmed),
                                    strips unknown keys, or throws 400 with per-field detail
  contactController.submit

contact.controller.js
  service.submit(req.validated, { sourceIp: req.ip })
  201 { ok: true, message, data: { id, notified } }

contact.service.js
  repository.create(...)            persist first — this is the promise to the visitor
  mailer.send(...)                  best-effort; a thrown SMTP error is logged, not propagated
  repository.markNotified(id)       only when delivery actually succeeded
```

The ordering is a deliberate business rule and it is asserted by a test: _a broken mail server must not lose an enquiry._

### Dependency inversion in practice

```js
export class ContactService {
  constructor(repository = contactSubmissionRepository, mailer = createMailer()) {
    this.repository = repository;
    this.mailer = mailer;
  }
}
```

Defaults keep production wiring trivial (`new ContactService()`); the parameters make the unit tests need no database and no SMTP server. `createMailer()` returns `SmtpMailer` when SMTP is configured and `NoopMailer` when it is not — same interface, so nothing downstream branches on it.

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

| Layer                | Tests                                                                          | Needs                                                               |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Server services      | `tests/contact.service.test.js`, `content.service.test.js`                     | nothing — collaborators are injected                                |
| Server validators    | `tests/validators.test.js`                                                     | nothing                                                             |
| Server HTTP pipeline | `tests/http-pipeline.test.js` — auth, validation, 404, headers                 | nothing; these run before any DB access                             |
| Server integration   | `tests/api.test.js` — full request/response                                    | in-memory MongoDB; **skips cleanly** when the binary is unavailable |
| Client logic         | `contact.validator.test.ts`, `use-contact-form.test.ts`, `http-client.test.ts` | jsdom                                                               |
| Client views         | `Logo.test.tsx`                                                                | jsdom + Testing Library                                             |

The split is deliberate: `http-pipeline.test.js` covers the security-relevant behaviour (401 vs 403 vs 400, middleware order) with no infrastructure, so it runs everywhere including an offline runner. `api.test.js` adds full persistence coverage where a database is available.

---

## 5. Adding something new

**A new API resource**

1. `models/thing.model.js` — schema
2. `repositories/thing.repository.js` — data access
3. `services/thing.service.js` — rules, collaborators as constructor parameters
4. `validators/thing.validator.js` — Zod schema
5. `controllers/thing.controller.js` — thin adapter
6. `routes/thing.routes.js` — pipeline, then one line in `routes/index.js`
7. `tests/thing.service.test.js` — with a fake repository

**A new page section**

1. `components/sections/NewSection.tsx` — props in, JSX out; compose from `components/ui`
2. Add `{ id, label }` to `config/navigation.ts`
3. Render it in `pages/HomePage.tsx`

If it needs data, add a hook under `features/<name>/hooks/` and an endpoint under `features/<name>/api/`. Do not call `fetch` from a component.

**A new field on the content model**

`server/src/models/site-content.model.js` → `server/src/validators/content.validator.js` → `client/src/models/site-content.model.ts` → the view that renders it. The compiler will point at every place that needs attention.
