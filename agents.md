# Agents

## System Information

- **Operating System:** Alpine Linux v3.24
- **Platform:** Linux
- **Package Manager:** apk

## Tech Stack

- **App:** Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Web Server:** darkhttpd
- **E2E Testing:** Playwright
- **CI/CD:** GitHub Actions
- **Containerization:** Docker (Alpine-based)

## Web Server

- **Server:** darkhttpd
- **Port:** 8080
- **Bind:** 0.0.0.0 (accessible from host)
- **Install:** `apk add darkhttpd`
- **Run:** `darkhttpd /home/taskadmin --port 8080 --daemon`
- **Access:** `http://localhost:8080` from Windows host

## E2E Testing

- **Framework:** Playwright
- **Run:** `npm test`
- **Browser:** System Chromium (`/usr/bin/chromium-browser`)
- **Server:** darkhttpd (auto-started by Playwright on port 8080)
- **Install deps:** `apk add chromium` (required on Alpine)
- **Config:** `playwright.config.js` — sets `executablePath` for Alpine compatibility
- **Tests:** `tests/tasks.spec.js`

## Git

- **Commit Convention:** [Conventional Commits](https://www.conventionalcommits.org/)
- **Format:** `type(scope): description`
- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`
