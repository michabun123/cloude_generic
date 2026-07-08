---
name: qa-runner
description: Interactive QA runner widget. Renders a panel where the user picks a project and QA modes (coverage review, write & run tests, API-contract QA, adversarial), then Run triggers the senior-qa skill on that project via sendPrompt and produces the standard QA report widget. Use when the user invokes /qa-runner or asks for an on-demand test/QA runner.
---

# QA Runner

Render the following interactive widget via the visualize show_widget tool (title `qa_runner`). Selecting a project + modes and clicking Run calls `sendPrompt()` with an instruction that invokes the **senior-qa** skill on the chosen project. senior-qa then reviews/tests/probes and renders its QA report widget. spring-boot conventions are never overridden (QA is additive).

Known projects are preloaded; the path field is editable for any other project.

```html
<h2 class="sr-only">QA runner — choose a project and QA modes, then run the senior-qa engineer on it.</h2>
<div style="padding:1rem 0">
  <div style="display:flex;align-items:center;gap:10px;margin:0 0 1.2rem">
    <span style="width:32px;height:32px;border-radius:8px;background:var(--bg-accent);display:flex;align-items:center;justify-content:center"><i class="ti ti-test-pipe" style="font-size:18px;color:var(--text-accent)" aria-hidden="true"></i></span>
    <div><div style="font-size:16px;font-weight:500">QA runner</div><div style="font-size:12px;color:var(--text-muted)">senior-qa on demand · Spring Boot microservices</div></div>
  </div>

  <label style="display:block;font-size:12px;font-weight:500;color:var(--text-secondary);margin:0 0 5px">Project</label>
  <select id="qa-proj" style="width:100%;margin:0 0 6px">
    <option value="c:\Interviews\preps\prepTestAccountMS|prepTestAccountMS">prepTestAccountMS — polyglot PG+Mongo</option>
    <option value="c:\Interviews\preps\prepTestHello|prepTestHello">prepTestHello — users + salary (PG/H2)</option>
    <option value="c:\myPrograms\interview\paymentTestMS|paymentTestMS">paymentTestMS — payments (PG/H2/Kafka)</option>
    <option value="c:\myPrograms\interview\CustomerService|CustomerService">CustomerService — minimal</option>
  </select>
  <input id="qa-path" placeholder="…or paste any project path" style="width:100%;margin:0 0 16px">

  <label style="display:block;font-size:12px;font-weight:500;color:var(--text-secondary);margin:0 0 7px">QA modes</label>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin:0 0 16px;font-size:13.5px">
    <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="qa-mode" value="a coverage & test-strategy review against the pyramid" checked> Coverage review</label>
    <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="qa-mode" value="write the missing tests and run mvn clean verify (JDK 21)" checked> Write & run tests</label>
    <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="qa-mode" value="API-contract/endpoint QA against the running app with curl (status codes, envelopes, negative paths)" checked> API-contract QA</label>
    <label style="display:flex;align-items:center;gap:8px"><input type="checkbox" class="qa-mode" value="an adversarial review (Saboteur, Security Auditor, New Hire personas) to try to break it" checked> Adversarial</label>
  </div>

  <button id="qa-run" style="background:var(--bg-accent);color:var(--text-accent);border:0.5px solid var(--border-accent);font-weight:500;padding:9px 22px;border-radius:var(--radius)"><i class="ti ti-player-play" aria-hidden="true"></i> Run QA ↗</button>
  <p style="font-size:12px;color:var(--text-muted);margin:12px 0 0"><i class="ti ti-lock" aria-hidden="true"></i> Additive only — never changes spring-boot conventions. Fixes bugs, adds regression tests, renders a QA report widget.</p>

  <script>
  (function(){
    var run=document.getElementById('qa-run');
    run.onclick=function(){
      var sel=document.getElementById('qa-proj').value.split('|');
      var custom=document.getElementById('qa-path').value.trim();
      var path=custom||sel[0];
      var name=custom?custom.split(/[\\\\/]/).pop():sel[1];
      var modes=[].slice.call(document.querySelectorAll('.qa-mode:checked')).map(function(c){return c.value;});
      if(!modes.length){modes=['a full QA pass'];}
      var prompt='Using the senior-qa skill, QA '+name+' at '+path+' — do '+modes.join(', ')+'. '+
        'Follow the senior-qa rules: additive only (never change spring-boot conventions), boot the app and prove findings with real mvn/curl output, fix any real bug + add a regression test + re-verify, then render the standard QA report widget (one bug card per finding with Scenario/Cause/Fix/Verified).';
      sendPrompt(prompt);
    };
  })();
  </script>
</div>
```
