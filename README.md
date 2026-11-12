# Career Command Center

A focused workspace for content design and UX design job searches: track roles on a kanban board, score them against your profile, tailor resume bullets, and draft outreach.

## What's in this repository

| Path | What it is |
| --- | --- |
| `src/`, `base44/`, config files | The Base44 app source (React, Tailwind, shadcn). See `SETUP.md` for how to run it. |
| `claude-artifact/career-command-center.html` | A single-file rebuild of the same app that runs as a Claude artifact. |
| `docs/index.html` | A public demo of the app with sample data, served by GitHub Pages. |

## Running each version

**Base44 app.** It needs a Base44 backend for sign-in, saved data, functions and the Career Coach agent. Follow `SETUP.md`.

**Claude artifact.** The HTML file is the page source for an artifact published on claude.ai. It relies on Claude for saved data, scoring and the Career Coach, so it does not work when opened on its own or hosted on GitHub Pages. It holds no personal data: roles, profile and chats live in the artifact's private database, not in this file.

**Public demo.** `docs/index.html` is a standalone copy for GitHub Pages: https://gmt9126-beep.github.io/career-command-center/. It uses a fictional candidate and made-up roles, saves changes only in the visitor's browser, and has the AI features (scoring, Career Coach, outreach drafting, live role search) switched off. In the repository settings, Pages must be set to the `main` branch and the `/docs` folder.
