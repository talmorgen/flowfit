# FlowFit

FlowFit is a personal training planner and workout tracker focused on strength progression, weekly running consistency, and surf-first scheduling.

## Cloud source

- Repository: `talmorgen/flowfit`
- Deployed Site snapshot: branch `codex/site-v43`
- Production Site: https://flowfit-tal.talmorgen318054.chatgpt.site
- Sites project ID: `appgprj_6a941c7f7c9c819189ad705892de0110`

The default `main` branch contains newer independent work. The `codex/site-v43` branch is based on that branch and overlays the source currently used by the deployed Site, making it safe to compare or merge without rewriting Git history.

## Local development

```bash
pnpm install
pnpm run build
pnpm run dev
```

The application uses Vinext/React and Cloudflare D1 through the Sites hosting manifest.

## Runtime configuration

Configure these in the hosting environment; never commit their values:

- `OPENAI_API_KEY`
- `GOOGLE_SHEETS_ENDPOINT`
- `GOOGLE_SHEETS_SECRET`
- Garmin-related runtime credentials used by the sync service

Local `.env*`, generated builds, Wrangler data, and private Garmin state are ignored by Git.

## Collaboration workflow

1. Start from `codex/site-v43` when changing the deployed Site experience.
2. Create a feature branch for each task.
3. Run `pnpm run build`.
4. Open a pull request into the intended canonical branch.
5. Publish through the Sites project only after the source commit is pushed.
