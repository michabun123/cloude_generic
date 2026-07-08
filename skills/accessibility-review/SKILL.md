# Accessibility Review Skill

## Trigger
Use when asked to: "audit accessibility", "check a11y", "is this accessible?", review color contrast, keyboard navigation, touch target sizes, or screen reader behavior before design handoff.

## Goal
Run a WCAG 2.1 AA accessibility audit on a design, page, or component and produce a prioritized list of issues with fixes.

## Process

### 1. Scope
- Identify what is being audited: full page, component, flow, or design mockup
- Confirm standard: default to WCAG 2.1 AA unless AA or Section 508 is specified

### 2. Audit Checklist

#### Perceivable
- [ ] Color contrast ratio >= 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt bold)
- [ ] UI component contrast >= 3:1 against adjacent colors
- [ ] No information conveyed by color alone
- [ ] All images have meaningful alt text; decorative images use alt=""
- [ ] Video/audio has captions or transcripts

#### Operable
- [ ] All interactive elements reachable via keyboard (Tab, Shift+Tab, Enter, Space, Arrow keys)
- [ ] Visible focus indicator on every focusable element
- [ ] No keyboard traps
- [ ] Touch targets >= 44x44px (48x48px recommended for mobile)
- [ ] No content relies solely on hover or motion to be accessible
- [ ] Skip navigation link present on pages with repeated content

#### Understandable
- [ ] Form inputs have visible, associated labels (not just placeholder text)
- [ ] Error messages are descriptive and suggest a fix
- [ ] Language of page is set (lang attribute)
- [ ] Consistent navigation and labeling across screens

#### Robust
- [ ] Semantic HTML used (headings hierarchy, lists, buttons vs. divs)
- [ ] ARIA roles, labels, and descriptions used correctly and only when needed
- [ ] Interactive components follow ARIA Authoring Practices patterns

### 3. Output Format

For each issue found:
```
[SEVERITY] — [WCAG Criterion]
Element: <describe element>
Issue: <what is wrong>
Fix: <what to do>
```

Severity levels:
- **Critical** — blocks access entirely for some users
- **Major** — significantly degrades experience
- **Minor** — best-practice improvement

### 4. Summary
- Total issues by severity
- Top 3 priority fixes
- Overall AA pass/fail verdict

## Output Structure
1. **Audit Summary** — pass/fail, issue count by severity
2. **Issues List** — grouped by WCAG principle (Perceivable / Operable / Understandable / Robust)
3. **Quick Wins** — fixes that take < 1 hour
4. **Recommendations** — broader improvements for future iterations
