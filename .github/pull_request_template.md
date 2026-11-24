## What changed

<!-- One or two sentences. What does this do that the codebase did not do before? -->

## Why

<!-- The problem being solved, or a link to the issue. -->

## How to verify

<!-- Steps a reviewer can follow. Include the URL or endpoint if relevant. -->

1.
2.

## Checklist

- [ ] `npm run verify` passes locally (lint, format, typecheck, tests, build)
- [ ] New logic sits in the right layer (controller → service → repository; view → hook → api)
- [ ] No secrets, tokens or real credentials added to tracked files
- [ ] Public API changes are reflected in `docs/API.md`
- [ ] User-facing changes checked at 390px and 1440px wide, and with keyboard only
