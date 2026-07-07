import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs } from "node:fs";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const execP = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5178;
// Where the agent is allowed to create/build projects. Everything is confined here.
const WORKSPACE = path.resolve(process.env.WORKSPACE_DIR || path.join(__dirname, "workspace"));
// Where the generator skills live (single source of truth for the widgets).
const SKILLS_DIR = process.env.SKILLS_DIR || path.join(os.homedir(), ".claude", "skills");

// new Anthropic() resolves credentials from ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN,
// or an `ant auth login` profile — never hardcode a key.
const client = new Anthropic();

const MODEL = "claude-opus-4-8";

// ── Agent tools (executed here, on your machine, scoped to WORKSPACE) ─────────
const TOOLS = [
  {
    name: "write_file",
    description:
      "Create or overwrite a file. Path is relative to the workspace root. Parent directories are created automatically.",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "File path relative to the workspace root" },
        content: { type: "string", description: "Full file contents" },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_bash",
    description:
      "Run a shell command in the workspace root and return combined stdout/stderr. Use for mkdir, running the build (mvn/npm), git, curl, etc.",
    input_schema: {
      type: "object",
      properties: { command: { type: "string", description: "The shell command to run" } },
      required: ["command"],
    },
  },
];

const SYSTEM = `You are a build agent running locally on the user's machine.
You have two tools — write_file and run_bash — both scoped to the workspace directory.
Follow the build request precisely: create every file the project needs, then run the build to verify it works (compile, run tests, boot if applicable) and report the result.

ENVIRONMENT: The OS is Windows and run_bash executes each command through cmd.exe.
- Use Windows commands (dir, type, findstr, copy, del) — NOT Unix (ls, cat, pwd, grep, rm). There is no pwd; the working directory is always the workspace root, and each run_bash call is a fresh shell (a leading 'cd sub' only lasts for that one call).
- Run ONE program per run_bash call. Do NOT chain with '&' or '&&' when you need an exit code — %errorlevel% after a chained node/npm/mvn call is unreliable. To read an exit code, run the single command, then in the NEXT call inspect it, or wrap as: cmd /v:on /c "yourcmd & echo EXIT=!errorlevel!".
- Invoke node / npm / mvn / python directly. Prefer running a test command and reading its own printed summary over shell exit-code gymnastics.

Work ONLY inside the workspace. Keep narration brief; let the tool calls do the work. When finished, end with a short summary of what you built and how to run it.`;

// Used when the run is a QA task (mode === "qa"). Prevents the agent from scaffolding a new
// project/tool instead of QA-ing the one it was asked about.
const SYSTEM_QA = SYSTEM + `

THIS RUN IS A QA TASK ON AN EXISTING PROJECT.
- If the request names a project path, QA THAT project: change into it with 'cd /d <path>' and run its own build/tests there (Java: mvn clean verify with JDK 21; Python: pytest -q). Then review coverage and probe the endpoints.
- Do NOT scaffold, create, or "set up" a new project — and never build a 'qa-runner' tool — to satisfy a QA request. There may be leftover folders in the workspace; ignore them.
- If the named path does not exist or has no runnable build, say so plainly in the report instead of building something.
- write_file is confined to the workspace, so to add a regression test to an external project, write it via run_bash redirection; but prefer reviewing and running the project's existing tests.`;

function safePath(rel) {
  const p = path.resolve(WORKSPACE, rel);
  if (p !== WORKSPACE && !p.startsWith(WORKSPACE + path.sep)) {
    throw new Error(`Path escapes the workspace: ${rel}`);
  }
  return p;
}

async function runTool(name, input) {
  try {
    if (name === "write_file") {
      const p = safePath(input.path || "");
      await fs.mkdir(path.dirname(p), { recursive: true });
      await fs.writeFile(p, input.content ?? "");
      return `Wrote ${Buffer.byteLength(input.content ?? "")} bytes to ${input.path}`;
    }
    if (name === "run_bash") {
      const { stdout, stderr } = await execP(input.command, {
        cwd: WORKSPACE,
        timeout: 240000,
        maxBuffer: 16 * 1024 * 1024,
      });
      const out = (stdout || "") + (stderr ? `\n[stderr]\n${stderr}` : "");
      return out.slice(0, 24000) || "(no output)";
    }
    return `Unknown tool: ${name}`;
  } catch (e) {
    // exec throws on non-zero exit — surface the captured output so the agent can react.
    const detail = `${e.stdout || ""}${e.stderr || ""}${e.message || e}`;
    return `ERROR: ${detail}`.slice(0, 24000);
  }
}

// ── Serve a widget straight out of its SKILL.md (single source of truth) ──────
const WIDGETS = {
  "engineering-team": "engineering-team",
  "java-generator": "java-generator",
  "python-generator": "python-generator",
  "ui-generator": "ui-generator",
  "qa-runner": "qa-runner",
};

const CSS_VARS = `:root{
--color-border-tertiary:#e7e5df;--color-border-secondary:#d3d1c7;--color-border-primary:#b4b2a9;
--color-background-primary:#ffffff;--color-background-secondary:#f5f4ef;--color-background-info:#e6f1fb;
--color-background-success:#e1f5ee;--color-background-warning:#faeeda;
--color-text-primary:#1a1a18;--color-text-secondary:#5f5e5a;--color-text-tertiary:#888780;
--color-text-info:#185fa5;--color-text-success:#0f6e56;--color-text-warning:#854f0b;
--border-radius-lg:12px;--border-radius-md:8px}`;

// Backend generators get an extra action bar (Create&run QA + To API) injected by the app.
const BACKENDS = new Set(["java-generator", "python-generator"]);

const ACTION_BAR = `
<div id="xbar">
  <button id="xapi" class="xbtn" hidden><i class="ti ti-api"></i> To API</button>
  <button id="xqa" class="xbtn xprimary"><i class="ti ti-shield-check"></i> Create &amp; run QA</button>
</div>
<script>
(function(){
  var qa=document.getElementById('xqa'), api=document.getElementById('xapi');
  var realSend=function(t){parent.postMessage({type:'run',prompt:t},'*');};
  var capturing=false, captured=null;
  // wrap sendPrompt so we can capture the widget's own build prompt without sending it
  window.sendPrompt=function(t){ if(capturing){captured=t;return;} realSend(t); };
  function activeForm(){ var fs=document.querySelectorAll('.psg-form'); for(var i=0;i<fs.length;i++){ if(getComputedStyle(fs[i]).display!=='none') return fs[i]; } return null; }
  function grab(){ var f=activeForm(); if(!f) return null; var b=f.querySelector('.psg-gen'); if(!b) return null; capturing=true; captured=null; b.click(); capturing=false; return captured; }
  function val(f,k){ var el=f.querySelector('[data-f="'+k+'"]'); if(!el) return ''; return el.type==='checkbox'?el.checked:(el.value||'').trim(); }
  qa.onclick=function(){ var base=grab(); if(!base) return;
    var p=base+"\\n\\nTHEN run a QA pass on the service you just built: (1) judge test coverage against the test pyramid; (2) run the tests (Java: mvn clean verify with JDK 21; Python: pytest -q); (3) a short adversarial probe of the endpoints (unknown id \\u2192 404, invalid body \\u2192 400, duplicate \\u2192 409, null/empty inputs). Give a brief human-readable summary. THEN, as the very last thing in your reply, output ONE fenced code block tagged qa-report containing ONLY JSON of exactly this shape: {\\"tests\\":{\\"run\\":0,\\"passed\\":0,\\"failed\\":0},\\"bugs\\":[{\\"title\\":\\"\\",\\"severity\\":\\"high|med|low\\",\\"fix\\":\\"\\"}],\\"gaps\\":[\\"\\"],\\"summary\\":\\"\\"}. Use real values, empty arrays if none, and write nothing after that block.";
    parent.postMessage({type:'run',prompt:p,mode:'qa'},'*'); };
  function isMS(){ var f=activeForm(); return !!f && (f.id==='psg-ms'||f.id==='psg-pyms'); }
  function refresh(){ api.hidden=!isMS(); }
  document.addEventListener('click', function(e){ if(e.target.closest && e.target.closest('.nav-item')) setTimeout(refresh,0); });
  setTimeout(refresh,0);
  api.onclick=function(){ parent.postMessage({type:'apiSummary',data:summary()},'*'); };
  function summary(){
    var f=activeForm(); if(!f) return {};
    var py=(f.id==='psg-pyms');
    var name=val(f,'name')||(py?'py-service':'NewService');
    var port=val(f,'port')||(py?'8000':'8080');
    var base='http://localhost:'+port;
    var eps=[];
    if(py){
      var res=(val(f,'resources')||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
      (res.length?res:['resource']).forEach(function(r){ var pp='/'+r+'s'; eps.push('GET '+pp,'GET '+pp+'/{id}','POST '+pp,'PUT '+pp+'/{id}','DELETE '+pp+'/{id}'); });
    } else {
      eps.push('CRUD for the main resource (GET list, GET by id, POST, PUT, DELETE)');
      var rows=f.querySelectorAll('.psg-api-item');
      for(var i=0;i<rows.length;i++){ var m=rows[i].querySelector('[data-a="method"]'); var pe=rows[i].querySelector('[data-a="path"]'); var path=pe?(pe.value||'').trim():''; if(path && path!=='/api/') eps.push((m?m.value:'GET')+' '+path); }
    }
    var dbs=[];
    if(py){
      if(val(f,'dbPg')) dbs.push('PostgreSQL \\u2014 '+(val(f,'pgHost')||'localhost')+':'+(val(f,'pgPort')||'5432')+' / '+(val(f,'pgDb')||name));
      if(val(f,'dbMongo')) dbs.push('MongoDB \\u2014 '+(val(f,'mongoUri')||'mongodb://localhost:27017')+' / '+(val(f,'mongoDb')||name));
    } else {
      if(val(f,'dbPg')) dbs.push('PostgreSQL \\u2014 '+(val(f,'sqlHost')||'localhost')+':'+(val(f,'sqlPort')||'5432')+' / '+(val(f,'sqlDb')||name));
      if(val(f,'dbMy')) dbs.push('MySQL \\u2014 '+(val(f,'myHost')||'localhost')+':'+(val(f,'myPort')||'3306')+' / '+(val(f,'myDb')||name));
      if(val(f,'dbMongo')) dbs.push('MongoDB \\u2014 '+(val(f,'mongoUri')||'mongodb://localhost:27017')+' / '+(val(f,'mongoDb')||name));
      if(val(f,'dbCb')) dbs.push('Couchbase \\u2014 '+(val(f,'cbConn')||'couchbase://localhost')+' / '+(val(f,'cbBucket')||name));
    }
    if(!dbs.length) dbs.push('none (H2 in-memory default)');
    var h2 = py ? null : { console: base+'/h2-console', jdbc: 'jdbc:h2:mem:'+name.toLowerCase()+'db', user: 'sa', password: '(empty)' };
    return { name:name, stack: py?'FastAPI':'Spring Boot', base:base, endpoints:eps, dbs:dbs, h2:h2,
      swagger: py? base+'/docs' : base+'/swagger-ui/index.html',
      actuator: py? [base+'/health'] : [base+'/actuator/health', base+'/actuator/info'] };
  }
})();
</script>`;

// Appended to any QA prompt so the agent ends with a parseable report the app can render as a card.
const QA_TAIL =
  "\n\nWhen done, as the very last thing in your reply, output ONE fenced code block tagged qa-report containing ONLY JSON of exactly this shape: " +
  '{"tests":{"run":0,"passed":0,"failed":0},"bugs":[{"title":"","severity":"high|med|low","fix":""}],"gaps":[""],"summary":""}. ' +
  "Use real values, empty arrays if none, and write nothing after that block.";

// The QA-runner widget sends its own senior-qa prompt via sendPrompt(); wrap it so the run is
// tagged as QA and asks for the report block (so the QA results card renders).
const QA_SHIM =
  "<script>(function(){var tail=" + JSON.stringify(QA_TAIL) +
  ";window.sendPrompt=function(t){parent.postMessage({type:'run',prompt:String(t)+tail,mode:'qa'},'*');};})();</script>";

async function widgetHtml(name) {
  const file = path.join(SKILLS_DIR, WIDGETS[name], "SKILL.md");
  const md = await fs.readFile(file, "utf8");
  const m = md.match(/```html\n([\s\S]*?)\n```/);
  if (!m) throw new Error(`No html block found in ${file}`);
  const inner = m[1];
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/icons.css">
<style>${CSS_VARS}
body{font-family:system-ui,-apple-system,sans-serif;margin:0;padding:12px 14px;color:var(--color-text-primary)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
/* text fields — but NOT checkboxes/radios (those must not stretch to 100%) */
input:not([type=checkbox]):not([type=radio]),select,textarea{font:inherit;padding:7px 9px;border:0.5px solid var(--color-border-secondary);border-radius:8px;width:100%;box-sizing:border-box;background:#fff;transition:border-color .12s,box-shadow .12s}
input:not([type=checkbox]):focus,select:focus,textarea:focus{outline:0;border-color:var(--color-text-info);box-shadow:0 0 0 3px var(--color-background-info)}
input[type=checkbox]{width:16px;height:16px;flex:0 0 auto;accent-color:var(--color-text-info);cursor:pointer;margin:0}
button{font:inherit;cursor:pointer;transition:background .12s,border-color .12s,color .12s,transform .05s}
button:active{transform:translateY(0.5px)}
/* "Add endpoint" — pill button */
#psg-add-api{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border:0.5px solid var(--color-border-secondary);border-radius:99px;background:var(--color-background-secondary);color:var(--color-text-secondary);font-weight:500}
#psg-add-api:hover{border-color:var(--color-text-info);color:var(--color-text-info);background:var(--color-background-info)}
/* per-row params + delete icon buttons */
.psg-params-btn,.psg-del{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border:0.5px solid var(--color-border-secondary);border-radius:8px;background:#fff;color:var(--color-text-secondary)}
.psg-params-btn:hover{border-color:var(--color-text-info);color:var(--color-text-info);background:var(--color-background-info)}
.psg-del:hover{border-color:#e24b4a;color:#a32d2d;background:#fceceb}
/* widget-native QA / To API buttons are for Claude Code; the web app injects its own bar with card UX */
.psg-qa,.psg-toapi{display:none !important}
/* generate button — make the primary CTA pop */
.psg-gen{border-radius:10px !important;padding:10px 22px !important;box-shadow:0 1px 2px rgba(16,24,40,.06);font-weight:500}
.psg-gen:hover{filter:brightness(0.98);box-shadow:0 2px 6px rgba(16,24,40,.10)}
#xbar{position:sticky;bottom:0;display:flex;gap:8px;justify-content:flex-end;padding:12px 2px 6px;margin-top:10px;background:linear-gradient(rgba(255,255,255,0),var(--color-background-primary) 45%)}
.xbtn{display:inline-flex;align-items:center;gap:7px;font:inherit;font-weight:500;padding:9px 16px;border-radius:10px;border:0.5px solid var(--color-border-secondary);background:#fff;color:var(--color-text-primary);cursor:pointer;transition:background .12s,border-color .12s,color .12s,filter .12s}
.xbtn:hover{border-color:var(--color-text-info);color:var(--color-text-info);background:var(--color-background-info)}
.xbtn.xprimary{background:var(--color-text-info);border-color:var(--color-text-info);color:#fff}
.xbtn.xprimary:hover{filter:brightness(1.06);color:#fff;background:var(--color-text-info)}
.xbtn[hidden]{display:none}
</style></head><body>
<script>window.sendPrompt=function(t){parent.postMessage({type:"run",prompt:t},"*");};</script>
${inner}
${BACKENDS.has(name) ? ACTION_BAR : ""}
${name === "qa-runner" ? QA_SHIM : ""}
</body></html>`;
}

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: "2mb" }));

// ── Auth gate ─────────────────────────────────────────────────────────────────
// Active ONLY when DEMO_PASSWORD is set, so local runs stay open and frictionless.
// MUST be set before exposing the app (tunnel/cloud) — the agent can run shell.
const DEMO_USER = process.env.DEMO_USER || "demo";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "";
function safeEq(a, b) {
  const ab = Buffer.from(String(a)), bb = Buffer.from(String(b));
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}
if (DEMO_PASSWORD) {
  app.use((req, res, next) => {
    const [scheme, b64] = (req.headers.authorization || "").split(" ");
    if (scheme === "Basic" && b64) {
      const [u, p] = Buffer.from(b64, "base64").toString().split(":");
      if (safeEq(u || "", DEMO_USER) && safeEq(p || "", DEMO_PASSWORD)) return next();
    }
    res.set("WWW-Authenticate", 'Basic realm="generic-agent", charset="UTF-8"');
    return res.status(401).send("Authentication required");
  });
  console.log(`🔒 Auth gate ON (user: ${DEMO_USER})`);
} else {
  console.log("🔓 Auth gate OFF — set DEMO_PASSWORD before exposing this app (tunnel/cloud).");
}

app.use(express.static(path.join(__dirname, "public")));

app.get("/widgets/:name", async (req, res) => {
  const name = req.params.name;
  if (!WIDGETS[name]) return res.status(404).send("Unknown widget");
  try {
    res.type("html").send(await widgetHtml(name));
  } catch (e) {
    res.status(500).send(String(e.message || e));
  }
});

app.post("/run", async (req, res) => {
  const prompt = (req.body && req.body.prompt) || "";
  const mode = (req.body && req.body.mode) || "build";
  const systemPrompt = mode === "qa" ? SYSTEM_QA : SYSTEM;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  if (!prompt.trim()) {
    send("error", { message: "Empty prompt" });
    return res.end();
  }
  send("meta", { workspace: WORKSPACE, model: MODEL });

  try {
    const messages = [{ role: "user", content: prompt }];
    for (let step = 0; step < 60; step++) {
      const stream = client.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: systemPrompt,
        tools: TOOLS,
        messages,
      });
      stream.on("text", (t) => send("text", t));
      const final = await stream.finalMessage();
      messages.push({ role: "assistant", content: final.content });

      if (final.stop_reason !== "tool_use") break;

      const results = [];
      for (const block of final.content) {
        if (block.type !== "tool_use") continue;
        send("tool", { name: block.name, input: block.input });
        const output = await runTool(block.name, block.input);
        send("tool_result", { name: block.name, output: output.slice(0, 2000) });
        results.push({ type: "tool_result", tool_use_id: block.id, content: output });
      }
      messages.push({ role: "user", content: results });
    }
    send("done", {});
  } catch (e) {
    send("error", { message: String(e.message || e) });
  }
  res.end();
});

await fs.mkdir(WORKSPACE, { recursive: true });
app.listen(PORT, () => {
  console.log(`generic-agent-web  →  http://localhost:${PORT}`);
  console.log(`workspace          →  ${WORKSPACE}`);
  console.log(`skills             →  ${SKILLS_DIR}`);
}).on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    // Fail loudly — never let a tunnel silently point at another (possibly ungated) server.
    console.error(`\n✖ Port ${PORT} is already in use by another process.`);
    console.error(`  Stop it first (an existing server here may be UNGATED — do not tunnel to it).`);
    process.exit(1);
  }
  throw err;
});
