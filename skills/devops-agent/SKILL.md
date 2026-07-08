---
name: devops-agent
description: AI DevOps agent control panel. Renders an interactive widget of action cards (health check, deploy, diagnose & fix, logs, redeploy-all, ECR image manager, CI/CD pipelines, cost & scaling) for the gym-platform-cluster (AWS ECS, us-east-1, 8 services); each button invokes Claude as the agent via sendPrompt(). Use when the user invokes /devops-agent or asks for a DevOps control panel / cluster operations dashboard. Global skill — extend with more targets/actions over time.
---

# DevOps Agent

An AI DevOps control panel. Render the interactive HTML widget below via the visualize show_widget tool (title `devops_agent`). Each action card button calls `sendPrompt()` to invoke Claude as the DevOps agent against the target infrastructure.

Currently targets the **gym-platform-cluster** (AWS ECS Fargate, us-east-1, 8 services). This is a global skill meant to be **extended later** — add new clusters/environments, more action cards, or additional cloud targets by extending the widget and this file.

```html
<style>
*{box-sizing:border-box;}
.header{display:flex;align-items:center;gap:10px;margin-bottom:4px;}
.agent-badge{font-size:11px;font-weight:500;background:var(--color-background-success);color:var(--color-text-success);padding:3px 10px;border-radius:99px;margin-left:auto;}
.subtitle{font-size:12px;color:var(--color-text-secondary);margin:0 0 20px;}
.section-title{font-size:11px;font-weight:500;color:var(--color-text-secondary);letter-spacing:.7px;text-transform:uppercase;margin:0 0 10px;}
.action-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:20px;}
.action-card{background:var(--color-background-primary);border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-lg);padding:1rem;cursor:pointer;transition:border-color .15s;}
.action-card:hover{border-color:var(--color-border-primary);}
.action-icon{font-size:20px;color:var(--color-text-secondary);margin-bottom:8px;}
.action-title{font-size:13px;font-weight:500;color:var(--color-text-primary);margin:0 0 4px;}
.action-desc{font-size:12px;color:var(--color-text-secondary);margin:0 0 12px;line-height:1.4;}
.action-btn{width:100%;font-size:12px;padding:6px;border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);background:transparent;cursor:pointer;color:var(--color-text-primary);font-weight:500;transition:background .15s;margin-bottom:6px;}
.action-btn:last-child{margin-bottom:0;}
.action-btn:hover{background:var(--color-background-secondary);}
.btn-teal{border-color:#1D9E75!important;color:#085041!important;}
.btn-teal:hover{background:#E1F5EE!important;}
.btn-blue{border-color:#378ADD!important;color:#0C447C!important;}
.btn-blue:hover{background:#E6F1FB!important;}
.btn-amber{border-color:#BA7517!important;color:#633806!important;}
.btn-amber:hover{background:#FAEEDA!important;}
.btn-red{border-color:#E24B4A!important;color:#791F1F!important;}
.btn-red:hover{background:#FCEBEB!important;}
.btn-purple{border-color:#534AB7!important;color:#26215C!important;}
.btn-purple:hover{background:#EEEDFE!important;}
.svc-select{width:100%;margin-bottom:8px;font-size:12px;}
.divider{height:0.5px;background:var(--color-border-tertiary);margin:4px 0 20px;}
.quick-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;}
.quick-btn{font-size:12px;padding:5px 12px;border:0.5px solid var(--color-border-secondary);border-radius:99px;background:transparent;cursor:pointer;color:var(--color-text-secondary);transition:background .15s;}
.quick-btn:hover{background:var(--color-background-secondary);color:var(--color-text-primary);}
</style>

<div style="padding:1.25rem 0;">
<div class="header">
  <i class="ti ti-robot" style="font-size:20px;color:var(--color-text-secondary);"></i>
  <div><p style="font-size:16px;font-weight:500;margin:0;color:var(--color-text-primary);">devops-agent</p></div>
  <span class="agent-badge"><i class="ti ti-circle-check" style="font-size:12px;margin-right:4px;vertical-align:-1px;"></i>Ready</span>
</div>
<p class="subtitle">gym-platform-cluster · us-east-1 · 8 services · Claude-powered DevOps agent</p>

<p class="section-title">Quick actions</p>
<div class="quick-row">
  <button class="quick-btn" onclick="sendPrompt('Check the health of all 8 services in gym-platform-cluster right now. Show running/desired counts, last event, and flag anything not healthy.')">Health check all ↗</button>
  <button class="quick-btn" onclick="sendPrompt('Show the last 10 CloudWatch log entries for each unhealthy ECS service in gym-platform-cluster.')">Error logs ↗</button>
  <button class="quick-btn" onclick="sendPrompt('What is the current deployment status of gym-platform-cluster? Any pending or in-progress deployments?')">Deployment status ↗</button>
  <button class="quick-btn" onclick="sendPrompt('List all ECR repositories for the gym platform and show which have images and which are empty.')">ECR image check ↗</button>
</div>

<div class="divider"></div>
<p class="section-title">Agent actions</p>
<div class="action-grid">

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-stethoscope"></i></div>
    <p class="action-title">Full health report</p>
    <p class="action-desc">Deep scan all services — ECS state, ALB health, task failures, latest events.</p>
    <button class="action-btn btn-teal" onclick="sendPrompt('Run a full health report on gym-platform-cluster. For each of the 8 services (gym-auth-service-svc, gym-gymmanager-svc, gym-gym-service-svc, gym-booking-service-svc, gym-payment-service-svc, gym-notification-service-svc, gym-simulator-svc, gym-gymmanager-frontend-svc) check: ECS running vs desired, deployment rollout state, latest event message. Summarise in a table and list all issues found.')">Run full report ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-rocket"></i></div>
    <p class="action-title">Deploy a service</p>
    <p class="action-desc">Force redeploy any single service with ECS rolling update.</p>
    <select class="svc-select" id="deploy-svc">
      <option>gym-auth-service-svc</option>
      <option>gym-gymmanager-svc</option>
      <option>gym-gym-service-svc</option>
      <option>gym-booking-service-svc</option>
      <option>gym-payment-service-svc</option>
      <option>gym-notification-service-svc</option>
      <option>gym-simulator-svc</option>
      <option>gym-gymmanager-frontend-svc</option>
    </select>
    <button class="action-btn btn-teal" onclick="sendPrompt('Force redeploy the ECS service ' + document.getElementById('deploy-svc').value + ' on gym-platform-cluster (us-east-1). Give the exact AWS CLI command, explain the rolling deployment process, and how to monitor until stable.')">Deploy selected ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-tool"></i></div>
    <p class="action-title">Diagnose & fix</p>
    <p class="action-desc">Get step-by-step fix instructions for a failing service.</p>
    <select class="svc-select" id="fix-svc">
      <option>gym-gymmanager-frontend-svc</option>
      <option>gym-simulator-svc</option>
      <option>gym-auth-service-svc</option>
      <option>gym-gymmanager-svc</option>
      <option>gym-gym-service-svc</option>
      <option>gym-booking-service-svc</option>
      <option>gym-payment-service-svc</option>
      <option>gym-notification-service-svc</option>
    </select>
    <button class="action-btn btn-red" onclick="sendPrompt('Diagnose and fix the ECS service ' + document.getElementById('fix-svc').value + ' on gym-platform-cluster. Check running vs desired counts, latest events, ECR image existence, and CloudWatch logs. Give complete step-by-step fix instructions.')">Diagnose & fix ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-file-text"></i></div>
    <p class="action-title">View logs</p>
    <p class="action-desc">Fetch recent CloudWatch logs for any service to debug errors.</p>
    <select class="svc-select" id="log-svc">
      <option value="gym-gymmanager-frontend-task">gymmanager-frontend</option>
      <option value="gym-auth-service-task">auth-service</option>
      <option value="gym-gymmanager-task">gymmanager</option>
      <option value="gym-gym-service-task">gym-service</option>
      <option value="gym-booking-service-task">booking-service</option>
      <option value="gym-payment-service-task">payment-service</option>
      <option value="gym-notification-service-task">notification-service</option>
      <option value="gym-simulator-task">simulator</option>
    </select>
    <button class="action-btn btn-blue" onclick="sendPrompt('Fetch the last 20 CloudWatch log entries from log group /ecs/' + document.getElementById('log-svc').value + ' in us-east-1. Give the exact AWS CLI command and explain what to look for.')">Fetch logs ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-refresh"></i></div>
    <p class="action-title">Redeploy all</p>
    <p class="action-desc">Force rolling redeploy of every service in the cluster at once.</p>
    <button class="action-btn btn-amber" onclick="sendPrompt('Generate AWS CLI commands to force-new-deployment on all 8 services in gym-platform-cluster: gym-auth-service-svc, gym-gymmanager-svc, gym-gym-service-svc, gym-booking-service-svc, gym-payment-service-svc, gym-notification-service-svc, gym-simulator-svc, gym-gymmanager-frontend-svc. Include a wait command to monitor until all are stable.')">Redeploy all ↗</button>
    <button class="action-btn btn-blue" onclick="sendPrompt('Monitor deployment progress of all 8 services in gym-platform-cluster. Show which are deploying, pending, or stable.')">Monitor progress ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-brand-docker"></i></div>
    <p class="action-title">ECR image manager</p>
    <p class="action-desc">Check Docker images in ECR — tags, push dates, empty repos.</p>
    <select class="svc-select" id="ecr-repo">
      <option>gym-platform/gymmanager-frontend</option>
      <option>gym-gymmanager</option>
      <option>gym-platform/auth-service</option>
      <option>gym-platform/gym-service</option>
      <option>gym-platform/booking-service</option>
      <option>gym-platform/payment-service</option>
      <option>gym-platform/notification-service</option>
      <option>gym-platform/gym-simulator</option>
    </select>
    <button class="action-btn btn-blue" onclick="sendPrompt('Check ECR repository ' + document.getElementById('ecr-repo').value + ' in us-east-1. List all available image tags, show the latest push date, and tell me if the repository is empty.')">Check images ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-git-branch"></i></div>
    <p class="action-title">CI/CD pipelines</p>
    <p class="action-desc">Trigger or inspect GitHub Actions for both repos.</p>
    <button class="action-btn btn-purple" onclick="sendPrompt('How do I trigger the GitHub Actions CI/CD pipeline for michabun123/GymManger (Spring Boot backend)? Walk me through triggering via empty commit and monitoring the run.')">Backend pipeline ↗</button>
    <button class="action-btn btn-purple" onclick="sendPrompt('How do I trigger the GitHub Actions CI/CD pipeline for michabun123/frontend_GymManger (React+Vite+Nginx frontend)? It needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY secrets. Walk me through secrets setup and first run.')">Frontend pipeline ↗</button>
  </div>

  <div class="action-card">
    <div class="action-icon"><i class="ti ti-chart-line"></i></div>
    <p class="action-title">Cost & scaling</p>
    <p class="action-desc">Analyse cluster costs and suggest right-sizing optimisations.</p>
    <button class="action-btn btn-amber" onclick="sendPrompt('Analyse ECS Fargate costs for gym-platform-cluster. List each service with CPU/memory allocation, estimate monthly Fargate cost, and suggest right-sizing optimisations.')">Cost analysis ↗</button>
    <button class="action-btn btn-blue" onclick="sendPrompt('Which services in gym-platform-cluster should be scaled up or down? The simulator currently runs 2 tasks — is that necessary? Give concrete scaling recommendations.')">Scaling advice ↗</button>
  </div>

</div>
</div>
```
