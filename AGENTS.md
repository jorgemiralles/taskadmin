# AGENTS.md

## Project

Vanilla JS/HTML/CSS single-page task management app. No build step, no runtime dependencies, no server backend.

## Commands

- **Serve locally**: `python3 -m http.server 8080` (or any static file server)
- **Run e2e tests**: `npm run test:e2e` (Playwright, Chromium; auto-starts server via `scripts/serve.js`)
- Specs are Gherkin `.feature` files in `specs/start/` (not runnable)
- **No lint or typecheck** configured; CI runs e2e on push/PR via GitHub Actions (`.github/workflows/e2e.yml`)

## Key facts

- All data persisted in `localStorage` under key `tasks`
- Task IDs generated via `crypto.randomUUID()`
- Entry point: `index.html` (loads `app.js`, `styles.css`)
- XSS prevention: `escapeHtml()` in `app.js:33` (DOM textContent → innerHTML trick)
- `opencode.json` requires user approval for all `bash` commands
- Four commits in git history; one branch (`feature/playwright-e2e`), remote `origin` configured, no tags
- E2e specs live in `tests/`; `playwright.config.js` targets Chromium with `baseURL http://localhost:8080`
