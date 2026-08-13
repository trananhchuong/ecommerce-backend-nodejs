# Agent guidance for ecommerce-backend-nodejs

This repo uses **Cursor rules** and a **project skill** so the agent keeps context and follows conventions.

---

## Purpose of these files (clarification)

| File | What it is | Why it exists |
|------|------------|----------------|
| **AGENTS.md** (this file) | A short readme for both you and the AI. | Tells the agent “here are the rules and the skill” and tells you what each setup file is for. |
| **.cursor/rules/project-context.mdc** | A Cursor **rule** that is **always on**. | So the agent always knows: what stack you use (Node, Express, Mongo), where everything lives (routes, controllers, services, models, auth), and a few high-level conventions. Without this, the agent might guess wrong or forget your structure. |
| **.cursor/rules/backend-patterns.mdc** | A Cursor **rule** that turns on when you edit **any file under `src/`**. | So when writing routes, controllers, or services, the agent follows your patterns: use `asyncHandler`, use `SuccessResponse`/`CREATED`, put logic in services and throw errors from `core/error.response`, etc. |
| **.cursor/rules/security-and-db.mdc** | A Cursor **rule** that turns on when you edit **auth, dbs, or configs**. | So when touching API key, JWT, bcrypt, MongoDB connection, or config, the agent follows your security and DB practices (e.g. singleton DB, env-based config, no always-on debug in prod). |
| **.cursor/skills/ecommerce-backend-context/SKILL.md** | A Cursor **project skill** (instructions the agent can load). | Gives a compact “cheat sheet” of your repo: flow, key paths, conventions. The agent uses it when it thinks you’re working in this repo (e.g. adding features, fixing bugs). Skills are optional extra context; rules are automatic by file/scope. |

**In one sentence:**  
Rules = automatic guidance by scope (always, or when you’re in certain files). Skill = extra context the agent can pull in when working on this backend. AGENTS.md = map of where those rules and that skill live and what they’re for.

---

## For the AI agent

- **Project context and layout**: See `.cursor/rules/project-context.mdc` (always applied). It describes the stack (Node, Express 5, Mongoose, MongoDB), folder layout, and where routes, controllers, services, models, and auth live.
- **Backend patterns**: See `.cursor/rules/backend-patterns.mdc` when editing `src/**/*.js`. It covers controllers, services, errors, and response patterns.
- **Security and DB**: See `.cursor/rules/security-and-db.mdc` when working in `src/auth/`, `src/dbs/`, or `src/configs/`. It covers API key, permissions, JWT, bcrypt, MongoDB, and config.
- **Skill**: The project skill `.cursor/skills/ecommerce-backend-context/` summarizes this context and when to use it; apply it when working in this repo, adding features, or fixing bugs.

## Best practices (summary)

1. Use existing error classes and `next(error)` so the global error handler responds consistently.
2. Wrap async route handlers with `asyncHandler(Controller.method)`.
3. Use `SuccessResponse` / `CREATED` in controllers; keep business logic in services.
4. Add new routes under `src/routes/` and mount them in `src/routes/index.js` (already behind API key + permission).
5. Use env-based config and document variables in `.env.example`; gate Mongoose debug on `NODE_ENV`.
