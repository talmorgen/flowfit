# AGENTS.md

## Project

FlowFit is a Hebrew-first, RTL fitness application. Its priorities are:

1. Surfing takes precedence when conditions are good.
2. Maintain and improve strength training.
3. Run at least once per week.
4. Use recent workouts and Garmin activity to adapt recommendations.

## Source and deployment

- Treat GitHub as the source of truth.
- The deployed Site snapshot is on `codex/site-v43`.
- The production Site project ID is `appgprj_6a941c7f7c9c819189ad705892de0110`.
- Do not rewrite or force-push `main`.
- Preserve `.openai/hosting.json` and its existing project ID.
- Never commit secrets, `.env*`, Garmin tokens, local databases, or generated build output.

## Development rules

- Use `pnpm`.
- Validate changes with `pnpm run build`.
- Preserve RTL layout and concise Hebrew UI copy.
- Persist workout sets in D1 through `/api/state`.
- Keep local storage only as a resilient device cache, not the sole durable record.
- A discarded workout must remain excluded from logs and legacy imports.
- Do not remove Garmin history or training history during migrations.
- Prefer small feature branches and pull requests.

## Important paths

- `app/page.tsx`: primary client application.
- `app/api/state/route.ts`: D1 app state and workout-set persistence.
- `app/api/garmin-sync/route.ts`: Garmin cloud data access.
- `app/api/coach/route.ts`: AI coach endpoint.
- `lib/exercise-bank.ts`: durable exercise catalogue.
- `.openai/hosting.json`: Sites project and D1 binding.
