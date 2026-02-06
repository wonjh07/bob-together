# Figma Component Image Scan Guide

Use the image to implement the component UI in code (tsx + css.ts).

## Basic Rules

### Tokens

- Use design tokens in `styles/theme.css.ts`
- Add tokens if it is needed

### Analyze the image considering:

- Treat the PNG as 1x unless the export scale is known
- List all visible text first and use the list to verify no text is missed.
- Spacing scale (use `ai_docs/STYLE_GUIDE.md` spacing rules)

## Workflow Steps

### 1. Initial Setup

- Create `{component}.tsx` and `{component}.css.ts` in the feature folder where the UI belongs.

### 2. Analyze Design

### 3. Generate Component Specifications

#### Visual Specifications:

- Dimensions (width, height, padding, margins)
- Typography (font family, size, weight, line-height)
- Colors (fill, stroke, gradients)
- Border radius and shadows

#### Behavioral Specifications:

- Interactive states (hover, active, focus, disabled)
- Animations and transitions
- Accessibility requirements (ARIA labels, keyboard navigation)
- Spacing and alignment rules

### 4. Implementation Phase

#### Create Interactive Component:

- Build fully functional component matching the design
- Implement all interactive states and behaviors
- Add proper TypeScript types/interfaces
- Include all variants from the tokens
- Ensure responsive design implementation
