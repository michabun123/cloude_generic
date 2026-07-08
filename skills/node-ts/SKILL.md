---
name: node-ts
description: Node.js + TypeScript backend engineer. Conventions for building/reviewing Express + TS services — strict TS, tsx run, clean layout, async/await, central error handling, validation, tests. Peer to fastapi/spring-boot; NEVER overrides the spring-boot skill and is not used for Java/Python work. Use for Node/TS/Express tasks or when the engineering-team routes "Node.js / TypeScript / Express".
---

# Node/TS Engineer (junior — trained on team conventions)

Builds and reviews **Node.js + TypeScript** services. Industrial-grade, runnable, verified — the Node peer of `fastapi`/`spring-boot`, but **never overrides spring-boot** (Java stays with spring-boot). See [[engineering-team]].

## Stack (defaults)
- **Node 20+**, **TypeScript** (strict), **Express** for HTTP.
- **tsx** to run TS directly (no build step): `"start": "tsx src/index.ts"`. `tsc` only when a compiled `dist/` is needed.
- **ESM or CommonJS** — pick one and be consistent (tsx handles both; CommonJS + `esModuleInterop` is the low-friction default).
- **zod** for request validation when input is untrusted (the Bean-Validation analog). **vitest** or built-in **node:test** for tests. **dotenv**/`process.env` for config — never hardcode secrets.

## Conventions (mirror the team's rigor)
- **Layout:** `src/` → `index.ts` (app + listen), `routes/` (routers = controllers), `services/`, `lib/` (helpers), `types.ts`. Small, single-purpose modules.
- **tsconfig:** `"strict": true`, `esModuleInterop`, `skipLibCheck`, explicit `rootDir`/`outDir`.
- **Async:** `async/await` everywhere; wrap route handlers so rejected promises reach the error middleware (Express 5 forwards async errors; on Express 4 use a `wrap()` helper).
- **Central error handler:** one `app.use((err, req, res, next) => …)` mapping to clean JSON + status (the `@RestControllerAdvice` analog). 404/400/409 for not-found/validation/conflict.
- **Envelope:** `{ success, message, data }` for POST/DELETE; plain resource for GET.
- **CRUD by default** per resource unless told otherwise. Types (`type`/`interface`) for DTOs; reuse a type wherever it appears.
- **No secrets in code / browser.** Server-side only.

## Build-verify loop (mandatory)
1. `npm install`; 2. typecheck (`tsc --noEmit`) or rely on tsx; 3. run tests; 4. **boot it** (`npm start`) and hit a real endpoint with curl — prove it; 5. render the build-summary card (endpoints + JSON examples, run command, URL). Fix → rerun until green.

## Reference (living examples already in the workspace)
- `c:\Interviews\odd-prime-join` — minimal Express + TS (tsx, tsconfig, GET route returning JSON).
- `c:\claude\generic` — larger Express app: SSE streaming, async loop, the Anthropic SDK.

> Java analogy cheat: `import` ≈ Spring `@Autowired`+package import · middleware ≈ Servlet filters · `async/await` ≈ `CompletableFuture` · zod ≈ Bean Validation · error middleware ≈ `@RestControllerAdvice`.
