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

## Spacing

- Only use the approved spacing scale: `4, 6, 8, 12, 16, 20, 24px`.

## File Placement

- Component styles must live in a same-name `*.css.ts` file.
- Example: `MyCard.tsx` -> `MyCard.css.ts`.

## Styling Imports

- Prefer `import * as styles from './Component.css'` and use `styles.xxx`.
- Avoid destructured style imports for consistency.
