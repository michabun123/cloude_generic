# MN&J Labs — TODO

Small things parked deliberately, so they don't get lost between sessions.

## Tomorrow (agreed 2026-08-04)

- [ ] **Email setup explained simply** — where things live, what to change, and *why* 2-Step
      Verification + a generated App Password were needed at all.
- [ ] **Firebase overview, kept simple** — architecture, components, what runs where and how,
      and the main code blocks mapped to Spring vocabulary (controllers / services / entities /
      events → onRequest / services / model / triggers).
- [ ] **Continue Proofly on Firebase** — next up: point the Flutter app at the Firebase backend
      (needs client auth; it currently gets 401s), then photos → Cloud Storage.
- [ ] **HPA — Horizontal Pod Autoscaler overview** (knowledge-base task): what it scales on,
      metrics server, requests/limits, min/max replicas, cooldown, HPA vs VPA vs Cluster Autoscaler,
      and why it does nothing without resource requests set.

## WhatsApp (future discussion, not scheduled)

- [ ] **Decide whether to add WhatsApp messaging.** Researched 2026-08-04, nothing built yet.

  **The rule that shapes everything:** you cannot message anyone freely. Inside a 24-hour window
  (they messaged you last) any text is allowed. Outside it, only a **template pre-approved by Meta**
  — approval takes about a day, and the wording is fixed once approved. So the design question is
  "which 3-5 messages do we ever need to send", not "how do we send anything".

  **Route:** start on the **Twilio sandbox** (free trial, no card, join by texting a keyword — sending
  within minutes). Meta Cloud API direct is cheaper but needs business verification.

  **Cost — two bills.** Meta charges per delivered template message by country + category; Twilio adds
  a flat $0.005. Germany is among the most expensive markets:
  utility ~EUR 0.046, marketing ~EUR 0.113, service replies (inside the window) free from Meta.
  Proofly at 500 reports/month ~ EUR 25/month.

  **Why stay on Twilio longer than the usual advice:** its $0.005 markup is under 10% of the German
  total, so going direct to Meta saves little while adding verification and webhook work. That
  calculus flips only for cheap-rate countries at volume.

  **Never use** whatsapp-web.js / Baileys — headless-browser automation, violates the ToS, gets numbers
  banned. Fine for a toy, never for a business number.

  **Natural fit for Proofly:** report signed -> the existing `onReportWritten` trigger -> utility
  template "Your handover report for {{property}} is ready" + link. Inbound replies need a public
  webhook, which a Cloud Function already gives us.

  Rates change (Meta restructured pricing during 2025) — check the live calculator before budgeting.

## Mail

- [ ] **Create `support@mnjlabs.com` and send from it.**
  Team mail currently goes out as `michaelbu@mnjlabs.com` (Michael's personal mailbox).
  A shared sender is better: replies land somewhere the team can see, and it reads as
  the company rather than one person.

  What it needs:
  1. Google Workspace admin → create `support@mnjlabs.com`. A **group/alias is free**;
     a full user seat is billed — an alias is enough for sending.
  2. If it is an alias, add it in Gmail → Settings → Accounts → *Send mail as*, and
     verify it. SMTP will then accept it as the `From`.
  3. A separate App Password is **not** needed — keep authenticating as
     `michaelbu@mnjlabs.com` and just change the `From`.
  4. Update `MAIL_FROM` in `mail-env.ps1` to `MN&J Labs <support@mnjlabs.com>`
     and set `replyTo` in `/mail/send` (server.js) to the same address.

  Gotcha: Gmail silently rewrites the `From` to the authenticated mailbox if the
  alias is not verified — the mail still sends, so it looks like it worked. Check the
  received message's actual `From` header, not the send result.

- [ ] Rotate the Google App Password. The current one was shared in a chat transcript
      on 2026-08-03. Revoke at https://myaccount.google.com/apppasswords and paste a
      fresh one into `mail-env.ps1`.

- [ ] Consider a send log (who sent what to whom, when). Right now `/mail/send` only
      writes a line to the server console.

## Command Center

- [ ] Vadim has no email in the `TEAM` map (`dashboards.html`) — his card falls back to
      "no email on file". Add it when known.
