---
name: java-generator
description: Interactive Java/Spring backend scaffolding generator. Sidebar nav (Microservice full / simple Spring Boot / plain Java) + content pane. Fill details (location preset dropdown+chips, package, port, Java version; Database independent checkboxes PostgreSQL/MySQL/MongoDB/Couchbase — any combination = polyglot; REST APIs with per-endpoint free-style request/response field boxes and shared-DTO memory; security/JWT; Kafka; ActiveMQ & Redis each with Local-vs-Docker runtime; Docker/K8s). Follows the spring-boot skill (the authority). On Generate it sends a complete build prompt via sendPrompt(). Use when the user wants to scaffold a new JAVA / Spring Boot service or invokes /java-generator. For Python use python-generator; for UI use ui-generator.
---

# Java Generator

Render the following interactive HTML widget (via the visualize show_widget tool, title `java_generator`). Header bar, left sidebar switching three Java generators (Microservice, Spring Boot, Plain Java), content pane with the active form; each form assembles a build prompt and submits it via `sendPrompt()`. Everything follows the spring-boot skill (the authority) + project CLAUDE.md. Defaults: location `c:\Interviews\preps` (preset dropdown + chips), Java 21, package `com.gym.<name>`, port 8080. Databases are independent CHECKBOXES (PostgreSQL, MySQL, MongoDB, Couchbase) — any combination = polyglot persistence, each revealing its own config panel. REST APIs: each endpoint row has a **＋ params** toggle for free-style request/response fields; a DTO's fields are recorded the first time a type name is defined and reused everywhere the type appears (incl. inside List<...>). ActiveMQ & Redis each have a Local-vs-Docker runtime switch. Baked-in: industrial-grade, constructor injection, SLF4J, validation, tests, @RestControllerAdvice, @Transactional(rollbackFor=Exception.class), actuator, Swagger, README, controller/exception package layout, quiet-404, local Kafka localhost:9092, idempotent PG dedicated-role bootstrap, public schema (no DataGrip trap), build-verify loop + card. Python services live in python-generator; UI in ui-generator.

```html
<h2 class="sr-only">Java generator web app — sidebar selects microservice, Spring Boot or plain Java; fill the form and generate a build prompt.</h2>

<style>
.app{border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);overflow:hidden;background:var(--color-background-primary);margin:1rem 0}
.app-header{display:flex;align-items:center;gap:11px;padding:13px 18px;border-bottom:0.5px solid var(--color-border-tertiary);background:var(--color-background-secondary)}
.app-header .hicon{width:30px;height:30px;border-radius:var(--border-radius-md);background:var(--color-background-success);display:flex;align-items:center;justify-content:center}
.app-header .hicon i{font-size:18px;color:var(--color-text-success)}
.app-title{font-size:15px;font-weight:500;line-height:1.2}
.app-sub{font-size:12px;color:var(--color-text-tertiary)}
.app-body{display:flex;align-items:stretch}
.app-nav{width:184px;flex-shrink:0;border-right:0.5px solid var(--color-border-tertiary);padding:10px;background:var(--color-background-secondary)}
.nav-item{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:var(--border-radius-md);font-size:13px;color:var(--color-text-secondary);cursor:pointer;border:0;background:transparent;text-align:left;margin-bottom:5px}
.nav-item:hover{background:var(--color-background-primary)}
.nav-item.active{background:var(--color-background-primary);color:var(--color-text-primary);font-weight:500;box-shadow:inset 2px 0 0 var(--color-text-success)}
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
.psg-api{display:grid;grid-template-columns:84px 1fr 1fr 1fr 30px 30px;gap:7px;margin:0;align-items:center}
.psg-api-item{margin:0 0 8px}
.psg-api-params{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:5px 0 6px 4px;padding:9px 11px;border-left:2px solid var(--color-border-secondary);background:var(--color-background-secondary)}
.psg-params-btn{font-size:13px}
.psg-muted{font-size:12px;color:var(--color-text-tertiary);margin:6px 0 0;line-height:1.6}
.psg-muted code{background:var(--color-background-secondary);padding:1px 5px;border-radius:4px}
.loc-presets{display:flex;gap:6px;flex-wrap:wrap;margin-top:7px}
.loc-chip{font-size:12px;padding:4px 11px;border-radius:99px;border:0.5px solid var(--color-border-secondary);background:var(--color-background-secondary);color:var(--color-text-secondary);cursor:pointer}
.loc-chip:hover{border-color:var(--color-text-info);color:var(--color-text-info);background:var(--color-background-info)}
.sub-panel{margin:6px 0 12px;padding:11px 13px;border-left:2px solid var(--color-border-secondary);border-radius:0;background:var(--color-background-secondary)}
.main-title{font-size:16px;font-weight:500;margin:0 0 2px}
.main-desc{font-size:12px;color:var(--color-text-tertiary);margin:0 0 1.2rem}
.psg-gen{background:var(--color-background-success);color:var(--color-text-success);border:0.5px solid var(--color-text-success);font-weight:500;padding:9px 20px;border-radius:var(--border-radius-md);margin-top:1.3rem}
.psg-gen:hover{filter:brightness(0.97)}
</style>

<div class="app">
  <div class="app-header">
    <span class="hicon"><i class="ti ti-leaf" aria-hidden="true"></i></span>
    <div><div class="app-title">Java Generator</div><div class="app-sub">scaffold a Java / Spring service in one click</div></div>
  </div>
  <div class="app-body">
    <nav class="app-nav">
      <button class="nav-item active" data-go="ms"><span class="nbadge" style="background:var(--color-background-info)"><i class="ti ti-affiliate" style="color:var(--color-text-info)" aria-hidden="true"></i></span> Microservice</button>
      <button class="nav-item" data-go="boot"><span class="nbadge" style="background:var(--color-background-success)"><i class="ti ti-leaf" style="color:var(--color-text-success)" aria-hidden="true"></i></span> Spring Boot</button>
      <button class="nav-item" data-go="java"><span class="nbadge" style="background:var(--color-background-secondary)"><i class="ti ti-coffee" style="color:var(--color-text-secondary)" aria-hidden="true"></i></span> Plain Java</button>
    </nav>
    <div class="app-main">

      <div id="psg-ms" class="psg-form">
        <p class="main-title">Microservice (full)</p>
        <p class="main-desc">DB · REST APIs · Security · Kafka/Redis · Docker/K8s · IntelliJ run config</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\Interviews\preps" data-ll="c:\Interviews\preps|preps;c:\Interviews\interviews|interviews;c:\myPrograms\interview|interview;c:\gym\dev\modules\backend|gym backend"></div>
          <div class="psg-field"><label>Service name</label><input data-f="name" placeholder="PaymentService"></div>
          <div class="psg-field"><label>Base package</label><input data-f="package" placeholder="com.gym.payment"></div>
          <div class="psg-field"><label>Server port</label><input data-f="port" type="number" value="8080" step="1"></div>
          <div class="psg-field"><label>Java version</label><select data-f="java"><option>21</option><option>17</option><option>11</option></select></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-database" aria-hidden="true"></i> Database</h3>
          <p class="psg-muted" style="margin:0 0 8px">Check any combination — a service can use several databases (e.g. PostgreSQL + MongoDB).</p>
          <label class="psg-chk"><input type="checkbox" data-f="dbPg" data-panel="sqlPanel"> PostgreSQL (SQL)</label>
          <div id="sqlPanel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Host</label><input data-f="sqlHost" value="localhost"></div>
              <div class="psg-field"><label>Port</label><input data-f="sqlPort" value="5432"></div>
              <div class="psg-field"><label>Database name</label><input data-f="sqlDb" placeholder="payment"></div>
              <div class="psg-field"><label>Schema (PG)</label><input data-f="sqlSchema" placeholder="public (default — leave empty)"></div>
              <div class="psg-field"><label>User</label><input data-f="sqlUser" placeholder="payment"></div>
              <div class="psg-field"><label>Password</label><input data-f="sqlPwd" placeholder="payment123"></div>
              <div class="psg-field" style="margin:0"><label>DDL strategy</label><select data-f="sqlDdl"><option>Flyway + ddl-auto:validate</option><option>ddl-auto:update</option><option>ddl-auto:none</option></select></div>
            </div>
            <div class="psg-field" style="margin:10px 0 0"><label>Extra instructions — PostgreSQL</label><textarea data-f="sqlExtra" placeholder="tables + fields for THIS db, indexes, seed data…"></textarea></div>
          </div>
          <label class="psg-chk"><input type="checkbox" data-f="dbMy" data-panel="mySqlPanel"> MySQL (SQL)</label>
          <div id="mySqlPanel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Host</label><input data-f="myHost" value="localhost"></div>
              <div class="psg-field"><label>Port</label><input data-f="myPort" value="3306"></div>
              <div class="psg-field"><label>Database name</label><input data-f="myDb" placeholder="payment"></div>
              <div class="psg-field"><label>User</label><input data-f="myUser" placeholder="payment"></div>
              <div class="psg-field"><label>Password</label><input data-f="myPwd" placeholder="payment123"></div>
              <div class="psg-field" style="margin:0"><label>DDL strategy</label><select data-f="myDdl"><option>Flyway + ddl-auto:validate</option><option>ddl-auto:update</option><option>ddl-auto:none</option></select></div>
            </div>
            <div class="psg-field" style="margin:10px 0 0"><label>Extra instructions — MySQL</label><textarea data-f="myExtra" placeholder="tables + fields for THIS db, indexes, seed data…"></textarea></div>
          </div>
          <label class="psg-chk"><input type="checkbox" data-f="dbMongo" data-panel="mongoPanel"> MongoDB (NoSQL)</label>
          <div id="mongoPanel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Connection URI</label><input data-f="mongoUri" value="mongodb://localhost:27017"></div>
              <div class="psg-field"><label>Database</label><input data-f="mongoDb" placeholder="payment"></div>
              <div class="psg-field"><label>User</label><input data-f="mongoUser" placeholder="(optional)"></div>
              <div class="psg-field"><label>Password</label><input data-f="mongoPwd" placeholder="(optional)"></div>
              <div class="psg-field" style="margin:0"><label>Auth source</label><input data-f="mongoAuthSrc" value="admin"></div>
            </div>
            <div class="psg-field" style="margin:10px 0 0"><label>Extra instructions — MongoDB</label><textarea data-f="mongoExtra" placeholder="collections + fields for THIS db, indexes, seed documents…"></textarea></div>
          </div>
          <label class="psg-chk"><input type="checkbox" data-f="dbCb" data-panel="cbPanel"> Couchbase (NoSQL)</label>
          <div id="cbPanel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Connection string</label><input data-f="cbConn" value="couchbase://localhost"></div>
              <div class="psg-field"><label>Bucket</label><input data-f="cbBucket" placeholder="payment"></div>
              <div class="psg-field"><label>Scope</label><input data-f="cbScope" value="_default"></div>
              <div class="psg-field"><label>Collection</label><input data-f="cbCollection" value="_default"></div>
              <div class="psg-field"><label>User</label><input data-f="cbUser" placeholder="payment"></div>
              <div class="psg-field"><label>Password</label><input data-f="cbPwd" placeholder="payment123"></div>
            </div>
            <div class="psg-field" style="margin:10px 0 0"><label>Extra instructions — Couchbase</label><textarea data-f="cbExtra" placeholder="collections + fields for THIS db, indexes…"></textarea></div>
          </div>
          <div class="psg-field" style="margin-top:12px"><label>General DB notes (cross-store, optional)</label><textarea data-f="dbExtra" placeholder="how the stores relate, shared ids, sync between them…"></textarea></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-api" aria-hidden="true"></i> REST APIs</h3>
          <p class="psg-muted" style="margin:0 0 10px">Hit <b>＋ params</b> on a row to define request/response fields free-style. Define a type's fields <b>once</b> (e.g. <code>Customer = id, name, family_name, email</code>); every later endpoint reusing that type name — even inside <code>List&lt;Customer&gt;</code> — gets the same DTO automatically.</p>
          <div class="psg-api" style="color:var(--color-text-tertiary);font-size:12px"><span>Method</span><span>Path</span><span>Request</span><span>Response</span><span></span><span></span></div>
          <div id="psg-apis"></div>
          <button id="psg-add-api" style="font-size:13px"><i class="ti ti-plus" aria-hidden="true"></i> Add endpoint</button>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-lock" aria-hidden="true"></i> Security</h3>
          <label class="psg-chk"><input type="checkbox" data-f="security"> Spring Security — HTTP filter chain (SecurityFilterChain)</label>
          <label class="psg-chk"><input type="checkbox" data-f="jwt"> JWT authentication (OncePerRequestFilter + token validation)</label>
          <input data-f="jwtNote" placeholder="JWT details: issuer, expiry, roles, public paths… (optional)" style="margin:7px 0 0">
        </div>
        <div class="psg-sec"><h3><i class="ti ti-arrows-exchange" aria-hidden="true"></i> Messaging &amp; cache</h3>
          <label class="psg-chk"><input type="checkbox" data-f="kafka"> Kafka</label>
          <input data-f="kafkaTopics" placeholder="topics: payment.created, payment.failed" style="margin:0 0 12px">
          <label class="psg-chk"><input type="checkbox" data-f="activemq" data-panel="amqPanel"> ActiveMQ</label>
          <div id="amqPanel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Runtime</label><select data-f="amqRuntime" data-img="amqImg"><option>Docker</option><option>Local</option></select></div>
              <div class="psg-field"><label>Host</label><input data-f="amqHost" value="localhost"></div>
              <div class="psg-field"><label>Port</label><input data-f="amqPort" value="61616"></div>
              <div class="psg-field"><label>User</label><input data-f="amqUser" value="admin"></div>
              <div class="psg-field"><label>Password</label><input data-f="amqPwd" value="admin"></div>
              <div class="psg-field" id="amqImg"><label>Docker image</label><input data-f="amqImage" value="apache/activemq-classic:latest"></div>
            </div>
            <div class="psg-field"><label>Queues</label><input data-f="amqQueues" placeholder="payment.dlq"></div>
            <div class="psg-field" style="margin:0"><label>Extra instructions — ActiveMQ</label><textarea data-f="amqExtra" placeholder="listeners, redelivery policy, DLQ handling…"></textarea></div>
          </div>
          <label class="psg-chk"><input type="checkbox" data-f="redis" data-panel="redisPanel"> Redis (cache)</label>
          <div id="redisPanel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Runtime</label><select data-f="redisRuntime" data-img="redisImg"><option>Docker</option><option>Local</option></select></div>
              <div class="psg-field"><label>Host</label><input data-f="redisHost" value="localhost"></div>
              <div class="psg-field"><label>Port</label><input data-f="redisPort" value="6379"></div>
              <div class="psg-field"><label>Password</label><input data-f="redisPwd" placeholder="(optional)"></div>
              <div class="psg-field" id="redisImg" style="margin:0"><label>Docker image</label><input data-f="redisImage" value="redis:7-alpine"></div>
            </div>
            <div class="psg-field" style="margin:10px 0 0"><label>Extra instructions — Redis</label><textarea data-f="redisExtra" placeholder="what to cache, TTLs, key patterns, @Cacheable targets…"></textarea></div>
          </div>
          <label class="psg-chk"><input type="checkbox" data-f="h2db" data-panel="h2Panel"> H2 (in-memory DB)</label>
          <div id="h2Panel" class="sub-panel">
            <div class="psg-grid">
              <div class="psg-field"><label>Storage</label><select data-f="h2Storage"><option>In-memory</option><option>File-based</option></select></div>
              <div class="psg-field"><label>H2 console</label><select data-f="h2Console"><option>Enabled</option><option>Disabled</option></select></div>
              <div class="psg-field"><label>Compatibility mode</label><select data-f="h2Mode"><option>Default (H2)</option><option>MySQL</option><option>PostgreSQL</option><option>Oracle</option></select></div>
            </div>
            <div class="psg-field" style="margin:0"><label>H2 instructions</label><textarea data-f="h2Note" placeholder="seed data, init/schema.sql, extra JDBC params, datasource name…"></textarea></div>
          </div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-rocket" aria-hidden="true"></i> Build &amp; deploy</h3>
          <label class="psg-chk"><input type="checkbox" data-f="docker" checked> Create Dockerfile</label>
          <label class="psg-chk"><input type="checkbox" data-f="k8s" checked> Create Kubernetes manifests</label>
          <div class="psg-field" style="margin:10px 0 0"><label>Deploy target (optional)</label><input data-f="deploy" placeholder="AWS ECS Fargate / EKS / —"></div>
        </div>
        <div class="psg-field"><label>Comments — extra prompt instructions</label><textarea data-f="comments" placeholder="anything else to pass to the build prompt"></textarea></div>
        <p class="psg-muted">Baked in: industrial-grade, constructor injection, SLF4J, validation, tests, @RestControllerAdvice, @Transactional(rollbackFor=Exception.class), actuator, Swagger, H2 default in application.yaml, IntelliJ run config, README.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="psg-gen" data-type="ms">Generate microservice ↗</button><button class="psg-gen psg-qa" data-type="ms">Create &amp; run QA ↗</button><button class="psg-gen psg-toapi" data-type="ms">To API ↗</button></div>
      </div>

      <div id="psg-boot" class="psg-form">
        <p class="main-title">Spring Boot (simple)</p>
        <p class="main-desc">start.spring.io-style starter · always a runnable main · IntelliJ run config</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\Interviews\preps" data-ll="c:\Interviews\preps|preps;c:\Interviews\interviews|interviews;c:\myPrograms\interview|interview;c:\gym\dev\modules\backend|gym backend"></div>
          <div class="psg-field"><label>App name</label><input data-f="name" placeholder="demo"></div>
          <div class="psg-field"><label>Base package</label><input data-f="package" placeholder="com.gym.demo"></div>
          <div class="psg-field"><label>Server port</label><input data-f="port" type="number" value="8080" step="1"></div>
          <div class="psg-field"><label>Java version</label><select data-f="java"><option>21</option><option>17</option><option>11</option></select></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-package" aria-hidden="true"></i> Starters</h3>
          <div class="psg-grid">
            <label class="psg-chk"><input type="checkbox" data-f="s_web" checked> web</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_jpa" checked> data-jpa</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_val" checked> validation</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_act" checked> actuator</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_swag" checked> swagger</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_sec"> security</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_jwt"> JWT auth</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_test" checked> unit tests</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_h2" checked> H2 (test)</label>
            <label class="psg-chk"><input type="checkbox" data-f="s_lombok"> lombok</label>
          </div>
        </div>
        <div class="psg-field"><label>Comments</label><textarea data-f="comments" placeholder="extra instructions"></textarea></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="psg-gen" data-type="boot">Generate Spring Boot app ↗</button><button class="psg-gen psg-qa" data-type="boot">Create &amp; run QA ↗</button></div>
      </div>

      <div id="psg-java" class="psg-form">
        <p class="main-title">Plain Java</p>
        <p class="main-desc">minimal Maven/Gradle app · always a runnable Main · IntelliJ run config</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\Interviews\preps" data-ll="c:\Interviews\preps|preps;c:\Interviews\interviews|interviews;c:\myPrograms\interview|interview;c:\gym\dev\modules\backend|gym backend"></div>
          <div class="psg-field"><label>App name</label><input data-f="name" placeholder="my-app"></div>
          <div class="psg-field"><label>Base package</label><input data-f="package" placeholder="com.gym.myapp"></div>
          <div class="psg-field"><label>Java version</label><select data-f="java"><option>21</option><option>17</option><option>11</option></select></div>
          <div class="psg-field"><label>Build tool</label><select data-f="build"><option>Maven</option><option>Gradle</option></select></div>
        </div>
        <div class="psg-field"><label>Comments</label><textarea data-f="comments" placeholder="what should it do? main class, libs…"></textarea></div>
        <button class="psg-gen" data-type="java">Generate Java app ↗</button>
      </div>

    </div>
  </div>
</div>

<script>
(function(){
  var forms={ms:document.getElementById('psg-ms'),boot:document.getElementById('psg-boot'),java:document.getElementById('psg-java')};
  var navs=document.querySelectorAll('.nav-item');
  function show(id){for(var k in forms)forms[k].style.display=(k===id?'block':'none');navs.forEach(function(n){n.classList.toggle('active',n.getAttribute('data-go')===id);});}
  show('ms');
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

  document.querySelectorAll('[data-panel]').forEach(function(cb){var panel=document.getElementById(cb.getAttribute('data-panel'));function upd(){panel.style.display=cb.checked?'block':'none';}cb.onchange=upd;upd();});
  document.querySelectorAll('[data-img]').forEach(function(sel){var img=document.getElementById(sel.getAttribute('data-img'));function upd(){img.style.display=(sel.value==='Docker')?'block':'none';}sel.onchange=upd;upd();});

  var apis=document.getElementById('psg-apis');
  function addApi(){
    var item=document.createElement('div');item.className='psg-api-item';
    item.innerHTML=
      '<div class="psg-api">'+
        '<select data-a="method"><option>GET</option><option>POST</option><option>PUT</option><option>PATCH</option><option>DELETE</option></select>'+
        '<input data-a="path" value="/api/" placeholder="/api/payments/{id}">'+
        '<input data-a="req" placeholder="request type">'+
        '<input data-a="res" placeholder="response type">'+
        '<button class="psg-params-btn" title="Add request/response fields" aria-label="Add parameters"><i class="ti ti-adjustments" aria-hidden="true"></i></button>'+
        '<button class="psg-del" aria-label="Remove endpoint"><i class="ti ti-trash" aria-hidden="true"></i></button>'+
      '</div>'+
      '<div class="psg-api-params" style="display:none">'+
        '<div class="psg-field" style="margin:0"><label>Request fields (free-style)</label><input data-a="reqFields" placeholder="e.g. name, email"></div>'+
        '<div class="psg-field" style="margin:0"><label>Response fields (free-style)</label><input data-a="resFields" placeholder="e.g. id, name, family_name, email"></div>'+
      '</div>';
    apis.appendChild(item);
    item.querySelector('.psg-del').onclick=function(){item.remove();};
    item.querySelector('.psg-params-btn').onclick=function(){var pp=item.querySelector('.psg-api-params');pp.style.display=(pp.style.display==='none'?'grid':'none');};
  }
  if(document.getElementById('psg-add-api')){document.getElementById('psg-add-api').onclick=addApi;addApi();}

  function val(form,f){var el=form.querySelector('[data-f="'+f+'"]');if(!el)return'';return el.type==='checkbox'?el.checked:(el.value||'').trim();}
  function fld(item,a){var el=item.querySelector('[data-a="'+a+'"]');return el?(el.value||'').trim():'';}
  function baseType(t){if(!t)return'';var ids=t.match(/[A-Za-z_][A-Za-z0-9_]*/g);return ids?ids[ids.length-1]:'';}

  function genMS(form){
    var name=val(form,'name')||'NewService';
    var p=[];
    p.push('Build an industrial-grade Spring Boot microservice. Follow the spring-boot skill and the project CLAUDE.md conventions.');
    p.push('- Location: '+val(form,'location')+'\\'+name);
    p.push('- Service name: '+name);
    p.push('- Base package: '+(val(form,'package')||'com.gym.'+name.toLowerCase()));
    p.push('- Server port: '+val(form,'port'));
    p.push('- Java version: '+val(form,'java'));
    var hasPg=val(form,'dbPg'),hasMy=val(form,'dbMy'),hasMongo=val(form,'dbMongo'),hasCb=val(form,'dbCb');
    var hasSql=hasPg||hasMy;
    if(!hasPg&&!hasMy&&!hasMongo&&!hasCb){p.push('- Database: none');}
    if(hasPg){var pgSchema=val(form,'sqlSchema')||'public';
      p.push('- Database [SQL — PostgreSQL, Spring Data JPA]: host='+val(form,'sqlHost')+', port='+val(form,'sqlPort')+', database='+val(form,'sqlDb')+', schema='+pgSchema+(pgSchema==='public'?' (DEFAULT public — do NOT set hibernate default_schema or flyway schemas; tables land in public so DataGrip shows them immediately)':' (NAMED schema — configure hibernate default_schema + flyway schemas/create-schemas, and the build card MUST tell the user to tick this schema in DataGrip)')+', user='+val(form,'sqlUser')+', password='+val(form,'sqlPwd')+', ddl='+val(form,'sqlDdl'));
      p.push('   Local PG auto-bootstrap: generate an IDEMPOTENT db/bootstrap/00_create_role_and_db.sql (create-or-alter a DEDICATED role for this service — never reuse a shared role — plus CREATE DATABASE via \\gexec and GRANTs) and run it during build-verify with psql -U postgres (auth via pgpass at %APPDATA%\\postgresql\\pgpass.conf; local PostgreSQL 18 at C:\\Program Files\\PostgreSQL\\18). If no pgpass entry exists, emit the script + psql command for the user instead.');
      if(pgSchema==='public')p.push('   PUBLIC SCHEMA IS MANDATORY (DataGrip visibility trap — this has regressed twice): every table MUST be created in the default public schema so it shows in DataGrip immediately. Do NOT create a named schema, do NOT set spring.jpa.properties.hibernate.default_schema, do NOT set spring.flyway.schemas or spring.flyway.default-schema, do NOT put schema= on any @Table/@Entity, and do NOT CREATE SCHEMA in any Flyway migration or bootstrap script. After build-verify, CONFIRM the tables are under public (query information_schema.tables WHERE table_schema=\'public\') — a named schema is a failure, fix it before finishing.');}
    if(hasMy){p.push('- Database [SQL — MySQL, Spring Data JPA]: host='+val(form,'myHost')+', port='+val(form,'myPort')+', database='+val(form,'myDb')+', user='+val(form,'myUser')+', password='+val(form,'myPwd')+', ddl='+val(form,'myDdl'));
      var myx=val(form,'myExtra');if(myx)p.push('   Extra instructions (MySQL): '+myx);}
    if(hasMongo){p.push('- Database [NoSQL — MongoDB, Spring Data MongoDB]: uri='+val(form,'mongoUri')+', database='+val(form,'mongoDb')+', user='+val(form,'mongoUser')+', password='+val(form,'mongoPwd')+', authSource='+val(form,'mongoAuthSrc'));
      p.push('   Local Mongo auto-bootstrap: local MongoDB 8.2 runs on localhost:27017 WITH auth (admin/admin123, authSource=admin; mongosh at C:\\tools\\mongosh\\mongosh-2.5.8-win32-x64\\bin\\mongosh.exe). During build-verify, create a DEDICATED db user for this service (never reuse a shared user) via mongosh as admin, then verify the app connects with it. FLEXIBLE SCHEMA: every Mongo document class must include a Map<String,Object> attributes catch-all field (typed core fields + arbitrary per-document extras), threaded through the DTO and endpoints.');
      var mgx=val(form,'mongoExtra');if(mgx)p.push('   Extra instructions (MongoDB): '+mgx);}
    if(hasCb){p.push('- Database [NoSQL — Couchbase, Spring Data Couchbase]: connection='+val(form,'cbConn')+', bucket='+val(form,'cbBucket')+', scope='+val(form,'cbScope')+', collection='+val(form,'cbCollection')+', user='+val(form,'cbUser')+', password='+val(form,'cbPwd'));
      var cbx=val(form,'cbExtra');if(cbx)p.push('   Extra instructions (Couchbase): '+cbx);}
    if((hasPg?1:0)+(hasMy?1:0)+(hasMongo?1:0)+(hasCb?1:0)>1)p.push('- POLYGLOT PERSISTENCE: this service uses MULTIPLE databases side by side — configure each with its own Spring Data module, separate repositories/domain packages per store (e.g. domain.jpa vs domain.mongo), and document in the README which data lives where and why.');
    var dbx=val(form,'dbExtra');if(dbx)p.push('   General DB notes (cross-store): '+dbx);

    var items=form.querySelectorAll('.psg-api-item');
    var apiLines=[],dtoOrder=[],dtoFields={};
    function regDto(typeRaw,fields){var b=baseType(typeRaw);if(!b)return;if(dtoOrder.indexOf(b)<0)dtoOrder.push(b);if(fields&&!dtoFields[b])dtoFields[b]=fields;}
    items.forEach(function(it){
      var m=it.querySelector('[data-a="method"]');if(!m)return;
      var path=fld(it,'path');if(!path||path==='/api/')return;
      var reqT=fld(it,'req'),resT=fld(it,'res'),reqF=fld(it,'reqFields'),resF=fld(it,'resFields');
      regDto(reqT,reqF);regDto(resT,resF);
      apiLines.push('   - '+m.value+' '+path+'  request='+(reqT||'(none)')+'  response='+(resT||'(none)'));
    });
    p.push('- REST APIs: generate full CRUD for the main resource by default (GET list, GET by id, POST 201+envelope, PUT, DELETE 200+envelope-with-deleted)'+(apiLines.length?' PLUS these extra/override endpoints:':'.'));
    if(apiLines.length)p.push(apiLines.join('\n'));
    var dtoLines=dtoOrder.filter(function(b){return dtoFields[b];}).map(function(b){return '   - '+b+' { '+dtoFields[b]+' }';});
    if(dtoLines.length){
      p.push('- DTOs (define each ONCE as a single shared class/record and reuse it everywhere the type name appears — including inside List<...>/collections; do NOT redefine the same type per endpoint):');
      p.push(dtoLines.join('\n'));
    }

    if(val(form,'security')||val(form,'jwt')){
      var sec=[];
      if(val(form,'security'))sec.push('Spring Security with an HTTP SecurityFilterChain (stateless, CSRF off for APIs, configurable public vs authenticated paths)');
      if(val(form,'jwt'))sec.push('JWT authentication via a OncePerRequestFilter that validates the Bearer token and sets the SecurityContext'+(val(form,'jwtNote')?' — '+val(form,'jwtNote'):''));
      p.push('- Security: '+sec.join('; '));
    }
    var msg=[];
    if(val(form,'kafka'))msg.push('Kafka (topics: '+val(form,'kafkaTopics')+') — connect to the LOCAL Kafka broker at localhost:9092 (KRaft install at C:\\kafka; start it if not running). Keep a kafka service in docker-compose ONLY as a fallback for machines without the local install — do not start it locally.');
    if(val(form,'activemq')){
      var ar=val(form,'amqRuntime');
      if(ar==='Docker')msg.push('ActiveMQ [DOCKER]: run image '+val(form,'amqImage')+' in docker-compose (port '+val(form,'amqPort')+', user='+val(form,'amqUser')+'/password='+val(form,'amqPwd')+', queues='+val(form,'amqQueues')+'), reachable at tcp://'+val(form,'amqHost')+':'+val(form,'amqPort'));
      else msg.push('ActiveMQ [LOCAL — do NOT add to docker-compose]: connect to broker at tcp://'+val(form,'amqHost')+':'+val(form,'amqPort')+' (user='+val(form,'amqUser')+'/password='+val(form,'amqPwd')+', queues='+val(form,'amqQueues')+')');
      var amqx=val(form,'amqExtra');if(amqx)msg.push('ActiveMQ extra instructions: '+amqx);
    }
    if(val(form,'redis')){
      var rr=val(form,'redisRuntime');
      if(rr==='Docker')msg.push('Redis cache [DOCKER]: run image '+val(form,'redisImage')+' in docker-compose (port '+val(form,'redisPort')+(val(form,'redisPwd')?', password set':'')+'), reachable at '+val(form,'redisHost')+':'+val(form,'redisPort'));
      else msg.push('Redis cache [LOCAL — do NOT add to docker-compose]: connect to Redis at '+val(form,'redisHost')+':'+val(form,'redisPort')+(val(form,'redisPwd')?' (password set)':''));
      var rdx=val(form,'redisExtra');if(rdx)msg.push('Redis extra instructions: '+rdx);
    }
    if(val(form,'h2db')){
      var hb=['storage='+val(form,'h2Storage'),'console='+val(form,'h2Console'),'compatibility mode='+val(form,'h2Mode')];
      var hn=val(form,'h2Note');if(hn)hb.push('instructions: '+hn);
      msg.push('H2 database: '+hb.join(', '));
    }
    if(msg.length){p.push('- Messaging/cache:');msg.forEach(function(m){p.push('   - '+m);});}
    p.push('- Dockerfile: '+(val(form,'docker')?'create (multi-stage, non-root)':'skip'));
    p.push('- Kubernetes manifests: '+(val(form,'k8s')?'create (Deployment + Service + probes + resource limits)':'skip'));
    var dep=val(form,'deploy');if(dep)p.push('- Deploy target: '+dep);
    var c=val(form,'comments');if(c)p.push('- Additional instructions: '+c);
    p.push('- IntelliJ run configuration: also create a shareable .run/'+name+'.run.xml (a Maven run config invoking spring-boot:run, workingDir $PROJECT_DIR$) so the service is runnable in IntelliJ immediately on import with no manual setup.');
    if(hasSql){p.push('- Configuration: configure H2 by default in application.yaml so the service boots out-of-the-box with no external SQL DB; the selected SQL DB(s) are profile-activated. Use H2 for JPA tests.'+(hasMongo?' MongoDB (document store, no H2 equivalent) connects to the local server in ALL profiles.':''));}
    else if(hasMongo){p.push('- Configuration: default profile connects to the local MongoDB (no H2 — document store).');}
    if(hasMongo){p.push('- MONGO TESTS: do NOT use @DataMongoTest or Flapdoodle embedded Mongo (de.flapdoodle.embed.mongo) — it downloads a Mongo binary at test time and fails offline (the exact failure the user hit). Instead: unit-test services with Mockito-mocked repositories, test controllers with @WebMvcTest + @MockBean, and if a test truly needs a real Mongo, point it at the LOCAL running Mongo (localhost:27017, admin/admin123) via properties — never embedded. Exclude/omit the embedded-mongo dependency entirely. Do NOT point tests at a separate "<db>Test" Mongo database (mocked repos need no DB) — that leaves a stray duplicate DB in the tree (regressed 2026-07-06: smallTestTest).');
      p.push('   MONGO VISIBILITY & SINGLE DB: all data MUST land in the ONE configured database — never a stray "<db>Test" duplicate. Seed initial documents via a @Configuration/CommandLineRunner that runs on the default profile only (never in tests). At build-verify, confirm db.<collection>.countDocuments() > 0 in the configured db AND that no stray "<db>Test" database was created (drop it with db.getSiblingDB("<db>Test").dropDatabase() if a test made one).');}
    p.push('- Package layout: controllers in <base>.controller, custom exceptions AND the @RestControllerAdvice handler in <base>.exception (never a web package); plus service, repository, domain/entity, dto.');
    p.push('- Exception handler: the @RestControllerAdvice must special-case NoResourceFoundException (favicon.ico etc.) returning a quiet 404 WITHOUT stack-trace ERROR logging — the catch-all Exception handler must not swallow it as a logged 500.');
    p.push('- Boilerplate: DTOs as records; wherever a class cannot be a record (JPA entities etc.) use Lombok (@Getter/@Setter/@NoArgsConstructor/@AllArgsConstructor, @RequiredArgsConstructor for injection, @Slf4j) — include the lombok dependency.');
    p.push('- FILE ORDERING (critical): WRITE every generated file to disk — Java sources, db/bootstrap/00_create_role_and_db.sql, db/bootstrap/01_create_mongo_user.js, application.yaml — BEFORE running any command that reads it. Do NOT run "psql -f <file>" or "mongosh <file>" before that file exists. If a run reports "No such file or directory", the script was never created — create it first, then re-run.');
    p.push('General: production-grade only, constructor injection, SLF4J logging, bean validation, unit + component tests, @RestControllerAdvice global exception handler, @Transactional(rollbackFor = Exception.class) on transactional service methods, actuator health/probes, OpenAPI/Swagger, detailed README. Explain architecture decisions. After building: run the full build-verify loop (mvn clean verify with JDK 21, boot the app, hit health + a real endpoint) and then render the build-summary card.');
    return p.join('\n');
  }
  function genBoot(form){
    var name=val(form,'name')||'demo';var s=[];
    ['s_web:web','s_jpa:spring-data-jpa','s_val:validation','s_act:actuator','s_swag:springdoc-openapi/swagger','s_sec:spring-security (HTTP filter chain)','s_jwt:JWT auth (OncePerRequestFilter)','s_test:JUnit5+Mockito tests','s_h2:H2 for local/test','s_lombok:lombok'].forEach(function(x){var k=x.split(':');if(val(form,k[0]))s.push(k[1]);});
    return ['Create a simple Spring Boot application (start.spring.io style). Follow the spring-boot skill.',
      '- Location: '+val(form,'location')+'\\'+name,'- App name: '+name,'- Base package: '+(val(form,'package')||'com.gym.'+name.toLowerCase()),
      '- Server port: '+val(form,'port'),'- Java version: '+val(form,'java'),
      '- Starters/deps: '+s.join(', '),
      '- Always include the main @SpringBootApplication class with public static void main (the runnable entry point).',
      '- Configure H2 by default in application.yaml (boots with no external DB), plus actuator and Swagger UI out of the box.',
      '- Also create a shareable IntelliJ run configuration at .run/'+name+'.run.xml (a Maven run config invoking spring-boot:run, workingDir $PROJECT_DIR$) so it runs in IntelliJ immediately on import with no manual setup.',
      (val(form,'comments')?'- Comments: '+val(form,'comments'):''),
      'Production-grade structure, a sample controller+service, README.'].filter(Boolean).join('\n');
  }
  function genJava(form){
    var name=val(form,'name')||'my-app';
    return ['Create a minimal Java application.',
      '- Location: '+val(form,'location')+'\\'+name,'- App name: '+name,'- Base package: '+(val(form,'package')||'com.gym.'+name.toLowerCase()),
      '- Java version: '+val(form,'java'),'- Build tool: '+val(form,'build'),
      '- Always include a runnable Main class with public static void main (the entry point).',
      '- Also create a shareable IntelliJ run configuration at .run/'+name+'.run.xml (Application type pointing at the Main class, module = Maven artifactId) so it runs in IntelliJ immediately on import with no manual setup.',
      (val(form,'comments')?'- Comments: '+val(form,'comments'):''),
      'Include the '+val(form,'build')+' build file, a JUnit5 test, and a short README.'].filter(Boolean).join('\n');
  }
  var gens={ms:genMS,boot:genBoot,java:genJava};
  document.querySelectorAll('.psg-gen').forEach(function(b){
    if(b.classList.contains('psg-qa')||b.classList.contains('psg-toapi'))return;
    b.onclick=function(){var t=b.getAttribute('data-type');sendPrompt(gens[t](forms[t]));};
  });
  document.querySelectorAll('.psg-qa').forEach(function(b){b.onclick=function(){
    var t=b.getAttribute('data-type');
    sendPrompt(gens[t](forms[t])+'\n\nTHEN, once the build-verify loop is green, using the senior-qa skill run a QA pass on the service you just built — coverage review against the test pyramid, run the tests (mvn clean verify, JDK 21), and a short adversarial probe of the endpoints (unknown id -> 404, invalid body -> 400, duplicate -> 409) — and render the standard QA report widget.');
  };});
  document.querySelectorAll('.psg-toapi').forEach(function(b){b.onclick=function(){
    var f=forms[b.getAttribute('data-type')];
    var name=val(f,'name')||'NewService', base='http://localhost:'+(val(f,'port')||'8080');
    var dbs=[];
    if(val(f,'dbPg'))dbs.push('PostgreSQL '+(val(f,'sqlHost')||'localhost')+':'+(val(f,'sqlPort')||'5432')+'/'+(val(f,'sqlDb')||name));
    if(val(f,'dbMy'))dbs.push('MySQL '+(val(f,'myHost')||'localhost')+':'+(val(f,'myPort')||'3306')+'/'+(val(f,'myDb')||name));
    if(val(f,'dbMongo'))dbs.push('MongoDB '+(val(f,'mongoUri')||'mongodb://localhost:27017')+'/'+(val(f,'mongoDb')||name));
    if(val(f,'dbCb'))dbs.push('Couchbase '+(val(f,'cbConn')||'couchbase://localhost')+'/'+(val(f,'cbBucket')||name));
    if(!dbs.length)dbs.push('H2 in-memory (default)');
    var eps=['full CRUD for the main resource'];
    f.querySelectorAll('.psg-api-item').forEach(function(it){var m=it.querySelector('[data-a="method"]');var pe=it.querySelector('[data-a="path"]');var pa=pe?(pe.value||'').trim():'';if(pa&&pa!=='/api/')eps.push((m?m.value:'GET')+' '+pa);});
    sendPrompt('Do NOT build anything. Render an API-surface card (visualize widget) for the planned service '+name+': endpoints — '+eps.join('; ')+'. Databases — '+dbs.join('; ')+'. Swagger UI: '+base+'/swagger-ui/index.html. Actuator: '+base+'/actuator/health, '+base+'/actuator/info. H2 console (dev/test datasource): '+base+'/h2-console — jdbc:h2:mem:'+name.toLowerCase()+'db, user sa / empty password.');
  };});
})();
</script>
```
