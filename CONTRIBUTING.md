# Contributing

## Before you push

```bash
npm run verify
```

That runs the same gate as CI: lint, format check, typecheck, both test suites, production build. If it passes locally, CI will pass.

## Where does my code go

Read [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) first. The short version:

**Backend** — `routes` (pipeline) → `controllers` (HTTP translation) → `services` (rules) → `repositories` (data) → `models` (schema).

**Frontend** — `pages` (composition) → `components` (views) → `features/*/hooks` (state) → `features/*/api` (endpoints) → `services/http-client` (HTTP) → `models` (types).

If you cannot name the layer, do not write the code yet.

## Rules that CI enforces

- **No `fetch` outside `services/http-client.ts`.** Timeouts, the response envelope and error normalisation live there.
- **Settings only in `jeebhar.config.json`.** No `import.meta.env` outside `client/src/config/app.config.ts`; the API reads settings only through `api/src/Config.php`.
- **No business logic in a controller.** If a controller has an `if` about domain state, it belongs in a service.
- **No database calls in a service.** Go through a repository.
- **Services take collaborators as constructor parameters**, with a sensible default. That is what lets the tests run without infrastructure.
- **No raw hex colours.** Use the Tailwind brand tokens.
- **Every form control has a label.** Use `<TextField>`, which handles the label, `aria-invalid` and `aria-describedby` wiring.
- **No secrets in tracked files.** Only `*.example`. The secret-scan job fails the build on a tracked `.env`.

## Adding a page section

1. `client/src/components/sections/NewSection.tsx` — props in, JSX out, composed from `components/ui`
2. Add `{ id, label }` to `client/src/config/navigation.ts`
3. Render it in `client/src/pages/HomePage.tsx`

Needs data? Add a hook under `features/<name>/hooks/` and an endpoint under `features/<name>/api/`.

## Adding an API endpoint

A class in `api/src/` for the logic, one `case` line in `api/index.php`, a test in `api/tests/run.php`. See `docs/ARCHITECTURE.md` §6.

## Tests

- **Rules and pure functions**: always. They are cheap and catch the most.
- **API rules** (validation, translations): `api/tests/run.php` — plain PHP, no framework.
- **Interface text**: add every new string to both dictionaries in `client/src/i18n/messages.ts` — the build fails otherwise.
- **Views**: when there is real logic worth pinning, not for every div.

Run one file while iterating:

```bash
npm --prefix client run test:watch
php api/tests/run.php
```

## Commits and PRs

Conventional-commit style prefixes keep history scannable:

```
feat(client): add testimonials section
fix(api): reject blank subject on contact form
refactor(client): extract Carousel from Work and Reels
docs(api): document the content envelope
chore(ci): pin actions to major versions
```

Fill in the PR template. Include how to verify, and check user-facing changes at 390px and 1440px wide and with the keyboard alone.

## Accessibility

Non-negotiable, and linted:

- keyboard reachable, in a sensible order, with a visible focus ring
- labels on every control; errors linked with `aria-describedby` and `role="alert"`
- decorative images `aria-hidden`; meaningful ones with real `alt` text
- honour `prefers-reduced-motion`
- text contrast at least 4.5:1 — this is why the reversed logo tone exists
