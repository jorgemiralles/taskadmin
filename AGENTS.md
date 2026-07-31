# AGENTS.md

## Project

Vanilla JS/HTML/CSS single-page task management app. No build step, no dependencies, no server.

## Commands

- **Serve locally**: `python3 -m http.server 8080` (or any static file server)
- **Run e2e tests**: `npm run test:e2e` (Playwright, Chromium; auto-starts server via `scripts/serve.js`)
- Specs are Gherkin `.feature` files in `specs/start/` (not runnable)
- **No lint, typecheck, or CI** configured

## Key facts

- All data persisted in `localStorage` under key `tasks`
- Task IDs generated via `crypto.randomUUID()`
- Entry point: `index.html` (loads `app.js`, `styles.css`)
- XSS prevention: `escapeHtml()` in `app.js:33` (DOM textContent → innerHTML trick)
- `opencode.json` requires user approval for all `bash` commands
- Two commits in git history; no branches, tags, or remote configured
- E2e specs live in `tests/`; `playwright.config.js` targets Chromium with `baseURL http://localhost:8080`
