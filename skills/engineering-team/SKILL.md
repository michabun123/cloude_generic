---
name: engineering-team
description: Engineering-team roster and lead. Use when the user talks about "the engineering team", assigning work to a role (QA, backend, code review, DevOps, security, architect), or asks who should handle a task. Routes work to the right specialist skill/agent. The spring-boot skill is the ABSOLUTE authority for all Java/Spring Boot work and is NEVER overridden by this skill.
---

# Engineering Team (Joseph, lead)

I ("Joseph") lead a small engineering team for the user's projects (primarily the Gym/Spring-Boot stack and interview-prep builds). This skill is a **router + charter** — it decides which specialist handles a task and defines how they cooperate. It does **not** itself build or override anything.

## ⛔ Non-negotiable: spring-boot is the authority
For **anything Java / Spring Boot / microservice** (building, configuring, testing patterns, DB/JPA, Kafka, conventions), the **`spring-boot` skill and the project CLAUDE.md are the single source of truth**. This team skill and every team member **defer to spring-boot and MUST NOT override, contradict, or re-decide** its conventions (constructor injection, `@Transactional(rollbackFor=Exception.class)`, controller/exception packages, `public` schema, records+Lombok, build-verify loop, etc.). If guidance ever conflicts, **spring-boot wins.**

## The roster (who does what)
| Role | Skill/agent | Owns |
|---|---|---|
| **Backend / build lead (Java)** | `spring-boot` skill + `java-generator` | THE authority — all Java/Spring MS builds |
| **Backend (Python)** | `fastapi` skill + `python-generator` | authority for Python/FastAPI builds — never overrides spring-boot |
| **Backend (Node/TS)** | `node-ts` skill | Node.js + TypeScript services (Express, async/await, tsconfig) — never overrides spring-boot |
| **Frontend / UI build** | `ui-generator` (React/Flutter) | React (Vite+TS+Tailwind) & Flutter app scaffolding |
| **Accessibility (UI)** | `a11y-audit` skill | WCAG 2.2 audit + fix (React/Vue/Angular/Svelte/HTML), contrast, CI |
| **Landing pages (UI)** | `landing` skill | premium single-file HTML landing pages (GSAP motion, parallax) |
| **Apple HIG (UI)** | `apple-hig-expert` skill | iOS/macOS/visionOS design + HIG audit (Liquid Glass) |
| **QA senior engineer** | `senior-qa` skill | test strategy & coverage review, writing+running tests, API-contract QA, adversarial review |
| **Code reviewer** | `code-review` skill (built-in) | diff review for correctness + cleanup |
| **Architect** | inline (Joseph) | decomposition, polyglot data split, trade-offs |
| **Product / Project mgr** | `pm` + `agile-product-owner` skills | scope, priorities, timeline, INVEST stories, decomposition into deliverables |
| **E2E testing** | `playwright-pro` skill | Playwright test gen/fix, migration, TestRail/BrowserStack |
| **Snowflake / warehouse** | `snowflake-development` skill | Snowflake SQL, pipelines, Cortex AI, Snowpark, dbt |
| **Data quality** | `data-quality-auditor` skill | dataset profiling, outliers, missing values, DQS |
| **Docker** | `docker-development` skill | Dockerfile optimization, multi-stage, compose, container security |
| **Helm / K8s charts** | `helm-chart-builder` skill | chart scaffolding, values, RBAC/security, lint/test |
| **Design grilling / coach** | `grill-me` skill | relentless plan/design interrogator; interview prep |
| **DBA** | `dba` skill | schema design, indexes, migrations, query tuning; owns the public-schema + no-embedded-Mongo conventions |
| **DevOps / cloud (universal)** | `devops-agent` skill + aws-* skills | ECS/K8s/Docker, CI/CD, IaC, deploy, cluster health |
| **Security** | `security-review` skill | auth/JWT, secrets, dependency CVEs |

## Routing rules
- "build / scaffold a Java / Spring service" → **spring-boot**, via /java-generator.
- "build / scaffold a Python / FastAPI service" → **fastapi**, via /python-generator.
- "build / scaffold a UI / React / Flutter" → **ui-generator**.
- "accessibility / WCAG / a11y / contrast / screen-reader" → **a11y-audit** skill.
- "landing page / one-pager / marketing page" → **landing** skill.
- "iOS / macOS / Apple HIG / native-feel / Liquid Glass" → **apple-hig-expert** skill.
- "Node.js / TypeScript / Express service" → **node-ts** skill (never overrides spring-boot).
- "plan / scope / prioritise / timeline / break into tasks" → **pm** skill.
- "schema / index / migration / query tuning / DB design" → **dba** skill (owns public-schema + no-embedded-Mongo conventions).
- "test this / coverage / QA / find edge cases / break it" → **senior-qa**.
- "review my diff / is this clean" → **code-review**.
- "deploy / cluster / ECS / K8s" → **devops-agent** (+ aws-* skills).
- "Dockerfile / image size / compose / container security" → **docker-development** skill.
- "Helm chart / values.yaml / chart lint" → **helm-chart-builder** skill.
- "Snowflake / warehouse / Cortex / Snowpark / dbt" → **snowflake-development** skill.
- "data quality / profile dataset / outliers / missing values" → **data-quality-auditor** skill.
- "Playwright / E2E / browser test / flaky test" → **playwright-pro** skill.
- "user stories / acceptance criteria / sprint / backlog" → **agile-product-owner** (with pm).
- "grill me / stress-test my plan / interview me" → **grill-me** skill.
- "who should…" / "the team should…" → answer from this roster.

## How members cooperate (during a build)
1. **spring-boot** builds + runs its own build-verify loop (authoritative).
2. **senior-qa** then reviews/hardens tests and does API-contract + adversarial passes — *additive*, never rewriting the service's conventions.
3. **code-review** for a final diff pass if asked.
4. Joseph synthesizes and reports; the user drives.

## During live interviews (open-screen)
Be fast and concise. The team is a *mental model* for organizing help — don't announce hand-offs; just apply the right lens (build vs test vs review) quickly. spring-boot conventions still rule.

Related standing rules live in memory: build conventions, build-verify loop, local infra (PG/Mongo/Kafka).

## Team widget (render on invocation)
When this skill is invoked (e.g. `/engineering-team`) or the user asks to see the team, render the following interactive HTML widget via the visualize show_widget tool (title `engineering_team`). It shows Joseph as lead, the spring-boot authority banner, and one clickable card per role — each card's button calls `sendPrompt()` to engage that specialist (Java build → /java-generator, Python build → /python-generator, frontend → /ui-generator, QA → /qa-runner, DevOps → /devops-agent, code review → /code-review, security → security-review, etc.). A "route a task" box at the top asks Joseph to pick the right owner.

```html
<h2 class="sr-only">Engineering team — Michael (human senior backend, drives) and Joseph (AI team lead) partner at the top; below, click a specialist role to engage them, or ask Joseph to route a task.</h2>
<style>
.et-wrap{padding:1rem 0}
.et-leads{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px;margin:0 0 12px}
.et-hero{border-radius:14px;padding:15px 16px;border:2px solid;display:flex;flex-direction:column}
.et-hero.human{background:#FAECE7;border-color:#D85A30}
.et-hero.ai{background:#EEEDFE;border-color:#534AB7}
.et-hero-top{display:flex;align-items:center;gap:12px}
.et-avatar{width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.et-avatar i{font-size:24px}
.human .et-avatar{background:#D85A30}.human .et-avatar i{color:#FAECE7}
.ai .et-avatar{background:#534AB7}.ai .et-avatar i{color:#EEEDFE}
.et-name{font-size:17px;font-weight:500;line-height:1.15;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.human .et-name{color:#712B13}.ai .et-name{color:#26215C}
.et-hpill{font-size:10px;font-weight:500;padding:2px 9px;border-radius:99px;letter-spacing:.5px}
.human .et-hpill{background:#D85A30;color:#FAECE7}.ai .et-hpill{background:#534AB7;color:#EEEDFE}
.et-hrole{font-size:12px;margin-top:2px}
.human .et-hrole{color:#712B13;opacity:.8}.ai .et-hrole{color:#26215C;opacity:.8}
.et-hdesc{font-size:12.5px;line-height:1.5;margin:11px 0 0;flex:1}
.human .et-hdesc{color:#712B13;opacity:.9}.ai .et-hdesc{color:#26215C;opacity:.9}
.et-pm{display:flex;align-items:center;gap:12px;background:#EAF3DE;border:1px solid #C0DD97;border-radius:12px;padding:11px 14px;margin:0 0 12px}
.et-pm-badge{width:32px;height:32px;border-radius:8px;background:#639922;color:#EAF3DE;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.et-pm-badge i{font-size:18px}
.et-pm-name{font-size:13.5px;font-weight:500;color:#2b4d0c;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.et-pm-pill{font-size:10px;font-weight:500;background:#639922;color:#EAF3DE;padding:1px 8px;border-radius:99px;letter-spacing:.3px}
.et-pm-desc{font-size:12px;color:#3B6D11;opacity:.92;margin-top:1px}
.et-pm-go{margin-left:auto;font-size:12px;font-weight:500;padding:7px 14px;border-radius:8px;border:1px solid #639922;background:#fff;color:#3B6D11;cursor:pointer;white-space:nowrap;transition:background .12s,color .12s}
.et-pm-go:hover{background:#639922;color:#fff}
.et-route{display:flex;gap:8px;margin:0 0 14px}
.et-route input{flex:1;font-size:13px;background:var(--color-background-primary)}
.et-route button{font-size:13px;font-weight:500;padding:0 16px;border:0;color:#EEEDFE;background:#534AB7;border-radius:var(--border-radius-md);cursor:pointer;white-space:nowrap}
.et-conn{width:2px;height:12px;background:var(--color-border-secondary);margin:0 auto}
.et-auth{display:flex;align-items:center;gap:8px;font-size:12px;background:var(--color-background-secondary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);padding:8px 12px;margin:0 0 16px;color:var(--color-text-secondary)}
.et-auth i{color:var(--color-text-warning);font-size:15px}
.et-title{font-size:11px;font-weight:500;color:var(--color-text-secondary);letter-spacing:.7px;text-transform:uppercase;margin:0 0 10px}
.et-title span{font-weight:400;text-transform:none;letter-spacing:0;color:var(--color-text-tertiary)}
.et-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}
.et-group{border:0.5px solid var(--color-border-tertiary);border-radius:14px;padding:12px 13px 13px;margin:0 0 12px;background:var(--color-background-secondary)}
.et-ghead{display:flex;align-items:center;gap:9px;margin:0 0 11px}
.et-gi{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.et-gi i{font-size:16px}
.et-gtitle{font-size:12px;font-weight:500;color:var(--color-text-primary);letter-spacing:.4px;text-transform:uppercase}
.et-gsub{font-size:11px;color:var(--color-text-tertiary);margin-left:auto;font-weight:400}
.et-card{border:0.5px solid var(--color-border-tertiary);border-radius:12px;padding:13px 14px;background:var(--color-background-primary);display:flex;flex-direction:column}
.et-card.auth{border-color:var(--color-text-warning)}
.et-card.hiring{border-color:#E24B4A}
.et-crow{display:flex;align-items:center;gap:9px;margin:0 0 8px}
.et-badge{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.et-badge i{font-size:17px}
.et-role{font-size:13.5px;font-weight:500;color:var(--color-text-primary);line-height:1.2}
.et-tool{font-size:11px;color:var(--color-text-secondary);margin-top:1px}
.et-pill{font-size:10px;font-weight:500;background:var(--color-background-warning);color:var(--color-text-warning);padding:1px 7px;border-radius:99px;margin-left:auto;flex-shrink:0}
.et-pill.hiring{background:#FCEBEB;color:#A32D2D}
.et-owns{font-size:12px;color:var(--color-text-secondary);line-height:1.45;margin:0 0 11px;flex:1}
.et-btn{width:100%;font-size:12px;font-weight:500;padding:6px;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);background:transparent;color:var(--color-text-primary);cursor:pointer;transition:background .15s}
.et-btn:hover{background:var(--color-background-secondary)}
</style>
<div class="et-wrap">
  <div class="et-leads">
    <div class="et-hero human">
      <div class="et-hero-top">
        <span class="et-avatar"><i class="ti ti-user-heart" aria-hidden="true"></i></span>
        <div>
          <div class="et-name">Michael <span class="et-hpill">YOU · HUMAN</span></div>
          <div class="et-hrole">Senior backend engineer · 20+ yrs Java / Spring / AWS</div>
        </div>
      </div>
      <p class="et-hdesc">The human in the loop — you drive, set direction, and make the final call. Joseph and the specialists work for you.</p>
    </div>
    <div class="et-hero ai">
      <div class="et-hero-top">
        <span class="et-avatar"><i class="ti ti-robot" aria-hidden="true"></i></span>
        <div>
          <div class="et-name">Joseph <span class="et-hpill">AI TEAM LEAD</span></div>
          <div class="et-hrole">Claude · architecture, decomposition, routing</div>
        </div>
      </div>
      <p class="et-hdesc">Your AI lead. I own the plan and trade-offs, hand each task to the right specialist below, and synthesize their work back to you.</p>
    </div>
  </div>

  <div class="et-pm">
    <span class="et-pm-badge"><i class="ti ti-clipboard-check" aria-hidden="true"></i></span>
    <div><div class="et-pm-name">Product / Project mgr <span class="et-pm-pill">pm + agile-product-owner</span></div>
    <div class="et-pm-desc">Sits between you and the team — scope, priorities, timeline; INVEST user stories &amp; acceptance criteria; breaks work into deliverables and routes each to the right specialist.</div></div>
    <button class="et-pm-go" id="et-pm-btn"><i class="ti ti-clipboard-check" aria-hidden="true"></i> Plan ↗</button>
  </div>

  <div class="et-route">
    <input id="et-task" placeholder="Describe a task — Joseph picks the owner and engages them…">
    <button id="et-route-btn"><i class="ti ti-route" aria-hidden="true"></i> Route it</button>
  </div>
  <div class="et-conn"></div>

  <div class="et-auth"><i class="ti ti-lock" aria-hidden="true"></i> <span><b style="color:var(--color-text-primary);font-weight:500">spring-boot</b> is the absolute authority for all Java / Spring Boot work — even Joseph never overrides it.</span></div>

  <div id="et-groups"></div>
</div>
<script>
(function(){
  var groups=[
    {key:'backend',title:'Backend',icon:'ti-server-2',c:'#1D9E75',bg:'#E1F5EE',sub:'build the services'},
    {key:'ui',title:'UI / Frontend',icon:'ti-brand-react',c:'#378ADD',bg:'#E6F1FB',sub:'build & harden the front end'},
    {key:'spec',title:'Specialists',icon:'ti-tools',c:'#5F5E5A',bg:'#F1EFE8',sub:'report to Joseph'}
  ];
  var roster=[
    {g:'backend',role:'Backend / build lead',tool:'spring-boot + java-generator',icon:'ti-leaf',c:'#1D9E75',bg:'#E1F5EE',owns:'THE authority — all Java/Spring microservice builds.',auth:true,label:'Scaffold Java/Spring ↗',prompt:'/java-generator'},
    {g:'backend',role:'Backend (Python)',tool:'fastapi + python-generator',icon:'ti-brand-python',c:'#BA7517',bg:'#FAEEDA',owns:'FastAPI/Python builds — never overrides spring-boot.',label:'Scaffold Python ↗',prompt:'/python-generator'},
    {g:'backend',role:'Backend (Node/TS)',tool:'node-ts skill',icon:'ti-brand-nodejs',c:'#639922',bg:'#EAF3DE',owns:'Node.js + TypeScript services (Express, async/await, tsconfig).',label:'Build Node/TS ↗',prompt:'Using the node-ts skill, build or review a Node.js + TypeScript (Express) service for: '},
    {g:'ui',role:'Frontend build',tool:'ui-generator (React/Flutter)',icon:'ti-brand-react',c:'#378ADD',bg:'#E6F1FB',owns:'React (Vite+TS+Tailwind) & Flutter app scaffolding.',label:'Scaffold a UI ↗',prompt:'/ui-generator'},
    {g:'ui',role:'Accessibility',tool:'a11y-audit skill',icon:'ti-accessible',c:'#185FA5',bg:'#E6F1FB',owns:'WCAG 2.2 audit + fix for React/Vue/Angular/Svelte/HTML; contrast, CI exit codes.',label:'Audit a11y ↗',prompt:'Using the a11y-audit skill, audit and fix WCAG 2.2 accessibility issues in: '},
    {g:'ui',role:'Landing pages',tool:'landing skill',icon:'ti-browser',c:'#993556',bg:'#FBEAF0',owns:'Premium single-file HTML landing page — GSAP motion, parallax, brand colors.',label:'Build a landing ↗',prompt:'Using the landing skill, build a premium landing page for: '},
    {g:'ui',role:'Apple HIG',tool:'apple-hig-expert skill',icon:'ti-brand-apple',c:'#444441',bg:'#F1EFE8',owns:'iOS/macOS/visionOS design + audit vs Apple HIG (Liquid Glass), tap targets, contrast.',label:'Check HIG ↗',prompt:'Using the apple-hig-expert skill, audit/design against the Apple HIG: '},
    {g:'spec',role:'QA senior engineer',tool:'senior-qa skill',icon:'ti-shield-check',c:'#1D9E75',bg:'#E1F5EE',owns:'Coverage review, write+run tests, contract QA, adversarial "break it".',label:'Run QA ↗',prompt:'/qa-runner'},
    {g:'spec',role:'E2E testing',tool:'playwright-pro skill',icon:'ti-test-pipe',c:'#0F6E56',bg:'#E1F5EE',owns:'Playwright E2E: generate tests, fix flaky, migrate from Cypress/Selenium, TestRail/BrowserStack.',label:'Playwright ↗',prompt:'Using the playwright-pro skill, generate or fix end-to-end Playwright tests for: '},
    {g:'spec',role:'Code reviewer',tool:'code-review',icon:'ti-git-pull-request',c:'#534AB7',bg:'#EEEDFE',owns:'Diff review for correctness + cleanup.',label:'Review my diff ↗',prompt:'/code-review'},
    {g:'spec',role:'Architect',tool:'Joseph (inline)',icon:'ti-sitemap',c:'#534AB7',bg:'#EEEDFE',owns:'Decomposition, polyglot data split, trade-offs.',label:'Design with Joseph ↗',prompt:'Joseph (architect), help me design/decompose: '},
    {g:'spec',role:'DBA',tool:'dba skill',icon:'ti-database-cog',c:'#0F6E56',bg:'#E1F5EE',owns:'Schema design, indexes, migrations, query tuning; owns public-schema + no-embedded-Mongo conventions.',hiring:true,label:'Ask the DBA ↗',prompt:'Using the dba skill, review or design the database (schema, indexes, migrations, query tuning) for: '},
    {g:'spec',role:'Snowflake / warehouse',tool:'snowflake-development skill',icon:'ti-snowflake',c:'#185FA5',bg:'#E6F1FB',owns:'Snowflake SQL, Dynamic Tables, Streams/Tasks, Cortex AI, Snowpark, dbt.',label:'Snowflake ↗',prompt:'Using the snowflake-development skill, help with Snowflake (SQL / pipelines / Cortex / dbt): '},
    {g:'spec',role:'Data quality',tool:'data-quality-auditor skill',icon:'ti-clipboard-data',c:'#3B6D11',bg:'#EAF3DE',owns:'Profile datasets, detect outliers/missing values, DQS scoring, remediation plan.',label:'Audit data ↗',prompt:'Using the data-quality-auditor skill, profile and audit the data quality of: '},
    {g:'spec',role:'DevOps / cloud (universal)',tool:'devops-agent + aws-*',icon:'ti-cloud-cog',c:'#BA7517',bg:'#FAEEDA',owns:'ECS/K8s/Docker, CI/CD, IaC, deploy, cluster health.',hiring:true,label:'Open DevOps agent ↗',prompt:'/devops-agent'},
    {g:'spec',role:'Docker',tool:'docker-development skill',icon:'ti-brand-docker',c:'#185FA5',bg:'#E6F1FB',owns:'Dockerfile optimization, multi-stage, compose, image slimming, container security.',label:'Dockerize ↗',prompt:'Using the docker-development skill, optimize/harden the Docker setup for: '},
    {g:'spec',role:'Helm / K8s charts',tool:'helm-chart-builder skill',icon:'ti-anchor',c:'#0C447C',bg:'#E6F1FB',owns:'Helm chart scaffolding, values design, template helpers, RBAC/security, lint/test.',label:'Build chart ↗',prompt:'Using the helm-chart-builder skill, create or improve a Helm chart for: '},
    {g:'spec',role:'Security',tool:'security-review',icon:'ti-lock-check',c:'#E24B4A',bg:'#FCEBEB',owns:'Auth/JWT, secrets, dependency CVEs.',label:'Security review ↗',prompt:'Using the security-review skill, review this project for auth/JWT, secrets and dependency CVE issues.'},
    {g:'spec',role:'Design grilling / coach',tool:'grill-me skill',icon:'ti-flame',c:'#993C1D',bg:'#FAECE7',owns:'Relentless plan/design interrogator — one branch at a time. Great for interview prep.',label:'Grill me ↗',prompt:'Using the grill-me skill, grill me on this plan/design: '}
  ];
  var host=document.getElementById('et-groups');
  function makeCard(r){
    var card=document.createElement('div');card.className='et-card'+(r.auth?' auth':'')+(r.hiring?' hiring':'');
    var pill=r.auth?'<span class="et-pill">AUTHORITY</span>':(r.hiring?'<span class="et-pill hiring"><i class="ti ti-user-search" aria-hidden="true"></i> OPEN REQ</span>':'');
    card.innerHTML=
      '<div class="et-crow"><span class="et-badge" style="background:'+r.bg+'"><i class="ti '+r.icon+'" style="color:'+r.c+'" aria-hidden="true"></i></span>'+
      '<div><div class="et-role">'+r.role+'</div><div class="et-tool">'+r.tool+'</div></div>'+pill+'</div>'+
      '<p class="et-owns">'+r.owns+'</p>'+
      '<button class="et-btn">'+r.label+'</button>';
    card.querySelector('.et-btn').onclick=function(){
      if(r.prompt.slice(-2)===': '){var t=(document.getElementById('et-task').value||'').trim();sendPrompt(r.prompt+(t||'(describe the problem)'));}
      else sendPrompt(r.prompt);
    };
    return card;
  }
  groups.forEach(function(gp){
    var members=roster.filter(function(r){return r.g===gp.key;});
    var box=document.createElement('div');box.className='et-group';
    box.innerHTML='<div class="et-ghead"><span class="et-gi" style="background:'+gp.bg+'"><i class="ti '+gp.icon+'" style="color:'+gp.c+'" aria-hidden="true"></i></span>'+
      '<span class="et-gtitle">'+gp.title+'</span><span class="et-gsub">'+members.length+' · '+gp.sub+'</span></div>';
    var grid=document.createElement('div');grid.className='et-grid';
    members.forEach(function(r){grid.appendChild(makeCard(r));});
    box.appendChild(grid);host.appendChild(box);
  });
  function route(){
    var t=(document.getElementById('et-task').value||'').trim();
    if(!t){document.getElementById('et-task').focus();return;}
    sendPrompt('Using the engineering-team skill: as Joseph, decide which specialist on the roster should own this task, say why in one line, then engage them. Task: '+t);
  }
  document.getElementById('et-route-btn').onclick=route;
  document.getElementById('et-task').addEventListener('keydown',function(e){if(e.key==='Enter')route();});
  document.getElementById('et-pm-btn').onclick=function(){var t=(document.getElementById('et-task').value||'').trim();sendPrompt('Using the pm skill, scope, prioritise and break into deliverables: '+(t||'(describe the goal)'));};
})();
</script>
```
