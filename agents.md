# Agents

## System Information

- **Operating System:** Alpine Linux v3.24
- **Platform:** Linux
- **Package Manager:** apk

## Tech Stack

- **App:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Web Server:** Express (serves static files + API)
- **E2E Testing:** Playwright
- **CI/CD:** GitHub Actions
- **Containerization:** Docker (Alpine-based)

## Web Server

- **Server:** Express (serves static files + API)
- **Port:** 3000
- **Bind:** 0.0.0.0 (accessible from host)
- **Start:** `npm start`
- **Start (daemon):** `nohup npm start > /tmp/app.log 2>&1 &`
- **Stop:** `kill -9 $(pgrep -f "node server")`
- **Restart:** `kill -9 $(pgrep -f "node server"); sleep 1; nohup npm start > /tmp/app.log 2>&1 &`
- **Verify:** `wget -q -O - http://127.0.0.1:3000/`
- **Access:** `http://localhost:3000` from Windows host

## E2E Testing

- **Framework:** Playwright
- **Run:** `CHROMIUM_PATH=/usr/bin/chromium-browser npm test`
- **Browser:** System Chromium (`/usr/bin/chromium-browser`)
- **Server:** Express (auto-started by Playwright on port 3000)
- **Install deps:** `apk add chromium` (required on Alpine)
- **Config:** `playwright.config.js` — uses `CHROMIUM_PATH` env var for Alpine compatibility
- **Tests:** `tests/tasks.spec.js`

## CI/CD

- **Platform:** GitHub Actions
- **Workflow:** `.github/workflows/e2e.yml`
- **Jobs:**
  - **e2e** — Runs on push/PR to `main`. Installs Playwright Chromium, runs tests, uploads artifacts.
  - **deploy** — Runs only on push to `main`, depends on `e2e` passing. Deploys static files to GitHub Pages.

## Git

- **Commit Convention:** [Conventional Commits](https://www.conventionalcommits.org/)
- **Format:** `type(scope): description`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`

## API Server (Express)

- **File:** `server.js`
- **Port:** 3000
- **Dependencies:** `express`, `pg`
- **Start:** `node server.js` or `npm start`
- **Start (daemon):** `nohup npm start > /tmp/express.log 2>&1 &`
- **Stop:** `kill -9 $(pgrep -f "node server")`
- **Restart:** `kill -9 $(pgrep -f "node server"); sleep 1; nohup npm start > /tmp/express.log 2>&1 &`
- **Endpoints:** `GET/POST /api/tasks`, `GET/PUT/DELETE /api/tasks/:id`
- **DB connection:** `db.js` (pool)

## Database (PostgreSQL)

- **Host:** postgres
- **Port:** 5432
- **User:** postgres
- **Password:** root
- **Docker Network:** my-network
- **Connect:** `PGPASSWORD=root psql -h postgres -p 5432 -U postgres -d postgres`
- **Version:** PostgreSQL 18.4 (Debian)

## Figma Integration

-   **API:** Direct REST API (`api.figma.com`)
-   **Authentication:** Personal Access Token (`X-Figma-Token` header)
-   **Usage:** Fetching design tokens, styles, and layout information from Figma files to apply to the web application.
