# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Dev server (hot reload via `tsx watch`): `npm run dev`
- Build: `npm run build` (runs `tsc`, emits to `dist/`)
- Run built server: `npm start` (runs `node dist/server.js`, requires `npm run build` first)
- No test suite is configured yet (`npm test` is a placeholder that exits with an error)
- No linter is configured
- TypeScript, `strict: true` (see `tsconfig.json`). Express `Request.objKey` augmentation lives in `src/types/express.d.ts`.

### Required env vars (`.env`, gitignored)

Config is selected by `NODE_ENV` (`dev` | `pro`), each with its own var set — see `src/configs/config.mongodb.ts`:

```
DEV_APP_PORT, DEV_DB_HOST, DEV_DB_PORT, DEV_DB_NAME
PRO_APP_PORT, PRO_DB_HOST, PRO_DB_PORT, PRO_DB_NAME
```

`server.ts` itself uses `PORT` (default 3003) for the HTTP listener, independent of `config.mongodb`'s `app.port`.

## Architecture

Layered Express 5 API: `routes → controllers → services → models`, sitting in front of MongoDB via Mongoose.

### Request flow

Every request passes through two global middlewares mounted in `src/routes/index.ts` before reaching any route:

1. **`apiKey`** (`src/auth/checkAuth.ts`) — requires header `x-api-key`, looks it up via `apikey.services.findById`, and attaches the result to `req.objKey`.
2. **`permission('0000')`** — checks `req.objKey.permissions` includes the required level (`'0000'` basic, `'1111'`, `'2222'` higher tiers per `apikey.model.ts`).

Only after both pass does the request reach `/v1/api/*` routes (currently `src/routes/access/`).

### Layer responsibilities

- **Routes** (`src/routes/`): thin; wrap handlers with `asyncHandler(Controller.method)` from `src/auth/checkAuth`, no logic.
- **Controllers** (`src/controllers/`): call one service method, then send the response via `SuccessResponse`/`CREATED` (`src/core/success.response.ts`). No business logic, no direct `res.status().json()`.
- **Services** (`src/services/`): all business logic. Exported as a singleton instance (`module.exports = new XService()`). Throw errors from `src/core/error.response.ts` (`BadRequestError`, `AuthFailureError`, `ForbiddenError`, `ConflictRequestError`, `NotFoundError`) rather than handling the response directly.
- **Models** (`src/models/`): Mongoose schemas — `Shop`, `KeyToken` (called `Key` internally), `Apikey`.

### Error handling

Errors thrown in services/controllers propagate to Express's global handler in `src/app.ts`, which reads `err.status`/`err.statusCode` (defaulting to 500) and responds `{ status: 'error', code, message }`. In middleware (not controllers), call `next(new SomeError(...))` explicitly rather than throwing, since middleware executes outside a promise chain that `asyncHandler` wraps.

### Auth internals

- Passwords hashed with bcrypt (`bcrypt.hash(password, 10)`).
- On signup/login, a fresh RSA-style keypair (actually random hex strings, used as HS256 symmetric secrets) is generated per session via `crypto.randomBytes(64)`, then `authUtils.createTokenPair(payload, publicKey, privateKey)` signs an access token (2 day expiry, signed with `publicKey`) and refresh token (7 day expiry, signed with `privateKey`).
- The keypair + refresh token are persisted per-user via `keyToken.services.createKeyToken`, keyed to `Shop._id`, to support refresh/rotation and later verification.
- This is a different concept from the `apiKey`/`permission` layer above — that authenticates the calling *application*; JWT auth here authenticates the *shop/user*.

### Database

- `src/dbs/init.mongodb.ts` is a singleton (`Database.getInstance()`), connected once on require from `src/app.ts`. Connection string is built from `config.mongodb`'s `db.host`/`db.port`/`db.name`.
- `src/helper/check.connect.ts` exposes `checkConnect` (logs active connection count) and `checkOverload`/`stopCheckOverload` (periodic connection/memory logging interval, started manually if needed and stopped in `server.ts`'s graceful shutdown on SIGINT/SIGTERM).

## Conventions

- New endpoints: add a controller method → service method → route registered under `src/routes/` → mounted in `src/routes/index.ts` (inherits the apiKey + permission gate automatically).
- Use `getInfoData({ fields, object })` (`src/utils/index.ts`, a lodash `pick` wrapper) to whitelist fields (e.g. `_id`, `name`, `email`) before returning Mongoose documents in responses — never return raw documents containing `password`.
- Status codes/reason phrases come from `src/utils/httpStatusCode.ts` (`StatusCodes`, `ReasonPhrases`), used as defaults in `error.response.ts`.
