# Generic — Agent Builder

A local web app that hosts the **project-generator widgets** and drives a **Claude Agent** (with `write_file` + `run_bash` tools) to *actually build* the scaffolded project on your machine — the browser equivalent of clicking "Generate" in Claude Code, but self-hosted on the Anthropic SDK.

Same widget source powers both surfaces: the server reads each widget straight out of its `SKILL.md`, so `/java-generator` in Claude Code and this web app never drift.

## Overview

```
Browser (widget in iframe)
   │  Generate ↗  → window.sendPrompt(buildPrompt)
   │              → postMessage to parent page
   ▼
public/index.html  ──POST /run {prompt}──►  server.js
   ▲  SSE stream (text + tool events)          │
   │                                           ▼
   └──────────  Claude Agent loop (claude-opus-4-8, streaming)
                 tools: write_file / run_bash  (scoped to ./workspace)
                 → writes the project, runs mvn/npm, reports back
```

## Tech stack

- **Node.js** (ESM), **Express** — static hosting + `/run` SSE endpoint + `/widgets/:name`
- **@anthropic-ai/sdk** — `claude-opus-4-8`, streaming, manual tool-use loop
- **Vanilla HTML/JS** front-end — widget in an `<iframe>`, live agent output pane
- Widgets sourced from `~/.claude/skills/{java,python,ui}-generator/SKILL.md`

## Project structure

```
c:\claude\generic\
  package.json         # type: module, start script
  server.js            # Express + agent loop + tools + widget extraction
  public/
    index.html         # UI: generator picker, widget iframe, streaming log
  .env.example
  workspace/           # (created at runtime) where the agent builds projects
  README.md
```

## Running locally

```sh
cd c:\claude\generic
npm install                 # installs express + @anthropic-ai/sdk
# auth — pick one:
set ANTHROPIC_API_KEY=sk-ant-...     # (PowerShell: $env:ANTHROPIC_API_KEY="sk-ant-...")
#   …or run `ant auth login` once and leave the var unset
npm start
# open http://localhost:5178
```

Pick a generator (Java / Python / UI), fill the form, hit **Generate**. The build prompt streams to the agent, which writes the project into `workspace/` and runs the build — live in the right-hand pane.

## Environment variables

| Var | Default | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | — | API key (or use an `ant auth login` profile instead) |
| `WORKSPACE_DIR` | `./workspace` | Where the agent creates/builds projects (all tool ops confined here) |
| `SKILLS_DIR` | `%USERPROFILE%\.claude\skills` | Source of the generator widgets |
| `PORT` | `5178` | HTTP port |

## API reference

### `GET /widgets/:name`
Returns the widget HTML extracted from that generator's `SKILL.md`, wrapped with a `sendPrompt` shim that `postMessage`s the build prompt to the parent page. `name` ∈ `java-generator`, `python-generator`, `ui-generator`.

### `POST /run`
- **Request:** `{"prompt": "<full build prompt>"}`
- **Response:** `text/event-stream` (SSE). Events: `meta` (model + workspace), `text` (agent narration deltas), `tool` (`{name,input}`), `tool_result` (`{name,output}`), `done`, `error`.

## Security ⚠️

`run_bash` executes the **model's shell commands on your machine** (the whole point — it reproduces the build-verify loop). Mitigations in place: every file/command is confined to `WORKSPACE_DIR` (path-traversal rejected), commands time out at 4 min. This is the same trust model as Claude Code. Run it only on projects you'd let Claude Code build, and keep `WORKSPACE_DIR` pointed at a throwaway directory. The API key lives **server-side only** — it is never sent to the browser.

## Troubleshooting

- **`AuthenticationError` / 401 on Generate** — no credentials. `set ANTHROPIC_API_KEY=...` or run `ant auth login`, then restart `npm start`.
- **Widget pane blank / 500** — `SKILLS_DIR` doesn't contain the generator; check the path, or that `~/.claude/skills/java-generator/SKILL.md` exists.
- **Icons show as boxes** — the Tabler icon webfont failed to load from the CDN (offline); cosmetic only.
- **`mvn` / `npm` not found in build output** — the tool runs commands via the system shell; ensure the build tool is on `PATH` for the shell that launched `npm start`.
- **Nothing streams** — check the `npm start` console for errors; the SSE stream surfaces API errors as an `error` event in the log pane.
