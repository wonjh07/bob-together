# Styling Rules

## Vanilla Extract
- Use Vanilla Extract for all styling.
- Avoid inline styles and ad-hoc CSS strings.

## Layout
- Use `display: flex` for layout composition.
- Separate layout responsibilities from page content responsibilities.

## Spacing
- Only use the approved spacing scale: `4, 6, 8, 12, 16, 20, 24px`.

## File Placement
- Component styles must live in a same-name `*.css.ts` file.
- Example: `MyCard.tsx` -> `MyCard.css.ts`.

## Styling Imports
- Prefer `import * as styles from './Component.css'` and use `styles.xxx`.
- Avoid destructured style imports for consistency.

## Rules By Example

### Vanilla Extract
```ts
// Good
import * as styles from './MyCard.css';

export function MyCard() {
  return <div className={styles.root}>내용</div>;
}
```
```ts
// Bad
export function MyCard() {
  return <div style={{ padding: '12px' }}>내용</div>;
}
```

### Layout (Flex)
```ts
// Good
export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});
```
```ts
// Bad
export const container = style({
  position: 'absolute',
  top: '0',
  left: '0',
});
```

### Spacing Scale
```ts
// Good
export const card = style({
  padding: '12px',
  gap: '16px',
  marginTop: '8px',
});
```
```ts
// Bad
export const card = style({
  padding: '10px',
  gap: '14px',
});
```

### Layout vs Page
- Layout: app shell, navigation, shared wrappers.
- Page: screen-specific content and business UI.

### Same-name css.ts
- `ConfirmStep.tsx` -> `ConfirmStep.css.ts`
