---
name: python-generator
description: Interactive Python backend scaffolding generator. Sidebar nav (Python MS [FastAPI] / Python app) + content pane. Fill details (location preset dropdown+chips, name, package, port, Python version; PostgreSQL [SQLAlchemy+Alembic] and/or MongoDB [Motor/Beanie] checkboxes; resources for CRUD; Kafka; Dockerfile). Follows the fastapi skill (the Python authority) — never overrides spring-boot. On Generate it sends a complete build prompt via sendPrompt(). Use when the user wants to scaffold a new PYTHON / FastAPI service or app or invokes /python-generator. For Java use java-generator; for UI use ui-generator.
---

# Python Generator

Render the following interactive HTML widget (via the visualize show_widget tool, title `python_generator`). Header bar, left sidebar switching two Python generators (Python MS [FastAPI], Python app), content pane with the active form; each form assembles a build prompt and submits it via `sendPrompt()`. Everything follows the fastapi skill (the Python authority) and never overrides spring-boot. Python MS = FastAPI + Pydantic v2 + SQLAlchemy 2.0/Alembic (PG) and/or Motor/Beanie (Mongo), Depends() DI, central exception handler, CRUD-by-default, pytest, /docs; Python app = minimal runnable project (entry point + pytest + README). Defaults: location `c:\myPrograms\interview`, Python 3.12, port 8000. Baked-in: public schema (no DataGrip trap), Mongo `attributes` catch-all, dedicated-user bootstrap, envelope for POST/DELETE, build-verify loop + card. Java services live in java-generator; UI in ui-generator.

```html
<h2 class="sr-only">Python generator web app — sidebar selects FastAPI microservice or a simple Python app; fill the form and generate a build prompt.</h2>

<style>
.app{border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);overflow:hidden;background:var(--color-background-primary);margin:1rem 0}
.app-header{display:flex;align-items:center;gap:11px;padding:13px 18px;border-bottom:0.5px solid var(--color-border-tertiary);background:var(--color-background-secondary)}
.app-header .hicon{width:30px;height:30px;border-radius:var(--border-radius-md);background:var(--color-background-warning);display:flex;align-items:center;justify-content:center}
.app-header .hicon i{font-size:18px;color:var(--color-text-warning)}
.app-title{font-size:15px;font-weight:500;line-height:1.2}
.app-sub{font-size:12px;color:var(--color-text-tertiary)}
.app-body{display:flex;align-items:stretch}
.app-nav{width:184px;flex-shrink:0;border-right:0.5px solid var(--color-border-tertiary);padding:10px;background:var(--color-background-secondary)}
.nav-item{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:var(--border-radius-md);font-size:13px;color:var(--color-text-secondary);cursor:pointer;border:0;background:transparent;text-align:left;margin-bottom:5px}
.nav-item:hover{background:var(--color-background-primary)}
.nav-item.active{background:var(--color-background-primary);color:var(--color-text-primary);font-weight:500;box-shadow:inset 2px 0 0 var(--color-text-warning)}
.nbadge{width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.nbadge i{font-size:16px}
.app-main{flex:1;padding:18px 20px;min-width:0}
.psg-field{margin:0 0 14px}
.psg-field label{display:block;font-size:12px;font-weight:500;color:var(--color-text-secondary);margin:0 0 5px}
.psg-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px}
.psg-sec{border-top:0.5px solid var(--color-border-tertiary);margin:1.3rem 0 1rem;padding-top:1rem}
.psg-sec h3{font-size:14px;font-weight:500;margin:0 0 11px;display:flex;align-items:center;gap:8px}
.psg-sec h3 i{font-size:16px;color:var(--color-text-tertiary)}
.psg-chk{display:flex;align-items:center;gap:8px;font-size:14px;margin:7px 0}
.psg-muted{font-size:12px;color:var(--color-text-tertiary);margin:6px 0 0;line-height:1.6}
.psg-muted code{background:var(--color-background-secondary);padding:1px 5px;border-radius:4px}
.loc-presets{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.loc-chip{font-size:12px;padding:4px 11px;border-radius:99px;border:0.5px solid var(--color-border-secondary);background:var(--color-background-secondary);color:var(--color-text-secondary);cursor:pointer}
.loc-chip:hover{border-color:var(--color-text-info);color:var(--color-text-info);background:var(--color-background-info)}
.main-title{font-size:16px;font-weight:500;margin:0 0 2px}
.main-desc{font-size:12px;color:var(--color-text-tertiary);margin:0 0 1.2rem}
.psg-gen{background:var(--color-background-warning);color:var(--color-text-warning);border:0.5px solid var(--color-text-warning);font-weight:500;padding:9px 20px;border-radius:var(--border-radius-md);margin-top:1.3rem}
.psg-gen:hover{filter:brightness(0.97)}
</style>

<div class="app">
  <div class="app-header">
    <span class="hicon"><i class="ti ti-brand-python" aria-hidden="true"></i></span>
    <div><div class="app-title">Python Generator</div><div class="app-sub">scaffold a FastAPI service or Python app in one click</div></div>
  </div>
  <div class="app-body">
    <nav class="app-nav">
      <button class="nav-item active" data-go="pyms"><span class="nbadge" style="background:var(--color-background-warning)"><i class="ti ti-brand-python" style="color:var(--color-text-warning)" aria-hidden="true"></i></span> Python MS</button>
      <button class="nav-item" data-go="pyapp"><span class="nbadge" style="background:var(--color-background-secondary)"><i class="ti ti-brand-python" style="color:var(--color-text-secondary)" aria-hidden="true"></i></span> Python app</button>
    </nav>
    <div class="app-main">

      <div id="psg-pyms" class="psg-form">
        <p class="main-title">Python microservice (FastAPI)</p>
        <p class="main-desc">FastAPI · Pydantic · SQLAlchemy/Alembic · Motor/Beanie · pytest · follows the <b>fastapi</b> skill</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\myPrograms\interview" data-ll="c:\myPrograms\interview|interview;c:\Interviews\preps|preps;c:\gym\dev\modules\backend|gym backend"></div>
          <div class="psg-field"><label>Service name</label><input data-f="name" placeholder="payment-service"></div>
          <div class="psg-field"><label>Top package (app dir)</label><input data-f="package" placeholder="app"></div>
          <div class="psg-field"><label>Server port</label><input data-f="port" type="number" value="8000" step="1"></div>
          <div class="psg-field"><label>Python version</label><select data-f="py"><option>3.12</option><option>3.11</option><option>3.13</option></select></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-database" aria-hidden="true"></i> Database</h3>
          <div class="psg-grid">
            <label class="psg-chk"><input type="checkbox" data-f="dbPg"> PostgreSQL (SQLAlchemy + Alembic)</label>
            <label class="psg-chk"><input type="checkbox" data-f="dbMongo"> MongoDB (Motor/Beanie)</label>
          </div>
          <div class="psg-grid" style="margin-top:10px">
            <div class="psg-field"><label>PG host</label><input data-f="pgHost" value="localhost"></div>
            <div class="psg-field"><label>PG port</label><input data-f="pgPort" value="5432"></div>
            <div class="psg-field"><label>PG database</label><input data-f="pgDb" placeholder="payment"></div>
            <div class="psg-field"><label>Mongo URI</label><input data-f="mongoUri" value="mongodb://localhost:27017"></div>
            <div class="psg-field"><label>Mongo database</label><input data-f="mongoDb" placeholder="payment"></div>
          </div>
          <div class="psg-field" style="margin-top:10px"><label>Extra DB instructions</label><textarea data-f="dbExtra" placeholder="tables/collections, indexes, seed data…"></textarea></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-api" aria-hidden="true"></i> Resources &amp; endpoints</h3>
          <div class="psg-field"><label>Resources (CRUD generated per resource)</label><input data-f="resources" placeholder="payment, customer"></div>
          <div class="psg-field" style="margin:0"><label>Extra endpoints / notes</label><textarea data-f="apiNote" placeholder="e.g. POST /payments/{id}/refund; field types inferred from names"></textarea></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-arrows-exchange" aria-hidden="true"></i> Messaging &amp; extras</h3>
          <label class="psg-chk"><input type="checkbox" data-f="kafka"> Kafka (aiokafka → local broker localhost:9092)</label>
          <input data-f="kafkaTopics" placeholder="topics: payment.created" style="margin:7px 0 0">
          <label class="psg-chk" style="margin-top:10px"><input type="checkbox" data-f="docker" checked> Dockerfile (multi-stage, non-root, slim)</label>
        </div>
        <div class="psg-field"><label>Comments</label><textarea data-f="comments" placeholder="anything else for the build prompt"></textarea></div>
        <p class="psg-muted">Baked in: Depends() DI, pydantic-settings config, Pydantic validation, central exception handler, CRUD-by-default, envelope for POST/DELETE, public schema (no DataGrip trap), Mongo <code>attributes</code> catch-all, dedicated-user bootstrap, pytest, /docs Swagger, README, build-verify loop + card. Follows the fastapi skill; never overrides spring-boot.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="psg-gen" data-type="pyms">Generate Python microservice ↗</button><button class="psg-gen psg-qa" data-type="pyms">Create &amp; run QA ↗</button><button class="psg-gen psg-toapi" data-type="pyms">To API ↗</button></div>
      </div>

      <div id="psg-pyapp" class="psg-form">
        <p class="main-title">Python app (simple)</p>
        <p class="main-desc">minimal runnable Python project · entry point · pytest · README · follows the <b>fastapi</b> skill's app conventions</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\myPrograms\interview" data-ll="c:\myPrograms\interview|interview;c:\Interviews\preps|preps"></div>
          <div class="psg-field"><label>App name</label><input data-f="name" placeholder="my-tool"></div>
          <div class="psg-field"><label>Python version</label><select data-f="py"><option>3.12</option><option>3.11</option><option>3.13</option></select></div>
          <div class="psg-field"><label>Packaging</label><select data-f="pkg"><option>pyproject.toml (Poetry)</option><option>requirements.txt (pip)</option></select></div>
        </div>
        <div class="psg-field"><label>Comments — what should it do?</label><textarea data-f="comments" placeholder="entry point behaviour, CLI args, libs…"></textarea></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="psg-gen" data-type="pyapp">Generate Python app ↗</button><button class="psg-gen psg-qa" data-type="pyapp">Create &amp; run QA ↗</button></div>
      </div>

    </div>
  </div>
</div>

<script>
(function(){
  var forms={pyms:document.getElementById('psg-pyms'),pyapp:document.getElementById('psg-pyapp')};
  var navs=document.querySelectorAll('.nav-item');
  function show(id){for(var k in forms)forms[k].style.display=(k===id?'block':'none');navs.forEach(function(n){n.classList.toggle('active',n.getAttribute('data-go')===id);});}
  show('pyms');
  navs.forEach(function(n){n.onclick=function(){show(n.getAttribute('data-go'));};});

  document.querySelectorAll('.loc-mount').forEach(function(m){
    var val=m.getAttribute('data-lv')||'';
    var pairs=(m.getAttribute('data-ll')||'').split(';').filter(Boolean).map(function(x){var i=x.split('|');return{p:i[0],l:i[1]||i[0]};});
    var opts=pairs.map(function(x){return '<option value="'+x.p+'">'+x.p+'</option>';}).join('');
    var chips=pairs.map(function(x){return '<button type="button" class="loc-chip" data-loc="'+x.p+'"><i class="ti ti-folder" aria-hidden="true"></i> '+x.l+'</button>';}).join('');
    m.innerHTML='<label>Location</label><input data-f="location" value="'+val+'"><select class="loc-preset" style="margin-top:7px;width:100%"><option value="">Choose preset…</option>'+opts+'</select><div class="loc-presets">'+chips+'</div>';
  });

  document.querySelectorAll('.loc-chip').forEach(function(chip){chip.onclick=function(){var inp=chip.closest('.psg-field').querySelector('input[data-f="location"]');if(inp)inp.value=chip.getAttribute('data-loc');};});
  document.querySelectorAll('.loc-preset').forEach(function(sel){sel.onchange=function(){if(!sel.value)return;var inp=sel.closest('.psg-field').querySelector('input[data-f="location"]');if(inp)inp.value=sel.value;sel.value='';};});

  function val(form,f){var el=form.querySelector('[data-f="'+f+'"]');if(!el)return'';return el.type==='checkbox'?el.checked:(el.value||'').trim();}

  function genPyms(form){
    var name=val(form,'name')||'py-service';var p=[];
    p.push('Build an industrial-grade Python microservice with FastAPI. Follow the fastapi skill (the Python authority). Do NOT apply spring-boot/Java conventions — this is Python.');
    p.push('- Location: '+val(form,'location')+'\\'+name);
    p.push('- Service name: '+name);
    p.push('- Top package/app dir: '+(val(form,'package')||'app'));
    p.push('- Server port: '+val(form,'port'));
    p.push('- Python version: '+val(form,'py'));
    var hasPg=val(form,'dbPg'),hasMongo=val(form,'dbMongo');
    if(!hasPg&&!hasMongo)p.push('- Database: none (in-memory/repository stub)');
    if(hasPg){p.push('- Database [PostgreSQL — SQLAlchemy 2.0 async + Alembic]: host='+val(form,'pgHost')+', port='+val(form,'pgPort')+', database='+val(form,'pgDb')+'. Use the DEFAULT public schema (no named schema — DataGrip shows tables immediately). Auto-bootstrap an IDEMPOTENT dedicated PG role+db during build-verify (psql -U postgres via pgpass; local PostgreSQL 18), then alembic upgrade head.');}
    if(hasMongo){p.push('- Database [MongoDB — Motor/Beanie async]: uri='+val(form,'mongoUri')+', database='+val(form,'mongoDb')+'. Local Mongo 8.2 runs WITH auth (admin/admin123, authSource=admin); create a DEDICATED db user during build-verify. FLEXIBLE SCHEMA: every document model carries typed core fields PLUS an attributes: dict[str, Any] catch-all, threaded through the Pydantic schemas and endpoints.');}
    if(hasPg&&hasMongo)p.push('- POLYGLOT: use both stores side by side with separate repositories/models packages; document which data lives where. Remember Mongo is not in the SQL transaction — validate fail-fast before any write to avoid orphans.');
    var dbx=val(form,'dbExtra');if(dbx)p.push('   Extra DB instructions: '+dbx);
    var res=val(form,'resources');
    p.push('- Resources: '+(res?'generate full async CRUD per resource ('+res+') — GET list, GET by id, POST 201+envelope, PUT, DELETE 200+envelope':'a sample resource with full async CRUD')+'. Envelope {success,message,data} for POST/DELETE. Field types inferred from names unless given in parens.');
    var an=val(form,'apiNote');if(an)p.push('   Extra endpoints/notes: '+an);
    if(val(form,'kafka'))p.push('- Kafka (aiokafka), topics: '+val(form,'kafkaTopics')+' — connect to the LOCAL broker at localhost:9092 (C:\\kafka); docker-compose kafka only as fallback.');
    p.push('- Dockerfile: '+(val(form,'docker')?'create (multi-stage, non-root, slim python base)':'skip'));
    var c=val(form,'comments');if(c)p.push('- Additional instructions: '+c);
    p.push('Baked in (per fastapi skill): app/ layout (main.py, api/ routers, services/, repositories/, models/, schemas/, core/ config+deps, exceptions/); Depends() dependency injection; pydantic-settings BaseSettings config (.env, never hardcode secrets); Pydantic v2 validation; custom exceptions + central @app.exception_handler (404/400/409); pytest + httpx TestClient; auto OpenAPI at /docs; detailed README; .env.example. After building: run the build-verify loop (install deps, migrate/seed, pytest -q, boot uvicorn, curl /health + a real endpoint) then render the build-summary card. Never override spring-boot.');
    return p.join('\n');
  }
  function genPyapp(form){
    var name=val(form,'name')||'py-app';
    return ['Create a minimal, runnable Python app. Follow the fastapi skill\'s "Python app (non-service)" conventions. Not a Java project.',
      '- Location: '+val(form,'location')+'\\'+name,'- App name: '+name,
      '- Python version: '+val(form,'py'),'- Packaging: '+val(form,'pkg'),
      '- Include a clear entry point (main.py / __main__) with a runnable command.',
      (val(form,'comments')?'- What it should do: '+val(form,'comments'):''),
      'Include '+val(form,'pkg')+', a pytest test, a short README with the run command, and a .gitignore. Runnable-first discipline.'].filter(Boolean).join('\n');
  }
  var gens={pyms:genPyms,pyapp:genPyapp};
  document.querySelectorAll('.psg-gen').forEach(function(b){
    if(b.classList.contains('psg-qa')||b.classList.contains('psg-toapi'))return;
    b.onclick=function(){var t=b.getAttribute('data-type');sendPrompt(gens[t](forms[t]));};
  });
  document.querySelectorAll('.psg-qa').forEach(function(b){b.onclick=function(){
    var t=b.getAttribute('data-type');
    sendPrompt(gens[t](forms[t])+'\n\nTHEN, once the build-verify loop is green, using the senior-qa skill run a QA pass on the service you just built — coverage review against the test pyramid, run the tests (pytest -q), and a short adversarial probe of the endpoints (unknown id -> 404, invalid body -> 400/422, duplicate -> 409) — and render the standard QA report widget.');
  };});
  document.querySelectorAll('.psg-toapi').forEach(function(b){b.onclick=function(){
    var f=forms[b.getAttribute('data-type')];
    var name=val(f,'name')||'py-service', base='http://localhost:'+(val(f,'port')||'8000');
    var dbs=[];
    if(val(f,'dbPg'))dbs.push('PostgreSQL '+(val(f,'pgHost')||'localhost')+':'+(val(f,'pgPort')||'5432')+'/'+(val(f,'pgDb')||name));
    if(val(f,'dbMongo'))dbs.push('MongoDB '+(val(f,'mongoUri')||'mongodb://localhost:27017')+'/'+(val(f,'mongoDb')||name));
    if(!dbs.length)dbs.push('none (in-memory)');
    var res=(val(f,'resources')||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
    var eps=(res.length?res:['resource']).map(function(r){return 'CRUD /' + r + 's';});
    sendPrompt('Do NOT build anything. Render an API-surface card (visualize widget) for the planned FastAPI service '+name+': endpoints — '+eps.join('; ')+'. Databases — '+dbs.join('; ')+'. Swagger UI: '+base+'/docs. Health: '+base+'/health.');
  };});
})();
</script>
```
