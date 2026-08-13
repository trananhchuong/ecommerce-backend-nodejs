---
name: ecommerce-backend-context
description: Reminds the agent of this Node/Express/Mongo e-commerce backend structure, auth flow (API key + JWT), and project conventions. Use when working in this repo, adding features, fixing bugs, or answering questions about the codebase.
---

# E-commerce Backend – Agent Context

## When to Use This Skill
- Working in `ecommerce-backend-nodejs` (routes, controllers, services, auth, DB).
- Adding endpoints, services, or models.
- Debugging auth, API key, or MongoDB issues.
- Applying or explaining this repo’s conventions.

## Repo at a Glance
- **Stack**: Node, Express 5, Mongoose, MongoDB. Auth: `x-api-key` + permissions, JWT (access/refresh), bcrypt.
- **Flow**: Request → `apiKey` → `permission('0000')` → routes under `/v1/api` → controller → service → model.
- **Responses**: Controllers use `SuccessResponse` / `CREATED` from `src/core/success.response`. Errors thrown from services (e.g. `BadRequestError`) and handled globally in `src/app.js`.
- **Async**: Route handlers wrapped with `asyncHandler()` from `src/auth/checkAuth`.

## Key Paths
| Concern        | Location |
|----------------|----------|
| App bootstrap  | `src/app.js`, `server.js` |
| Route wiring   | `src/routes/index.js`, `src/routes/access/` |
| Business logic | `src/services/*.services.js` |
| Schemas        | `src/models/*.model.js` |
| Auth helpers   | `src/auth/checkAuth.js`, `src/auth/authUtils.js` |
| Errors/success | `src/core/error.response.js`, `src/core/success.response.js` |
| Config         | `src/configs/config.mongodb.js` (dev/pro by NODE_ENV) |
| DB connection  | `src/dbs/init.mongodb.js` (singleton) |

## Conventions to Follow
1. **New route**: Add controller method → service method → mount in `src/routes/` with `asyncHandler(Controller.method)`.
2. **Errors**: Throw from `src/core/error.response`; in middleware use `next(error)` so the global handler responds.
3. **Success**: Use `new SuccessResponse({ metadata })` or `new CREATED({ message, metadata })` and `.send(res)`.
4. **Config/secrets**: Use env vars and document them in `.env.example`; no hardcoded secrets.
5. **DB**: Rely on the existing singleton; gate Mongoose debug on `NODE_ENV` (e.g. dev only).=

## Project Rules=
Cursor rules in `.cursor/rules/` define this in more detail:
- **project-context.mdc** (always on): layout, stack, conventions.
- **backend-patterns.mdc** (src/**): controllers, services, errors.
- **security-and-db.mdc** (auth, dbs, configs): API key, JWT, bcrypt, MongoDB, config.

Prefer existing patterns and core modules over introducing new styles or duplicate logic.
