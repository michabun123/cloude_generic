# Design Handoff Skill

## Trigger
Use when a design is ready for engineering and needs a complete spec sheet — covering layout, design tokens, component props, interaction states, responsive breakpoints, edge cases, and animation details.

## Goal
Produce a developer-ready handoff document that eliminates ambiguity and reduces back-and-forth between design and engineering.

## Process

### 1. Pre-Handoff Checklist
Before generating specs, confirm:
- [ ] All states are designed (default, hover, focus, active, disabled, loading, error, empty, success)
- [ ] Responsive breakpoints are defined
- [ ] Edge cases covered (long text, empty data, no results, max items)
- [ ] Design tokens used (not hardcoded values)
- [ ] Accessibility requirements noted

### 2. Spec Sheet Sections

#### Layout & Spacing
- Container width, max-width, padding, margin
- Grid system used (columns, gutter, margin)
- Component internal spacing (use token names: `space-4`, `space-8`, etc.)
- Alignment rules (flex, grid, absolute positioning if used)

#### Typography
For each text style on the screen:
```
Element: [e.g., Page Title]
Font: [family]
Weight: [400/500/600/700]
Size: [px / rem / token name]
Line Height: [value]
Letter Spacing: [value]
Color: [hex / token name]
```

#### Color Tokens
```
Background: [token / hex]
Surface: [token / hex]
Primary Action: [token / hex]
Text Primary: [token / hex]
Text Secondary: [token / hex]
Border: [token / hex]
```

#### Component Props
For each component:
```
Component: [name]
Props:
  - variant: [default | primary | secondary | danger]
  - size: [sm | md | lg]
  - state: [default | hover | focus | active | disabled | loading]
  - label: string
  - icon: [left | right | none]
Behavior: [describe interaction]
```

#### Interaction States
Document every state with visual description or reference:
- Default
- Hover (cursor, color change, shadow)
- Focus (outline style, color, offset)
- Active / Pressed
- Disabled (opacity, cursor: not-allowed)
- Loading (spinner, skeleton, progress)
- Error (border color, icon, message)
- Success (confirmation message, icon)

#### Responsive Breakpoints
```
Mobile:  < 768px  — [layout description]
Tablet:  768–1024px — [layout description]
Desktop: > 1024px — [layout description]
```

#### Animations & Transitions
```
Element: [what animates]
Trigger: [on hover / on click / on mount / on scroll]
Property: [opacity / transform / color / height]
Duration: [ms]
Easing: [ease-in-out / cubic-bezier(...)]
Delay: [ms if any]
```

#### Edge Cases
- Empty state: [what to show when no data]
- Error state: [what to show on failure]
- Max content: [behavior when text/items overflow]
- Loading state: [skeleton or spinner pattern]
- Zero state: [first-time user experience]

### 3. Assets & Resources
- List all icons needed (name, size, color)
- List images (dimensions, format, alt text)
- Note any assets that need to be exported

## Output Structure
1. **Overview** — screen name, purpose, primary user action
2. **Layout Specs** — grid, spacing, dimensions
3. **Typography** — all text styles
4. **Color Tokens** — palette in use
5. **Components** — props and states for each
6. **Interactions** — hover, focus, animation details
7. **Responsive Behavior** — per breakpoint
8. **Edge Cases** — empty, error, loading, overflow
9. **Open Items** — anything still needing design decision or clarification
