# Styling Rules

## Vanilla Extract

- Use Vanilla Extract for all styling.
- Avoid inline styles and ad-hoc CSS strings.

## CSS Property Order (Importance)

1. Layout & Flow: `display`, `position`, `top/right/bottom/left`, `z-index`, `flex`, `grid`, `order`
2. Box Model: `width/height`, `min/max-*`, `padding`, `margin`, `gap`
3. Visual: `background`, `border`, `border-radius`, `box-shadow`, `opacity`
4. Typography: `font-*`, `line-height`, `letter-spacing`, `text-*`, `color`
5. Interaction: `cursor`, `pointer-events`, `user-select`
6. Motion: `transition`, `animation`, `transform`
7. Misc: `overflow`, `visibility`

## Practical CSS Guidelines

### Layout First

- Decide layout and spacing before visual styling.
- For layout-heavy components, define `display`, `gap`, `padding`, and `min-height` first.
- When UI breaks, check layout properties before visual styles.
- Use `display: flex` for layout composition.
- Separate layout responsibilities from page content responsibilities.

### Container Responsibility Split

- Containers handle layout only; inner elements handle visual styles.
- Example: `container` uses `display/flex/gap/padding`, `card` uses `background/border/radius`.
- Avoid mixing layout and visual styles in the same class.

### Text Wrapping & Overflow

- Explicitly define wrapping/overflow rules for variable-length text.
- One-line UI: `white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
- Multi-line UI: use `line-clamp` (or `-webkit-line-clamp`) + `overflow: hidden;`
- Decide whether truncation is acceptable and encode it.

### Avoid Class Composition / Inheritance

- Prefer explicit local classes over deep class composition chains.
- Avoid composing multiple classes that set the same property (`padding`, `font-size`, `color`, `border`, `overflow`, etc.).
- Do not rely on parent style inheritance for critical UI values (layout, spacing, font-size, line-height, overflow, color).
- For feature/page styles, set final values in the local class so rendering is deterministic.
- Allow composition only for stable primitives (`actionButton*`, `chip*`, `dropdown*`) and avoid overriding their core tokens in the same class stack.
- If a composed style needs many overrides, stop composing and create a dedicated local style class.

## Spacing

- Only use the approved spacing scale: `4, 6, 8, 12, 16, 20, 24px`.

## File Placement

- Component styles must live in a same-name `*.css.ts` file.
- Example: `MyCard.tsx` -> `MyCard.css.ts`.

## Styling Imports

- Prefer `import * as styles from './Component.css'` and use `styles.xxx`.
- Avoid destructured style imports for consistency.

## Shared UI Primitive Rules

### Reuse Priority

1. Reuse `src/styles/primitives/*` first.
2. Reuse `src/components/ui/*` atoms next.
3. Add local `*.css.ts` styles only for screen-specific layout.

### Required Shared Components by Pattern

- `icon + text (가로)`:
  - Use `IconLabel`.
  - Examples: 멤버 수, 댓글 수, 캡션 숫자, 알림 메시지 라인.
- `icon + label (세로)`:
  - Prefer local markup/styles per screen.
  - Avoid introducing a shared component unless 2+ features need the exact same structure and style constraints.
- `avatar + name (+me/+subtitle)`:
  - Use `UserIdentityInline`.
- `date/time row`:
  - Use `DateTimeMetaRow`.
- `place rating + count + tags`:
  - Use `PlaceRatingMeta`.
- `title + place + rating block`:
  - Use `AppointmentPlaceMeta`.
- `more(⋮) + dropdown action menu`:
  - Use `OverflowMenu`.
- `dropdown trigger + menu surface + menu items`:
  - Reuse `src/styles/primitives/dropdown.css.ts` (`trigger*`, `menuSurface`, `menuItem*`).
  - Avoid redefining border/radius/shadow/hover per feature.
- `chip toggle buttons`:
  - Reuse `src/styles/primitives/chip.css.ts` and `ChipToggleGroup`.
- `search input + submit`:
  - Use `src/components/ui/SearchInput.tsx`.
  - Keep labels/helper text/error text in local screen styles; only the input row itself is shared.

### Button Rules

- Button base style is owned by `src/styles/primitives/actionButton.css.ts`.
- Reusable button component styles (`LoginButton`, `SubmitButton`) must compose action button primitives.
- Do not redefine disabled/primary/secondary/muted button rules per screen if existing primitives already cover them.

### Token Rules

- New colors/sizes should be added to `src/styles/theme.css.ts` first, then referenced via `vars`.
- Avoid hardcoded hex/rgb values in feature/page CSS unless there is no reusable token yet.
- If the same literal appears in 2+ places, extract a token or primitive immediately.
