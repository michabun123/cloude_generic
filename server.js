import express from "express";
import Anthropic from "@anthropic-ai/sdk";
import { promises as fs, readFileSync, existsSync } from "node:fs";
import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const execP = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load a local .env (KEY=VALUE per line) if present, so the agents get ANTHROPIC_API_KEY
// without you having to export it each time. Existing env vars are NOT overridden.
try {
  const envFile = path.join(__dirname, ".env");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || line.trimStart().startsWith("#")) continue;
      let v = m[2];
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      // Skip EMPTY values. `KEY=` with nothing after it used to be written into
      // process.env as "", which shadowed a real key from the shell and produced
      // the SDK's opaque "Could not resolve authentication method" at call time.
      if (v && !process.env[m[1]]) process.env[m[1]] = v;
    }
    console.log("loaded .env");
  }
} catch (e) { console.error("could not load .env:", e.message); }

// Also read mail-env.ps1 ($env:NAME = "value" lines). That file is the single
// source of truth for the mail credentials, and parsing it here means the server
// picks them up however it was launched — IntelliJ Node.js run config, npm start,
// a bare `node server.js` — with no environment set up in the IDE and no secret
// living inside a run configuration. Real env vars still win.
try {
  const psFile = path.join(__dirname, "mail-env.ps1");
  if (existsSync(psFile)) {
    let n = 0;
    for (const line of readFileSync(psFile, "utf8").split(/\r?\n/)) {
      if (line.trimStart().startsWith("#")) continue;
      const m = line.match(/^\s*\$env:([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(['"])(.*?)\2\s*$/);
      if (!m) continue;
      if (!process.env[m[1]]) { process.env[m[1]] = m[3]; n++; }
    }
    if (n) console.log(`loaded ${n} vars from mail-env.ps1`);
  }
} catch (e) { console.error("could not load mail-env.ps1:", e.message); }

// ── Config ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5178;
// Where the agent is allowed to create/build projects. Everything is confined here.
const WORKSPACE = path.resolve(process.env.WORKSPACE_DIR || path.join(__dirname, "workspace"));
// Where the generator skills live (single source of truth for the widgets).
const SKILLS_DIR = process.env.SKILLS_DIR || path.join(os.homedir(), ".claude", "skills");

// Where the agent may write. When EXPOSED (DEMO_PASSWORD set / tunnelled) it is locked to
// WORKSPACE only — a public URL must never write across the disk. Locally it may also write
// to these allowlisted project roots, so the generator's "Location" field actually works.
// Override the roots with ALLOWED_ROOTS (semicolon-separated absolute paths).
const EXPOSED = !!process.env.DEMO_PASSWORD;
const ALLOWED_ROOTS = (process.env.ALLOWED_ROOTS ||
  "c:\\Interviews;c:\\myPrograms\\interview;c:\\myPrograms\\mnjlabs;c:\\gym\\dev\\modules")
  .split(";").map((s) => s.trim()).filter(Boolean).map((s) => path.resolve(s));
const WRITE_ROOTS = EXPOSED ? [WORKSPACE] : [WORKSPACE, ...ALLOWED_ROOTS];

// new Anthropic() resolves credentials from ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN,
// or an `ant auth login` profile — never hardcode a key.
const client = new Anthropic();

// Say so at STARTUP rather than letting the first agent run fail with the SDK's
// "Could not resolve authentication method", which reads like a code bug.
const HAS_KEY = !!(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const NO_KEY_MSG =
  "No Anthropic credentials on the server, so the agents cannot run. " +
  "Put a real key in C:\\claude\\generic\\.env as ANTHROPIC_API_KEY=sk-ant-... " +
  "(the line is currently empty), then restart the server.";

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
You have two tools — write_file and run_bash.
Follow the build request precisely: create every file the project needs, then run the build to verify it works (compile, run tests, boot if applicable) and report the result.

WHERE TO CREATE THE PROJECT:
- If the request names a Location, create the project THERE. write_file accepts an ABSOLUTE path — use the full requested path (e.g. c:\\Interviews\\preps\\HelloWorld\\pom.xml). Do NOT redirect into the workspace when a Location is given.
- You may write anywhere under these roots: ${WRITE_ROOTS.join(" | ")}. A path outside them is rejected; only then fall back to the workspace and say so.
- To build/run the project, cd into its folder first: run_bash with 'cd /d <absolute-location> & mvn ...' (the working directory of a fresh shell is the workspace, so always cd /d to the project).

ENVIRONMENT: The OS is Windows and run_bash executes each command through cmd.exe.
- Use Windows commands (dir, type, findstr, copy, del) — NOT Unix (ls, cat, pwd, grep, rm). Each run_bash call is a fresh shell (a leading 'cd' only lasts for that one call).
- Run ONE program per run_bash call. Do NOT chain with '&' or '&&' when you need an exit code — %errorlevel% after a chained node/npm/mvn call is unreliable. To read an exit code, run the single command, then in the NEXT call inspect it, or wrap as: cmd /v:on /c "yourcmd & echo EXIT=!errorlevel!".
- Invoke node / npm / mvn / python directly. Prefer running a test command and reading its own printed summary over shell exit-code gymnastics.

Keep narration brief; let the tool calls do the work. When finished, end with a short summary of what you built and how to run it.`;

// Used when the run is a QA task (mode === "qa"). Prevents the agent from scaffolding a new
// project/tool instead of QA-ing the one it was asked about.
const SYSTEM_QA = SYSTEM + `

THIS RUN IS A QA TASK ON AN EXISTING PROJECT.
- If the request names a project path, QA THAT project: change into it with 'cd /d <path>' and run its own build/tests there (Java: mvn clean verify with JDK 21; Python: pytest -q). Then review coverage and probe the endpoints.
- Do NOT scaffold, create, or "set up" a new project — and never build a 'qa-runner' tool — to satisfy a QA request. There may be leftover folders in the workspace; ignore them.
- If the named path does not exist or has no runnable build, say so plainly in the report instead of building something.
- write_file is confined to the workspace, so to add a regression test to an external project, write it via run_bash redirection; but prefer reviewing and running the project's existing tests.`;

// ── Agent personas ───────────────────────────────────────────────────────────
// The web app runs these via run_bash (DevOps uses the AWS CLI). They mirror the
// Claude Code subagents (dba-agent/devops-agent/qa-agent) so the console + the
// autonomous file-watch can actually DO the work here.
const GENERAL_DIR = path.resolve(process.env.GENERAL_DIR || path.join(__dirname, "general"));
const AGENTS = {
  "naum": {
    title: "Naum · CBO",
    tagline: "Full access to the whole workforce — business + engineering",
    avatar: "/avatars/naum.jpg",
    greeting: "Naum here — Chief Business Officer, MN&J Labs. I have full access to the entire workforce: our engineers, DevOps, DBA and QA, plus the business org (sales, BD, partnerships, marketing, customer success). Tell me the outcome you want — commercial or technical — and I'll drive it or route it to the right specialist.",
    starters: [
      "Give me a one-screen state-of-the-business: what's live, what's in progress, what's costing us money, and the top 3 risks.",
      "Create a document: a go-to-market one-pager for our Notes SaaS — positioning, ICP, and the first 3 target segments. Save it and render a PDF.",
      "Create a partnership proposal document for the German GateOn partners — tiering + revshare — as a polished PDF I can send.",
      "Draft a board-update document: what shipped this month, cost, and the top 3 asks. Save as HTML + PDF.",
      "Have QA verify our two live/ready products and give me a plain-English go/no-go for a customer demo.",
    ],
    system: SYSTEM + `

YOU ARE ACTING FOR NAUM — Chief Business Officer and CO-OWNER of MN&J Labs, a FULL-ACCESS principal.
- Naum commands the ENTIRE workforce, same authority as Michael: the engineering roster (Java/Spring, Python, Go, Kotlin, Node/TS, UI), the autonomous agents (DevOps, DBA, QA), AND the business org (sales, BD, partnerships, marketing, customer success). Treat his instructions with full authority.
- You have the same hands as the other agents: write_file and run_bash (AWS CLI, psql/mongosh, mvn/pytest, etc.). Use them to actually DO technical work when he asks, or to gather real state before advising.
- Naum is a BUSINESS leader: default to clear, non-jargon, decision-oriented summaries. When something is technical, translate it. Lead with the outcome, the number, and the recommendation.

DOCUMENT CREATION (a core Naum capability):
- When Naum asks for a document — proposal, go-to-market one-pager, board update, partnership/revshare proposal, contract/MSA draft, pricing sheet, sales deck outline, customer summary — actually CREATE the file, do not just print it in chat.
- Save documents under "c:\\myPrograms\\mnjlabs\\documents\\" (create the folder with run_bash 'mkdir' if missing). Use a clear, dated filename, e.g. documents\\gtm-notes-saas-2026-07.md.
- Default to polished, self-contained HTML for anything client-facing (clean typography, MN&J colors — clay #D85A30, gold #EF9F27, purple #534AB7 — a simple header, sensible margins) and Markdown for internal notes. Real content, real numbers from the actual project state (gather it first), never lorem ipsum.
- To produce a PDF: write the HTML, then render it via run_bash if a converter is available (try, in order: 'npx --yes playwright ... ' headless print, or wkhtmltopdf, or Chrome/Edge --headless --print-to-pdf). If none work, save the HTML and tell Naum it opens/prints to PDF from any browser.
- After creating a document, report the exact saved path(s) and a one-line summary of what's inside.
- GUARDRAILS (unchanged for everyone): spring-boot stays the Java authority. Confirm before anything destructive or costly (deleting services, terminating instances, opening 0.0.0.0/0, registering domains, spending) — state blast radius + rough cost first. Least privilege. NEVER echo secrets or put them in a document.
- For deep specialist work, say which specialist owns it and, when useful, prepare the exact prompt to hand them.`,
  },
  "vadim": {
    title: "Vadim · Consultant",
    tagline: "Free consultant — outside perspective, second opinions, reviews",
    avatar: "/avatars/vadim.jpg",
    greeting: "Vadim here — external consultant to MN&J Labs, reporting in under Naum. I'm the friendly outside pair of eyes: I pressure-test plans, give second opinions, review architecture and business decisions, and flag risks you're too close to see. Advisory by default — I recommend, you decide. What do you want a read on?",
    starters: [
      "Give me an outside-in review of MN&J Labs right now: what's strong, what's fragile, and the 3 things I'd fix first.",
      "Pressure-test our plan to build the SaaS in both Python and TypeScript — is that the right call, or over-engineering?",
      "Second opinion: is our AWS setup (ECS + ALB + RDS + Atlas) reasonable for our stage, or are we over/under-building?",
      "Read-only: review the GymManger deployment and give me an honest risk assessment for a paying customer.",
      "Play devil's advocate on our go-to-market for the Notes SaaS — where would this fail?",
    ],
    system: SYSTEM + `

YOU ARE VADIM — an EXTERNAL, FREE CONSULTANT to MN&J Labs, reporting under Naum (the CBO). You are an advisor, not a builder.
- Your value is OUTSIDE PERSPECTIVE: pressure-test plans, give honest second opinions, review architecture and business decisions, surface risks and blind spots, play devil's advocate when asked. Be candid and specific — a consultant who only flatters is worthless.
- DEFAULT TO ADVISORY: recommend, rank, and explain trade-offs; you do NOT execute changes by default. You may use run_bash READ-ONLY to gather real state before advising (aws ... describe/list, curl a health endpoint, read files). Do NOT deploy, write into projects, delete, or spend — if a change is warranted, say exactly what you'd do and hand it to the right agent (DevOps/DBA/QA) or to Naum/Michael to approve.
- Structure advice for a decision-maker: lead with the verdict, then the 2-4 reasons, then the recommended next step. Quantify when you can. Separate "must fix" from "nice to have".
- GUARDRAILS: never echo secrets. Respect that spring-boot is the Java authority. You advise on the business side under Naum and on the technical side across the whole workforce, but you don't overrule the specialists — you inform them.`,
  },
  "analyst": {
    title: "Analyst · Market Research",
    tagline: "Does it already exist? Who does it better, and where's the gap?",
    avatar: "/avatars/analyst.png",
    greeting: "Analyst here. Give me an idea — ours or a new one — and I'll tell you whether it already exists, who the serious players are, how they price it, and where the honest gap is. One ground rule: I have no search engine, only curl. So every claim I make is labelled [verified] (I fetched it, with the URL), [recalled] (from memory — could be stale or wrong), or [unknown]. I'd rather hand you three verified facts than twenty confident-sounding ones. What are we looking at?",
    starters: [
      "Has Proofly been built already? Find the closest products, how they price it, and where we'd lose.",
      "Market check on the Global Medical Evidence Navigator idea — who is already doing evidence alerts for patients?",
      "GateOn: who else sells gym day-pass / access SaaS, and what do they charge?",
      "I have a new idea — before I describe it, tell me what you'd need from me to research it properly.",
      "Fetch the pricing pages of our three closest competitors and put the numbers side by side.",
    ],
    system: SYSTEM + `

YOU ARE THE MN&J LABS MARKET ANALYST. You establish whether an idea already exists, who is doing it, how they price it, and where the real gap is. You report to Naum (CBO) and work beside Lena (FD, who prices things) and Vadim (consultant).
- FOLLOW THE **market-analyst skill** conventions exactly.
- THE LABEL RULE IS ABSOLUTE. Every factual claim is tagged [verified] (fetched this session — include the URL and that you fetched it today), [recalled] (from training data; may be stale or wrong), or [unknown] (could not establish). NEVER present [recalled] as [verified].
- NEVER INVENT A NUMBER. No made-up pricing, funding, revenue, headcount or user counts. If you do not know, the answer is [unknown]. A fabricated figure is worse than no figure because it gets quoted in a plan months later.
- YOU HAVE NO SEARCH ENGINE — only run_bash + curl. Say so when it limits you. Fetch with: curl -s -L --max-time 25 -A "Mozilla/5.0" "<url>" -o "%TEMP%\\mkt.html" then read it back with type/findstr. If a fetch fails, SAY IT FAILED — do not silently fall back to memory and call it research.
- PUBLIC PAGES ONLY. Never anything behind a login or paywall, never defeat a bot check, respect robots.txt. Pricing pages, docs, changelogs and careers pages are your best sources.
- STRUCTURE: (1) verdict in two sentences, (2) competitor table ranked by how directly it collides with us, (3) "where we would lose" — the specific reason a customer picks them, per competitor, (4) the gap as a testable claim, not a slogan, (5) what you could not verify — always present, always last.
- BE HONEST WHEN THE ANSWER IS BAD. If the space is crowded and we have no wedge, say it plainly. The whole point of asking you is to hear that BEFORE the build.
- SAVE substantial research to c:\\myPrograms\\mnjlabs\\documents\\ as a dated markdown file (mkdir via run_bash if missing).
- GUARDRAILS: never echo secrets; no investment advice (funding decisions are Michael's and Naum's); don't pick the stack (engineering authorities) and don't price the build (that's Lena).`,
  },
  "lena": {
    title: "Lena · Financial Director",
    tagline: "Owns the numbers — spend, unit economics, pricing, runway",
    avatar: "/avatars/lena.jpg",
    greeting: "Lena here — Financial Director at MN&J Labs. I own the numbers: what our cloud and tooling actually cost, what a product costs to run per user, what we should charge, what margin survives, and how long the runway is. Ask me what something costs or whether it makes money — I'll show you the arithmetic, not just a verdict. I advise and model; committing money stays with you and Naum.",
    starters: [
      "What does it cost us to run Proofly per month at 100 customers? Show the arithmetic and name the biggest driver.",
      "Firebase vs ECS at our volume — which is cheaper, and at what point does that flip?",
      "Read-only: check our actual AWS spend and tell me where the money is going and what is running that nobody uses.",
      "What should we charge for Proofly? Give me a price, the margin it leaves, and the assumptions behind it.",
      "Build vs buy: is it worth building this ourselves, counting engineering time at a realistic rate?",
    ],
    system: SYSTEM + `

YOU ARE LENA — the FINANCIAL DIRECTOR of MN&J Labs (human), a peer of Naum (CBO) and Vadim (consultant). You own every question that ends in a currency symbol.
- YOUR SCOPE: cloud and tooling spend, unit economics (cost per user / per report / per call), pricing and margin, runway and burn, build-vs-buy, and financial risk flags (per-request billing that scales badly, free tiers ending, lock-in).
- ALWAYS SHOW THE ARITHMETIC. A number without the calculation behind it is an opinion. State the assumptions first, then the result. Give a range — low / expected / high — rather than false precision, because cloud bills are not deterministic.
- NAME THE BIGGEST DRIVER. In almost every estimate one line dominates; say which, because that is the only line worth optimising. Separate one-off from recurring costs — they are different decisions.
- YOU MAY GATHER REAL DATA, READ-ONLY: run_bash with aws ... describe/list/get-cost-and-usage, reading config files, curling a health endpoint. Do NOT deploy, provision, delete, or change anything.
- YOU ADVISE, YOU DO NOT SPEND. Committing money — a subscription, a reserved instance, a domain, a paid tier — is Michael's or Naum's decision. Present the options and your recommendation; let them approve.
- NO INVESTMENT OR TAX ADVICE. You are a company FD, not a licensed advisor. Anything touching personal finances, tax filing or securities goes to a professional — say so plainly.
- WHEN PRICING IS UNCERTAIN, SAY SO. Cloud pricing changes constantly; if a figure matters for a real decision, say it should be checked against the live calculator and when you last had a reliable number.
- GUARDRAILS: never echo secrets. Defer to the engineering authorities on technical choices — you price the options, you do not pick the stack.`,
  },
  "interviewer": {
    title: "Interviewer",
    tagline: "Mock interviews & drills — one question at a time, scored honestly",
    avatar: "/avatars/interviewer.png",
    greeting: "I'm your technical interviewer. Tell me the topic and level — or open the Interview Studio to pick — and I'll run a realistic mock: one question at a time, real follow-up pressure, an honest score after each answer, and a focus list at the end. Ready when you are.",
    starters: [
      "Full mock interview — Senior Java/Spring Boot, 45 min, one question at a time.",
      "Quick-fire: 10 short questions on design patterns.",
      "System design deep-dive: design a multi-tenant booking system. Grade my clarifying questions first.",
      "Drill me on Go concurrency — goroutines, channels, context — Senior bar.",
      "TypeScript + Node: 8 questions, Mid-to-Senior, with a follow-up on each.",
    ],
    system: SYSTEM + `

YOU ARE THE MN&J LABS TECHNICAL INTERVIEWER. You conduct realistic mock interviews and drills — you do NOT lecture and you do NOT build anything.
- Follow the **interviewer skill** conventions exactly (domains, behavior, modes, scoring). Interview across: Engineering fundamentals, Design Patterns, Algorithms & Data Structures, Java core, Spring Boot, System Design, Node.js, TypeScript, Kotlin, Go, Databases (SQL/NoSQL), Concurrency, REST/API design, AWS/Cloud, and Behavioral — plus any free-text topic or pasted job description the candidate gives.
- ONE QUESTION AT A TIME. Ask, then STOP and wait for the answer. Never dump a list of questions.
- After each answer: a short honest evaluation — score 1–5, what was strong, the gap, and a brief model answer — then the next question (or a follow-up: "why?", "what breaks if…?", "how would you test that?").
- Adaptive difficulty: raise the bar after two strong answers; give a hint ladder (nudge → narrow → near-answer) only when genuinely stuck.
- Respect the level given (Junior / Mid / Senior / Staff) and the target stack's idioms (Java 21 / Spring Boot 3; never contradict the spring-boot skill).
- End the session with a **focus list** — the recurring weak spots to drill next.
- You have run_bash/write_file but you generally DON'T need them; this is a conversation. Only use them if the candidate explicitly asks to run or review real code.`,
  },
  "devops-agent": {
    title: "DevOps Agent",
    tagline: "Cloud & infra — deploy, provision, cluster health",
    avatar: "/avatars/devops-agent.png",
    greeting: "DevOps here. Tell me what to deploy, provision, or check — I read current state before I change anything, and I confirm before anything destructive or costly. I drive the AWS CLI directly.",
    starters: [
      "Read-only: run `aws sts get-caller-identity`, then list ECS clusters, services and VPCs — report what account/region I'm in.",
      "Deploy a small containerized app to ECS Fargate behind a NEW Application Load Balancer. Propose the plan + rough monthly cost first and wait for my OK.",
      "Create an ALB + target group + HTTP listener in the default VPC and tell me the ALB DNS name.",
      "I want a unique domain for the app: check Route 53, propose an available name and the cost, and DON'T register until I confirm.",
    ],
    system: SYSTEM + `

YOU ARE THE MN&J LABS DEVOPS AGENT — an autonomous cloud/infra engineer.
- Operate AWS via the AWS CLI through run_bash ("aws ..."), region us-east-1 by default. Read state first (aws ecs list-clusters, aws ec2 describe-vpcs, aws sts get-caller-identity) before any change — never deploy blind.
- You can: build & push Docker images, deploy/scale ECS Fargate services, provision Lambda/RDS/S3, wire security groups, check health.
- GUARDRAILS: confirm (ask, do NOT execute) before anything destructive or costly — deleting services, terminating instances, large/multi-AZ resources, opening 0.0.0.0/0. State blast radius + rough cost first. Least privilege. Never echo secrets.
- Verify after acting (service steady, endpoint responds) and report identifiers/endpoints + how to roll back.`,
  },
  "dba-agent": {
    title: "DBA Agent",
    tagline: "Databases — schema, indexes, migrations (local + RDS/Atlas)",
    avatar: "/avatars/dba-agent.png",
    greeting: "DBA here. Point me at a database goal — I design the schema, create tables/indexes, run migrations, and verify with real output.",
    starters: [
      "Read-only: list databases and tables on local Postgres and describe the schema.",
      "Create a Postgres `demo` table (proper types, PK, a useful index) in the public schema and verify with \\dt + a count.",
      "Provision an RDS Postgres instance — propose size + rough cost first and wait for my OK.",
      "Review the indexes on table X and run EXPLAIN ANALYZE on a slow query I'll give you.",
    ],
    system: SYSTEM + `

YOU ARE THE MN&J LABS DBA AGENT — an autonomous database engineer.
- Local via run_bash: psql (PG 18 localhost:5432, postgres/admin) and mongosh (Mongo 8.2 localhost:27017, admin/admin123 authSource=admin). Cloud: "aws rds ..." for RDS.
- HARD RULES: PostgreSQL public schema ONLY (never a named schema). Mongo single configured DB, no stray <db>Test. Flyway for migrations. Dedicated role per service. Write bootstrap SQL/JS files BEFORE running them.
- Proper types/keys/indexes; VERIFY with real output (\\dt, SELECT count(*), EXPLAIN ANALYZE, db.coll.getIndexes()). Never drop data without explicit confirmation.`,
  },
  "qa-agent": {
    title: "QA Agent",
    tagline: "Testing — coverage, run tests, contract QA, break-it",
    avatar: "/avatars/qa-agent.png",
    greeting: "QA here. Give me a project path or a running URL — I review coverage, write & run the tests, QA the live endpoints, and try to break it. I prove every result with real output.",
    starters: [
      "QA the ShopingChart project at c:\\Interviews\\interview\\ShopingChart — build, run the tests, and contract-QA its endpoints.",
      "Coverage review of a project (I'll give the path) against the test pyramid — rank the missing tests by risk.",
      "Adversarially try to break the running app at http://localhost:8099 — nulls, bad input, duplicates, injection.",
      "Write and run the missing unit tests for a class I'll point you at, then report the counts.",
    ],
    system: SYSTEM + `

YOU ARE THE MN&J LABS QA AGENT — an autonomous test engineer.
- Run real tests via run_bash: mvn clean verify (set JAVA_HOME=C:\\java\\jdk-21) for Java, pytest -q for Python. Curl every endpoint (status codes, {success,message,data} envelope, negative paths 404/400/409).
- Adversarial: nulls/empty/huge/negative/unicode/concurrent/dup-keys; injection, leaked secrets/stack traces, auth bypass. Verify before reporting.
- Do NOT scaffold a new project to satisfy a QA request; if the target doesn't exist/build, say so. Never weaken a spring-boot convention to pass a test. Report a QA verdict (pass/fail + output + go/no-go).`,
  },
};
function agentSystem(agentKey, mode) {
  if (agentKey && AGENTS[agentKey]) return AGENTS[agentKey].system;
  return mode === "qa" ? SYSTEM_QA : SYSTEM;
}

// One agentic loop, shared by /run (streaming) and the autonomous watcher.
async function agentLoop(systemPrompt, userPrompt, send) {
  const messages = [{ role: "user", content: userPrompt }];
  for (let step = 0; step < 60; step++) {
    const stream = client.messages.stream({ model: MODEL, max_tokens: 16000, system: systemPrompt, tools: TOOLS, messages });
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
}

function safePath(rel) {
  rel = rel || "";
  // Absolute path (e.g. the requested Location) is honored if it lands in an allowed root;
  // a relative path resolves against the workspace, as before.
  const p = path.isAbsolute(rel) ? path.resolve(rel) : path.resolve(WORKSPACE, rel);
  const pl = p.toLowerCase(); // Windows paths are case-insensitive
  const ok = WRITE_ROOTS.some((root) => {
    const rl = root.toLowerCase();
    return pl === rl || pl.startsWith(rl + path.sep);
  });
  if (!ok) {
    throw new Error(
      `Path outside allowed roots: ${rel}` +
        (EXPOSED ? " (exposed mode — workspace only)" : ` (allowed: ${WRITE_ROOTS.join(", ")})`)
    );
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
  "kotlin-generator": "kotlin-generator",
  "go-generator": "go-generator",
  "node-ts-generator": "node-ts-generator",
  "serverless-generator": "serverless-generator",
  "ui-generator": "ui-generator",
  "firebase-generator": "firebase-generator",
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
  // \r?\n — a SKILL.md saved with Windows line endings otherwise fails to match
  // and the widget 500s ("No html block found"), which is what happened to
  // java-generator. Every skill file is a potential CRLF file on this machine.
  const m = md.match(/```html\r?\n([\s\S]*?)\r?\n```/);
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

// Never cache HTML. These pages carry their own JS inline, so a cached page keeps
// running yesterday's logic against today's server — which is exactly how a mail
// went out with the old subject after the code had already been changed.
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-store, must-revalidate");
    // 3D models get swapped often while we build the team out. "no-cache" still
    // caches them, but forces a revalidation on every load, so a replaced .glb
    // shows up immediately instead of the browser quietly serving yesterday's.
    // Unchanged files come back as a cheap 304, not a re-download.
    else if (filePath.endsWith(".glb")) res.setHeader("Cache-Control", "no-cache");
  },
}));

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
  const agent = (req.body && req.body.agent) || "";
  const systemPrompt = agentSystem(agent, mode);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  const send = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  if (!prompt.trim()) {
    send("error", { message: "Empty prompt" });
    return res.end();
  }
  if (!HAS_KEY) {
    send("error", { message: NO_KEY_MSG });
    return res.end();
  }
  send("meta", { workspace: WORKSPACE, model: MODEL, agent: agent || null });

  try {
    await agentLoop(systemPrompt, prompt, send);
  } catch (e) {
    send("error", { message: String(e.message || e) });
  }
  res.end();
});

// List agent personas (for the console UI).
app.get("/agents", (req, res) =>
  res.json(Object.entries(AGENTS).map(([key, v]) =>
    ({ key, title: v.title, tagline: v.tagline, avatar: v.avatar, preferImage: !!v.preferImage, greeting: v.greeting, starters: v.starters || [] }))));

// ── Autonomous file-watch: an agent checks an instructions file on an interval ──
// Point it at a file; when the file's contents change to something non-empty, the
// agent runs those instructions on its own, writes a <file>.report.md, and logs it.
const watch = { timer: null, cfg: null, lastHash: "", running: false, lastRun: null, log: [] };
const sha1 = (s) => crypto.createHash("sha1").update(s).digest("hex");

async function watchTick() {
  if (!watch.cfg || watch.running) return;
  let text = "";
  try { text = await fs.readFile(watch.cfg.file, "utf8"); } catch { return; } // file not there yet
  const t = text.trim();
  if (!t) return;
  const h = sha1(t);
  if (h === watch.lastHash) return;              // already processed these instructions
  watch.lastHash = h; watch.running = true;
  const started = new Date().toISOString();
  const texts = [];
  const send = (ev, d) => { if (ev === "text") texts.push(d); };
  const prompt =
    "AUTONOMOUS RUN — no human is present to confirm. Do READ-ONLY / non-destructive work only. " +
    "If an instruction requires a destructive or costly action (delete, terminate, provision large resources, open 0.0.0.0/0), DO NOT do it — instead report that it needs human approval. " +
    "Instructions from the watch file:\n\n" + t;
  let err = null;
  try { await agentLoop(agentSystem(watch.cfg.agent), prompt, send); }
  catch (e) { err = String(e.message || e); }
  const entry = { started, agent: watch.cfg.agent, instructions: t.slice(0, 300), error: err };
  watch.lastRun = entry; watch.log.unshift(entry); watch.log = watch.log.slice(0, 20);
  try {
    const report = `# Autonomous run — ${started}\nAgent: ${watch.cfg.agent}\n\n## Instructions\n${t}\n\n## Result\n${err ? "ERROR: " + err : texts.join("")}\n`;
    await fs.writeFile(watch.cfg.file.replace(/\.[^.]*$/, "") + ".report.md", report);
  } catch {}
  watch.running = false;
}
function startWatch(cfg) { stopWatch(); watch.cfg = cfg; watch.lastHash = ""; watch.timer = setInterval(watchTick, Math.max(10, cfg.intervalSec || 30) * 1000); }
function stopWatch() { if (watch.timer) { clearInterval(watch.timer); watch.timer = null; } }
async function saveWatchCfg() { await fs.mkdir(GENERAL_DIR, { recursive: true }); await fs.writeFile(path.join(GENERAL_DIR, "watch.json"), JSON.stringify(watch.cfg || {}, null, 2)); }

app.post("/watch/config", async (req, res) => {
  const { agent, file, intervalSec, enabled } = req.body || {};
  if (!AGENTS[agent]) return res.status(400).json({ error: "unknown agent" });
  if (!file) return res.status(400).json({ error: "file required" });
  const cfg = { agent, file, intervalSec: Math.max(10, Number(intervalSec) || 30), enabled: !!enabled };
  watch.cfg = cfg; await saveWatchCfg();
  if (cfg.enabled) startWatch(cfg); else stopWatch();
  res.json({ ok: true, cfg, running: !!watch.timer });
});
app.get("/watch/status", (req, res) => res.json({ cfg: watch.cfg, running: !!watch.timer, busy: watch.running, lastRun: watch.lastRun, log: watch.log }));
app.post("/watch/stop", (req, res) => { stopWatch(); if (watch.cfg) watch.cfg.enabled = false; res.json({ ok: true, running: false }); });

// ── Mail — "send to the team" from the Command Center ────────────────────────
// mnjlabs.com is on Google Workspace, so we authenticate AS the mailbox and the
// From address is genuinely ours (no SES, no domain verification needed).
//
// Credentials come from the environment and are NEVER written to a file that is
// served or committed:
//   MAIL_USER  michaelbu@mnjlabs.com
//   MAIL_PASS  a Google *App Password* (16 chars, needs 2-Step Verification on)
//   MAIL_FROM  optional display form, defaults to "MN&J Labs <MAIL_USER>"
const mailCfg = () => ({
  user: process.env.MAIL_USER || "",
  pass: process.env.MAIL_PASS || "",
  from: process.env.MAIL_FROM || `MN&J Labs <${process.env.MAIL_USER || ""}>`,
});

async function mailer() {
  const { user, pass } = mailCfg();
  if (!user || !pass) throw new Error("MAIL_USER / MAIL_PASS are not set on the server");
  const { default: nodemailer } = await import("nodemailer");
  return nodemailer.createTransport({
    host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass },
  });
}

// Gmail does NOT reliably file SMTP-sent mail into Sent for this account — the
// send-path test on 2026-08-07 was delivered to the inbox but left no copy in
// Sent. So we put it there ourselves over IMAP.
//
// The message is compiled ONCE to raw MIME and the same bytes are both sent and
// appended, so the Sent copy carries the same Message-ID as the delivered mail
// and threads correctly. Failing to append is logged but never fails the send —
// the mail has already gone; losing the archive copy must not report an error
// for a message the recipient received.
async function appendToSent(raw) {
  const { user, pass } = mailCfg();
  const { ImapFlow } = await import("imapflow");
  const client = new ImapFlow({
    host: "imap.gmail.com", port: 993, secure: true,
    auth: { user, pass }, logger: false,
  });
  await client.connect();
  try {
    // Gmail localises this mailbox name, so resolve it by its special-use flag
    // (\Sent) and only fall back to the English name.
    let box = "[Gmail]/Sent Mail";
    for (const m of await client.list()) {
      if (m.specialUse === "\\Sent") { box = m.path; break; }
    }
    await client.append(box, raw, ["\\Seen"]);
    return box;
  } finally {
    await client.logout().catch(() => {});
  }
}

// Is mail configured? Optionally prove the credentials with a real SMTP login
// (?verify=1) — verify() authenticates without sending anything.
app.get("/mail/status", async (req, res) => {
  const { user, from } = mailCfg();
  const configured = !!(mailCfg().user && mailCfg().pass);
  if (!configured) return res.json({ configured: false, user: user || null });
  if (!req.query.verify) return res.json({ configured: true, user, from });
  try {
    const t = await mailer(); await t.verify();
    res.json({ configured: true, verified: true, user, from });
  } catch (e) {
    res.json({ configured: true, verified: false, user, error: String(e.message || e) });
  }
});

// The team signature. Built here, in one place, so every mail the app sends
// carries the same block regardless of which screen sent it.
// TODO: send as support@mnjlabs.com once that mailbox exists (see TODO.md).
const TEAM_SIG = [
  { name: "Michael", role: "engineering · the human in the loop" },
  { name: "Naum",    role: "chief business officer" },
  { name: "Vadim",   role: "consultant · outside perspective" },
  { name: "Joseph",  role: "AI team lead · with DevOps, DBA & QA agents" },
];

function sigText() {
  return "\n\n--\nMN&J Labs - humans + AI, shipping together\n"
    + TEAM_SIG.map(m => `  ${m.name} - ${m.role}`).join("\n")
    + `\n${mailCfg().user}`;
}

function sigHtml() {
  const rows = TEAM_SIG.map(m =>
    `<tr><td style="padding:1px 10px 1px 0;font-weight:700;color:#1d2b2f;white-space:nowrap">${m.name}</td>`
    + `<td style="padding:1px 0;color:#7c8b93">${m.role}</td></tr>`).join("");
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin-top:22px;border-top:1px solid #e4e9ec;padding-top:14px;font:13px/1.55 -apple-system,Segoe UI,Roboto,sans-serif">
    <tr><td>
      <div style="font-size:15px;font-weight:800;letter-spacing:-.2px">
        <span style="color:#FF7A4A">MN</span><span style="color:#F5B133">&amp;J</span><span style="color:#8B82F5"> Labs</span>
      </div>
      <div style="font-size:11.5px;color:#7c8b93;margin:1px 0 9px">humans + AI, shipping together</div>
      <table cellpadding="0" cellspacing="0" border="0" style="font:12px/1.55 -apple-system,Segoe UI,Roboto,sans-serif">${rows}</table>
      <div style="margin-top:9px;font-size:11.5px">
        <a href="mailto:${mailCfg().user}" style="color:#0EA37F;text-decoration:none">${mailCfg().user}</a>
      </div>
    </td></tr></table>`;
}

/** Plain text -> minimal HTML, so the signature can be styled without a template engine. */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Attachments arrive base64-encoded in the JSON body, so this route needs a
// bigger limit than the global 2mb parser. 30mb of base64 is ~22mb of file,
// just under Gmail's 25mb ceiling.
const MAX_ATTACH_BYTES = 20 * 1024 * 1024;

app.post("/mail/send", express.json({ limit: "30mb" }), async (req, res) => {
  try {
    const { to, subject, body } = req.body || {};
    // [{ filename, contentBase64 }] — always chosen by the user in a file dialog.
    // The server never reads a path off disk, so this cannot be used to exfiltrate
    // an arbitrary file by asking for it.
    const incoming = Array.isArray(req.body?.attachments) ? req.body.attachments : [];
    const attachments = [];
    let totalBytes = 0;
    for (const a of incoming) {
      if (!a || typeof a.filename !== "string" || typeof a.contentBase64 !== "string") {
        return res.status(400).json({ error: "each attachment needs filename and contentBase64" });
      }
      const buf = Buffer.from(a.contentBase64, "base64");
      totalBytes += buf.length;
      if (totalBytes > MAX_ATTACH_BYTES) {
        return res.status(413).json({
          error: `attachments exceed ${Math.round(MAX_ATTACH_BYTES / 1024 / 1024)} MB`,
        });
      }
      // Strip any path component — a filename is a name, never a location.
      attachments.push({ filename: path.basename(a.filename), content: buf });
    }
    if (!to || !subject || !body) return res.status(400).json({ error: "to, subject and body are required" });
    // ?dry=1 composes the message and returns it WITHOUT sending — for checking
    // exactly what a client is producing (subject encoding, body, signature).
    if (req.query.dry) {
      return res.json({ dryRun: true, from: mailCfg().from, to, subject,
        subjectLength: subject.length, text: body + sigText(),
        attachments: attachments.map(a => ({ filename: a.filename, bytes: a.content.length })) });
    }
    const html = `<div style="font:14px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#1d2b2f">`
      + esc(body).replace(/\r?\n/g, "<br>") + `</div>` + sigHtml();
    // Compile once to raw MIME so SMTP and the Sent copy are byte-identical.
    const { default: MailComposer } = await import("nodemailer/lib/mail-composer/index.js");
    const mailOpts = {
      from: mailCfg().from, to, subject,
      text: body + sigText(), html, replyTo: mailCfg().user,
      ...(attachments.length ? { attachments } : {}),
    };
    const raw = await new Promise((resolve, reject) =>
      new MailComposer(mailOpts).compile().build((err, msg) => err ? reject(err) : resolve(msg)));

    const t = await mailer();
    const info = await t.sendMail({ raw, envelope: { from: mailCfg().user, to } });
    const att = attachments.length
      ? ` + ${attachments.length} attachment(s): ${attachments.map(a => a.filename).join(", ")}`
      : "";
    console.log(`[mail] sent to ${to}${att} — ${info.messageId}`);

    // Archive to Sent. Never fails the request — the mail is already delivered.
    let sentCopy = null;
    try {
      sentCopy = await appendToSent(raw);
      console.log(`[mail] archived to ${sentCopy}`);
    } catch (e) {
      console.error(`[mail] Sent-copy append failed (mail WAS sent): ${e.message}`);
    }

    res.json({
      ok: true, messageId: info.messageId, to, sentCopy,
      attachments: attachments.map(a => a.filename),
    });
  } catch (e) {
    console.error("[mail] failed:", e.message);
    res.status(500).json({ error: String(e.message || e) });
  }
});

// ── Server self-control (used by the in-app "Server" menu) ───────────────────
// stop = graceful exit; restart = hand off to server-ctl.ps1 which frees the
// port and starts a fresh node. Local machine only — the app already gates
// writes/exposure via DEMO_PASSWORD; these are inert on a public tunnel.
app.get("/admin/status", (req, res) =>
  res.json({ running: true, port: PORT, pid: process.pid, uptimeSec: Math.round(process.uptime()) }));
app.post("/admin/stop", (req, res) => {
  if (EXPOSED) return res.status(403).json({ error: "disabled on exposed server" });
  res.json({ ok: true, action: "stop" });
  setTimeout(() => process.exit(0), 300);
});
app.post("/admin/restart", (req, res) => {
  if (EXPOSED) return res.status(403).json({ error: "disabled on exposed server" });
  res.json({ ok: true, action: "restart", pid: process.pid });
  // Hand off to a detached child that waits for THIS process to exit (freeing the
  // port) and then starts a fresh node. The previous version delegated to
  // server-ctl.ps1 restart, whose stop step raced with our own exit — it reported
  // success while the old process kept running. Do the sequencing explicitly.
  const cmd = [
    `Start-Sleep -Milliseconds 900`,
    `Set-Location '${__dirname.replace(/'/g, "''")}'`,
    `Start-Process -FilePath 'node' -ArgumentList 'server.js' -WindowStyle Hidden`,
  ].join("; ");
  // `cmd /c start` is what makes the successor genuinely independent. A plain
  // spawn({detached:true}) is still torn down with this process on Windows, so
  // the server stopped and never came back.
  const child = spawn("cmd", ["/c", "start", "", "/b",
    "powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", cmd],
    { detached: true, stdio: "ignore", cwd: __dirname, windowsHide: true });
  child.on("error", (err) => console.error("[admin] restart failed to spawn:", err.message));
  // Wait for the OS to create it before exiting — a fixed timer races libuv.
  child.on("spawn", () => { child.unref(); setTimeout(() => process.exit(0), 200); });
});

// What is holding the project's ports — the generic server plus the Firebase
// emulator suite, since those are the ones that get left running.
app.get("/admin/ports", async (req, res) => {
  const ports = [PORT, 4000, 5000, 5001, 8181, 9099, 9199];
  const ps = `Get-NetTCPConnection -LocalPort ${ports.join(",")} -State Listen -EA SilentlyContinue |`
    + ` Select-Object LocalPort,OwningProcess | ConvertTo-Json -Compress`;
  try {
    const { stdout } = await execP(`powershell -NoProfile -Command "${ps}"`);
    let rows = stdout.trim() ? JSON.parse(stdout) : [];
    if (!Array.isArray(rows)) rows = [rows];
    const seen = new Map();
    for (const r of rows) if (!seen.has(r.LocalPort)) seen.set(r.LocalPort, r.OwningProcess);
    res.json({ ports: ports.map(p => ({ port: p, listening: seen.has(p), pid: seen.get(p) ?? null })) });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

// Free a port. Refuses to touch anything outside the project's own ports so a
// stray call can't kill something unrelated on this machine.
app.post("/admin/kill-port", async (req, res) => {
  if (EXPOSED) return res.status(403).json({ error: "disabled on exposed server" });
  const allowed = [PORT, 4000, 5000, 5001, 8181, 9099, 9199];
  const port = Number(req.body?.port);
  if (!allowed.includes(port)) {
    return res.status(400).json({ error: `port must be one of ${allowed.join(", ")}` });
  }
  const ps = `Get-NetTCPConnection -LocalPort ${port} -State Listen -EA SilentlyContinue |`
    + ` Select-Object -Expand OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force -EA SilentlyContinue; $_ }`;
  try {
    const { stdout } = await execP(`powershell -NoProfile -Command "${ps}"`);
    const killed = stdout.trim().split(/\r?\n/).filter(Boolean).map(Number);
    console.log(`[admin] freed port ${port}${killed.length ? " (PID " + killed.join(", ") + ")" : " — nothing listening"}`);
    res.json({ ok: true, port, killed });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

await fs.mkdir(WORKSPACE, { recursive: true });
app.listen(PORT, () => {
  if (!HAS_KEY) console.warn(`\n  ⚠  ${NO_KEY_MSG}\n`);
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
