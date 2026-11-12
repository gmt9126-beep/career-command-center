# Career Command Center

A focused workspace for content design and UX design job searches: track roles on a kanban board, score them against your profile, tailor resume bullets, and draft outreach.

## What's in this repository

| Path | What it is |
| --- | --- |
| `src/`, `base44/`, config files | The Base44 app source (React, Tailwind, shadcn). See `SETUP.md` for how to run it. |
| `claude-artifact/career-command-center.html` | A single-file rebuild of the same app that runs as a Claude artifact. |
| `docs/index.html` | A standalone version of the app, served by GitHub Pages. It starts empty and saves each visitor's data in their own browser. |

## Running each version

**Base44 app.** It needs a Base44 backend for sign-in, saved data, functions and the Career Coach agent. Follow `SETUP.md`.

**Claude artifact.** The HTML file is the page source for an artifact published on claude.ai. It relies on Claude for saved data, scoring and the Career Coach, so it does not work when opened on its own or hosted on GitHub Pages. It holds no personal data: roles, profile and chats live in the artifact's private database, not in this file.

**Standalone site.** `docs/index.html` is the version served by GitHub Pages: https://gmt9126-beep.github.io/career-command-center/. In the repository settings, Pages must be set to the `main` branch and the `/docs` folder.

- **Onboarding.** First-time visitors agree to the terms, then can add their name, pronouns, date of birth, target roles, locations, types of work, start date, resume and skills. Every step can be skipped.
- **Board.** A kanban board of roles, added by hand.
- **Resume review.** Checks resume text against common applicant tracking system guidance, compares it with a pasted job posting, and downloads the edited text as a plain single-column PDF.
- **Profile.** Everything from onboarding, editable, plus backup, restore and erase.

Data is saved in the visitor's browser on that device. There are no accounts and nothing syncs between devices. Resume PDFs are read and generated in the browser with the bundled libraries in `docs/vendor/` (PDF.js and pdf-lib, under their own licenses). The AI features (scoring, Career Coach, outreach drafting, role discovery) are only in the Claude artifact.
