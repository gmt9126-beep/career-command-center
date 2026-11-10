# Career Command Center - source export

Everything in this archive is the full source of the Career Command Center app,
as it runs today. No placeholder files.

## What's in here

| Path | What it is |
| --- | --- |
| `src/pages/` | Screens: Home (kanban board), JobDetail, Discover, Projects, Profile, Coach, Auth pages |
| `src/components/` | All UI components, grouped in `jobs/`, `coach/`, `discover/`, `projects/`, plus shared ones and `ui/` (shadcn primitives) |
| `src/lib/` | Helpers: constants, board filters, calendar sync, auth context, MFA flows, utils |
| `src/api/base44Client.js` | The pre-initialised Base44 SDK client |
| `base44/entities/` | Data model: Job, Outreach, Profile, Project, CoachNote, JobSource (JSON schemas + row-level security) |
| `base44/functions/` | Backend: addJobFromPaste, scoreJobs, recommendRoles, draftOutreach, dailyPicks, syncOutreachCalendar |
| `base44/shared/` | Shared backend modules: scoring.ts, portfolio.ts, googleCalendar.ts |
| `base44/agents/CareerCoach.jsonc` | The Career Coach AI agent config (prompt, tools, permissions) |
| `base44/connectors/` | Connector declarations for Google Calendar, Google Sheets, GitHub |
| `src/index.css` + `tailwind.config.js` | Design tokens (colour, type, radius, the blue-to-pink page gradient) |

Removed on purpose (already deleted from this export): the Outreach page and the
Daily Picks page, along with their components and nav entries.

## Running it

Pull down dependencies with your package manager, then:

```bash
npm run dev
```

The app talks to the Base44 backend (auth, entities, functions, the AI agent).
To run it under your own Base44 app, create an app and set in `.env.local`:

```
VITE_BASE44_APP_ID=<your app id>
VITE_BASE44_APP_BASE_URL=<your app base url>
```

then copy the `base44/entities`, `base44/functions`, `base44/agents` and
`base44/connectors` folders into that app, and connect the Google Calendar,
Google Sheets and GitHub connectors.

## Handing this to another AI

Point it at the repo root and tell it the entry point is `src/App.jsx`
(routes) and `src/components/Shell.jsx` (nav). Data model lives in
`base44/entities/*.jsonc`; server work in `base44/functions/*/entry.ts`.
Rules that keep it building: React + Tailwind only, icons from lucide-react,
shadcn components from `@/components/ui`, `@/` alias for `src/`.
