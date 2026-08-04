# AGENTS.md

## Project

Vanilla JS/HTML/CSS single-page task management app. No build step, no runtime dependencies, no server backend.

## Commands

- **Serve locally**: `python3 -m http.server 8080` (or any static file server)
- **Run e2e tests**: `npm run test:e2e` (Playwright, Chromium; auto-starts server via `scripts/serve.js`)
- Specs are Gherkin `.feature` files in `specs/start/` (not runnable)
- **No lint or typecheck** configured; CI runs e2e on push/PR and deploys to GitHub Pages when tests pass (`.github/workflows/ci.yml`)

## Key facts

- All data persisted in `localStorage` under key `tasks`
- Task IDs generated via `newId()` (`crypto.randomUUID()` with a fallback for non-secure contexts)
- Entry point: `index.html` (loads `app.js`, `styles.css`)
- XSS prevention: `escapeHtml()` in `app.js:36` (DOM textContent → innerHTML trick); `escapeAttr()` adds quote escaping for attribute context
- `opencode.json` sets `"permission": "allow"` (commands auto-approved)
- Git workflow: feature branches off `main`; remote `origin` configured; CI deploys to GitHub Pages from `main`
- E2e specs live in `tests/`; `playwright.config.js` targets Chromium with `baseURL http://localhost:8080`

## Figma API

- Personal access token stored as env var; `figd_` tokens must be sent via the `X-Figma-Token` header, **not** `Authorization: Bearer`
- User associated with token: Jorge (jorgemiralles@gmail.com)
- Base URL: `https://api.figma.com/v1`
