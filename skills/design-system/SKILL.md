# Design System Skill

## Trigger
Use when: auditing a design system for inconsistencies, documenting a component's variants/states/accessibility notes, checking for hardcoded values, designing a new pattern that must fit the existing system, or establishing naming conventions.

## Goal
Audit, document, or extend a design system with consistent naming, token usage, accessibility compliance, and clear component documentation.

## Process

### 1. Audit Mode — Finding Inconsistencies

#### Token Audit
Check for hardcoded values that should use tokens:
- Colors: any raw hex not mapped to a token (`#3B82F6` instead of `color.primary.500`)
- Spacing: pixel values not from the spacing scale (`margin: 13px` instead of `space-3`)
- Typography: font sizes not from the type scale
- Border radius: inconsistent values not from a radius token
- Shadows: custom box-shadows not from an elevation token

#### Naming Audit
- Are component names consistent? (`Button` vs `Btn` vs `CTA`)
- Are variant names consistent across components? (`variant="primary"` everywhere, not `type="main"` in one place)
- Are state names consistent? (`isDisabled` vs `disabled` vs `inactive`)
- Are token names following a pattern? (`color.{category}.{scale}`)

#### Coverage Audit
- Which components lack dark mode support?
- Which components are missing error/empty/loading states?
- Which components have no accessibility documentation?

### 2. Documentation Mode — Component Spec

For each component, produce:

```markdown
## [ComponentName]

### Purpose
One sentence: what this component does and when to use it.

### Variants
| Variant | Description | When to Use |
|---------|-------------|-------------|
| primary | ... | Main actions |
| secondary | ... | Supporting actions |
| ghost | ... | Tertiary actions |
| danger | ... | Destructive actions |

### Sizes
| Size | Height | Font Size | Padding |
|------|--------|-----------|---------|
| sm | 32px | 14px | 8px 12px |
| md | 40px | 16px | 10px 16px |
| lg | 48px | 18px | 12px 24px |

### States
- **Default** — [description]
- **Hover** — [description]
- **Focus** — [description + focus ring spec]
- **Active** — [description]
- **Disabled** — opacity 40%, cursor: not-allowed, non-interactive
- **Loading** — [spinner placement, label behavior]
- **Error** — [border, icon, message]

### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Visual style |
| size | string | 'md' | Component size |
| disabled | boolean | false | Disables interaction |
| loading | boolean | false | Shows loading state |
| onClick | function | — | Click handler |

### Tokens Used
- Background: `color.primary.500`
- Text: `color.white`
- Border-radius: `radius.md`
- Padding: `space-3 space-4`
- Font: `text.sm.medium`

### Accessibility
- Role: `button`
- Keyboard: Enter and Space activate
- Focus: visible 2px outline, `color.focus.ring`, 2px offset
- ARIA: supports `aria-label`, `aria-disabled`, `aria-busy` (loading)
- Avoid: do not use `<div>` as button; do not remove focus outline

### Do / Don't
| Do | Don't |
|----|-------|
| Use for primary page action | Use multiple primary buttons together |
| Keep label to 1–3 words | Use vague labels like "Click here" |
```

### 3. Extension Mode — New Pattern

When adding a new component or pattern:
1. **Check existing components** — can this be a variant of something existing?
2. **Map required tokens** — use existing tokens; only create new ones if truly needed
3. **Name consistently** — follow established naming conventions
4. **Define all states** — never ship a component without hover, focus, disabled
5. **Document accessibility** — keyboard, ARIA, contrast
6. **Add to component index** — update the system inventory

## Output Structure
1. **System Health Score** — token usage %, components with full state coverage, a11y coverage %
2. **Issues Found** — hardcoded values, naming inconsistencies, missing states
3. **Component Docs** — one spec block per component (see template above)
4. **Token Inventory** — full list of tokens in use with values
5. **Recommendations** — prioritized improvements to the system
