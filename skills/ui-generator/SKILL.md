---
name: ui-generator
description: Interactive frontend/UI project scaffolding generator. Sidebar nav (React app [Vite+TS+Tailwind] / Flutter app) + content pane. Fill details (location preset dropdown+chips, name, port/org, setup toggles: React Router/TanStack Query/axios/Vitest or Riverpod/go_router/dio/platforms, backend API base URL). Emits a complete frontend build prompt via sendPrompt(). Use when the user wants to scaffold a new UI/frontend app or invokes /ui-generator. For backend services use the backend-generator skill instead.
---

# UI Generator

Render the following interactive HTML widget (via the visualize show_widget tool, title `ui_generator`). Header bar, left sidebar switching two frontend generators (React app [Vite+TS+Tailwind], Flutter app), content pane with the active form; each form assembles a build prompt and submits it via `sendPrompt()`. React = Vite + React 18 + TypeScript (strict) + Tailwind, optional React Router / TanStack Query / axios / Vitest; Flutter = Dart + Material 3, state management (Riverpod/Provider/Bloc), go_router, dio, web/mobile platforms. Both take an optional backend API base URL and produce a runnable app + README. Backend services (Java/Python) live in the separate backend-generator skill.

```html
<h2 class="sr-only">UI generator web app — sidebar selects React or Flutter; fill the form and generate a frontend build prompt.</h2>

<style>
.app{border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);overflow:hidden;background:var(--color-background-primary);margin:1rem 0}
.app-header{display:flex;align-items:center;gap:11px;padding:13px 18px;border-bottom:0.5px solid var(--color-border-tertiary);background:var(--color-background-secondary)}
.app-header .hicon{width:30px;height:30px;border-radius:var(--border-radius-md);background:var(--color-background-info);display:flex;align-items:center;justify-content:center}
.app-header .hicon i{font-size:18px;color:var(--color-text-info)}
.app-title{font-size:15px;font-weight:500;line-height:1.2}
.app-sub{font-size:12px;color:var(--color-text-tertiary)}
.app-body{display:flex;align-items:stretch}
.app-nav{width:184px;flex-shrink:0;border-right:0.5px solid var(--color-border-tertiary);padding:10px;background:var(--color-background-secondary)}
.nav-item{display:flex;align-items:center;gap:10px;width:100%;padding:8px 10px;border-radius:var(--border-radius-md);font-size:13px;color:var(--color-text-secondary);cursor:pointer;border:0;background:transparent;text-align:left;margin-bottom:5px}
.nav-item:hover{background:var(--color-background-primary)}
.nav-item.active{background:var(--color-background-primary);color:var(--color-text-primary);font-weight:500;box-shadow:inset 2px 0 0 var(--color-text-info)}
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
.psg-gen{background:var(--color-background-info);color:var(--color-text-info);border:0.5px solid var(--color-text-info);font-weight:500;padding:9px 20px;border-radius:var(--border-radius-md);margin-top:1.3rem}
.psg-gen:hover{filter:brightness(0.97)}
</style>

<div class="app">
  <div class="app-header">
    <span class="hicon"><i class="ti ti-device-desktop-code" aria-hidden="true"></i></span>
    <div><div class="app-title">UI Generator</div><div class="app-sub">scaffold a frontend app in one click</div></div>
  </div>
  <div class="app-body">
    <nav class="app-nav">
      <button class="nav-item active" data-go="react"><span class="nbadge" style="background:var(--color-background-info)"><i class="ti ti-brand-react" style="color:var(--color-text-info)" aria-hidden="true"></i></span> React app</button>
      <button class="nav-item" data-go="flutter"><span class="nbadge" style="background:var(--color-background-info)"><i class="ti ti-brand-flutter" style="color:var(--color-text-info)" aria-hidden="true"></i></span> Flutter app</button>
    </nav>
    <div class="app-main">

      <div id="psg-react" class="psg-form">
        <p class="main-title">React app (Vite + TypeScript + Tailwind)</p>
        <p class="main-desc">Vite · React 18 · TypeScript · Tailwind CSS · runnable dev server · README</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\gym\dev\modules\frontend" data-ll="c:\gym\dev\modules\frontend|gym frontend;c:\myPrograms\interview|interview"></div>
          <div class="psg-field"><label>App name</label><input data-f="name" placeholder="gym-web"></div>
          <div class="psg-field"><label>Dev port</label><input data-f="port" type="number" value="5173" step="1"></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-components" aria-hidden="true"></i> Setup</h3>
          <div class="psg-grid">
            <label class="psg-chk"><input type="checkbox" data-f="router" checked> React Router</label>
            <label class="psg-chk"><input type="checkbox" data-f="query"> TanStack Query (data fetching)</label>
            <label class="psg-chk"><input type="checkbox" data-f="axios" checked> axios API client</label>
            <label class="psg-chk"><input type="checkbox" data-f="vitest" checked> Vitest + Testing Library</label>
          </div>
          <div class="psg-field" style="margin:10px 0 0"><label>Backend API base URL (optional)</label><input data-f="apiBase" placeholder="http://localhost:8080"></div>
        </div>
        <div class="psg-field"><label>Comments — pages / features</label><textarea data-f="comments" placeholder="e.g. gym map landing page, login, booking flow"></textarea></div>
        <p class="psg-muted">Baked in: Vite + TS strict, Tailwind configured, ESLint/Prettier, folder structure (components/pages/hooks/api), env via <code>import.meta.env</code>, a sample page + component + test, runnable <code>npm run dev</code>, README.</p>
        <button class="psg-gen" data-type="react">Generate React app ↗</button>
      </div>

      <div id="psg-flutter" class="psg-form">
        <p class="main-title">Flutter app</p>
        <p class="main-desc">Flutter · Dart · Material 3 · runnable on web + mobile · README</p>
        <div class="psg-grid">
          <div class="psg-field loc-mount" data-lv="c:\gym\dev\modules\frontend" data-ll="c:\gym\dev\modules\frontend|gym frontend;c:\myPrograms\interview|interview"></div>
          <div class="psg-field"><label>App name (snake_case)</label><input data-f="name" placeholder="gym_app"></div>
          <div class="psg-field"><label>Org / bundle id</label><input data-f="org" value="com.gym"></div>
        </div>
        <div class="psg-sec"><h3><i class="ti ti-components" aria-hidden="true"></i> Setup</h3>
          <div class="psg-grid">
            <div class="psg-field"><label>State management</label><select data-f="state"><option>Riverpod</option><option>Provider</option><option>Bloc</option><option>setState (none)</option></select></div>
            <label class="psg-chk"><input type="checkbox" data-f="router" checked> go_router navigation</label>
            <label class="psg-chk"><input type="checkbox" data-f="dio" checked> dio API client</label>
          </div>
          <div class="psg-grid" style="margin-top:8px">
            <div class="psg-field"><label>Platforms</label><select data-f="platforms"><option>web + mobile</option><option>web only</option><option>mobile only</option></select></div>
            <div class="psg-field"><label>Backend API base URL (optional)</label><input data-f="apiBase" placeholder="http://localhost:8080"></div>
          </div>
        </div>
        <div class="psg-field"><label>Comments — screens / features</label><textarea data-f="comments" placeholder="e.g. gym map landing, auth, booking"></textarea></div>
        <p class="psg-muted">Baked in: Material 3 theme, feature-first folder structure, a sample screen + widget + widget test, runnable <code>flutter run</code>, README.</p>
        <button class="psg-gen" data-type="flutter">Generate Flutter app ↗</button>
      </div>

    </div>
  </div>
</div>

<script>
(function(){
  var forms={react:document.getElementById('psg-react'),flutter:document.getElementById('psg-flutter')};
  var navs=document.querySelectorAll('.nav-item');
  function show(id){for(var k in forms)forms[k].style.display=(k===id?'block':'none');navs.forEach(function(n){n.classList.toggle('active',n.getAttribute('data-go')===id);});}
  show('react');
  navs.forEach(function(n){n.onclick=function(){show(n.getAttribute('data-go'));};});

  // build the shared Location picker (input + preset select + chips) from each mount's data-* config
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

  function genReact(form){
    var name=val(form,'name')||'web-app';var opts=[];
    if(val(form,'router'))opts.push('React Router');
    if(val(form,'query'))opts.push('TanStack Query');
    if(val(form,'axios'))opts.push('axios API client (base URL from import.meta.env.VITE_API_BASE_URL)');
    if(val(form,'vitest'))opts.push('Vitest + React Testing Library with a sample test');
    return ['Create a runnable React front-end app with Vite + TypeScript (strict) + Tailwind CSS.',
      '- Location: '+val(form,'location')+'\\'+name,'- App name: '+name,'- Dev server port: '+val(form,'port'),
      '- Include: '+(opts.length?opts.join(', '):'a minimal single-page setup'),
      (val(form,'apiBase')?'- Backend API base URL (VITE_API_BASE_URL in .env): '+val(form,'apiBase'):''),
      '- Structure: src/{components,pages,hooks,api,lib}; Tailwind configured (tailwind.config + index.css directives); ESLint + Prettier; env via import.meta.env.',
      '- Include a sample page + reusable component'+(val(form,'vitest')?' + a passing test':'')+'.',
      (val(form,'comments')?'- Pages/features: '+val(form,'comments'):''),
      'Deliverables: package.json with runnable "dev"/"build"/"test" scripts, .env.example, README (overview, stack, structure, run locally, env vars). After scaffolding, run npm install + npm run build to prove it compiles.'].filter(Boolean).join('\n');
  }
  function genFlutter(form){
    var name=val(form,'name')||'flutter_app';
    return ['Create a runnable Flutter app (Dart, Material 3).',
      '- Location: '+val(form,'location')+'\\'+name,'- App name (snake_case): '+name,'- Org/bundle id: '+(val(form,'org')||'com.gym'),
      '- Platforms: '+val(form,'platforms'),
      '- State management: '+val(form,'state'),
      (val(form,'router')?'- Navigation: go_router':''),
      (val(form,'dio')?'- API client: dio'+(val(form,'apiBase')?' (base URL '+val(form,'apiBase')+', configurable via --dart-define)':''):''),
      '- Structure: feature-first (lib/features/*, lib/core/*); Material 3 theme; a sample screen + reusable widget + a widget test.',
      (val(form,'comments')?'- Screens/features: '+val(form,'comments'):''),
      'Deliverables: pubspec.yaml with the chosen deps, README (overview, stack, structure, run: flutter run -d chrome / device, env). After scaffolding, run flutter pub get + flutter analyze to prove it is clean.'].filter(Boolean).join('\n');
  }
  document.querySelectorAll('.psg-gen').forEach(function(b){b.onclick=function(){
    var t=b.getAttribute('data-type');var form=forms[t];
    var gens={react:genReact,flutter:genFlutter};
    sendPrompt(gens[t](form));
  };});
})();
</script>
```
