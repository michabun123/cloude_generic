# UX Copy Skill

## Trigger
Use when asked to: "write copy for", "what should this button say?", "review this error message", name a CTA, word a confirmation dialog, fill an empty state, write onboarding text, or improve any microcopy in a UI.

## Goal
Write or review UX copy — microcopy, error messages, empty states, CTAs, tooltips, onboarding, confirmation dialogs — that is clear, useful, and on-brand.

## Principles

### 1. Clarity Over Cleverness
- Users don't read; they scan. Every word must earn its place.
- Use plain language. Grade 6–8 reading level for consumer products.
- One idea per sentence.

### 2. Action-Oriented
- CTAs tell users exactly what will happen: "Save Changes" not "Submit"
- Use verbs: "Create", "Send", "Delete", "Download", not "OK", "Yes", "Confirm"
- Match the label to the outcome, not the user's action

### 3. Human & Helpful
- Write like a knowledgeable colleague, not a legal document
- Avoid: "Invalid input", "An error occurred", "Operation failed"
- Use: "That email isn't valid — try name@example.com", "Something went wrong. Try again."

### 4. Consistent Voice
- Define tone: Friendly? Professional? Playful? Authoritative?
- Use the same terms for the same things across the product
- Avoid jargon unless your users use it themselves

## Copy Patterns

### CTAs (Call to Action)
```
Formula: [Verb] + [Object] (+ [Context if needed])
Examples:
  Bad:  Submit | OK | Continue
  Good: Create Account | Save Changes | Send Message
  
Primary button: most important action, 1–4 words
Secondary button: alternative or cancellation, match verb to consequence
Destructive button: be specific — "Delete Project" not "Delete"
```

### Error Messages
```
Formula: [What went wrong] + [Why (if helpful)] + [How to fix it]
Examples:
  Bad:  "Error 403" | "Invalid credentials" | "Something went wrong"
  Good: "Incorrect password. Try again or reset your password."
        "That username is taken — try adding a number or underscore."
        "We couldn't save your changes. Check your connection and try again."

Rules:
- Never blame the user ("You entered...")
- Always offer a path forward
- Keep under 2 lines
```

### Empty States
```
Formula: [What's missing] + [Why it's empty] + [What to do]
Examples:
  Bad:  "No data" | "Nothing here yet"
  Good: "No projects yet. Create your first project to get started."
        "Your inbox is empty. New messages from your team will appear here."
        "No results for 'fluber'. Try a different search term."

Types:
- First-time empty: guide and encourage
- Search/filter empty: help user adjust their query
- Error empty: explain and offer recovery
```

### Confirmation Dialogs
```
Title: [Specific action] — not "Are you sure?"
Body: [Consequence, not repeat of title]
CTA: [Verb matching the action]

Example:
  Bad:
    Title: "Are you sure?"
    Body:  "This action cannot be undone."
    CTA:   "Yes" / "No"

  Good:
    Title: "Delete this project?"
    Body:  "All files and history will be permanently removed. This can't be undone."
    CTA:   "Delete Project" / "Cancel"
```

### Tooltips
```
- Trigger: on hover/focus of icon buttons or truncated labels
- Length: 1 sentence max
- Format: sentence case, no period for fragments
- Don't restate what is already visible on screen
Example: Icon button with "?" → tooltip: "Learn more about billing cycles"
```

### Onboarding / Empty Onboarding
```
- Welcome message: address the user's goal, not the product's features
  Bad:  "Welcome to Acme! We have 47 features to explore."
  Good: "Welcome! Let's set up your first workspace — it takes 2 minutes."
- Progress: show steps ("Step 1 of 3"), not just a progress bar
- Skip option: always offer it
- Value first: show value before asking for info
```

### Placeholders
```
- Don't use placeholders as the only label (they disappear on input)
- Use placeholders to show format/example: "e.g., name@company.com"
- Never put instructions in placeholders: "Enter your first name here"
```

### Loading & Progress States
```
Static:  "Loading..."       → meh
Better:  "Loading your projects..."
Best:    Show a skeleton UI with no copy needed

Long operations (>3s): show progress with what's happening
  "Uploading 3 of 7 files..."
  "Generating your report..."
```

## Review Checklist
When reviewing existing copy:
- [ ] Is the primary action verb specific and clear?
- [ ] Do error messages explain the problem AND a fix?
- [ ] Are empty states actionable (not just "Nothing here")?
- [ ] Do confirmation dialogs state consequences, not just ask "Are you sure?"
- [ ] Is placeholder text different from label text?
- [ ] Is tone consistent with the rest of the product?
- [ ] Are any words jargon that users might not know?
- [ ] Can any sentence be shortened without losing meaning?

## Output Structure
1. **Copy Audit** (if reviewing) — issue, current copy, suggested copy, reason
2. **New Copy** (if writing) — component type, context, proposed copy, rationale
3. **Alternatives** — 2–3 variants with tone notes (casual / neutral / formal)
4. **Voice Notes** — any observations about consistency with product voice
