# Figma Component Image Scan Guide

Using a Figma Component Image, build the component design.

## Basic Rules

### Tokens

- Use design tokens in `styles/theme.css.ts`
- Add tokens if it is needed

### Analyze the Image considering with:

- The image's pixel size means actual pixel from Original Figma Design
- All color variables
- Typography scale (font sizes, weights, line heights)
- Spacing scale (using Tailwind's spacing conventions)
- Border radius values
- Shadow definitions
- Breakpoints for responsive design

## Workflow Steps

### 1. Initial Setup

- Create a `{component name}.tsx` and `{component name}.css.ts`

### 2. Analyze Figma Design

### 3. Generate Component Specifications

#### Visual Specifications:

- Dimensions (width, height, padding, margins)
- Typography (font family, size, weight, line-height)
- Colors (fill, stroke, gradients)
- Border radius and shadows

#### Behavioral Specifications:

- Interactive states (hover, active, focus, disabled)
- Animations and transitions
- Resporsive behavior and breakpoints
- Accessibility requirements (ARIA labels, keyboard navigation)
- Spacing and alignment rules

### 4. Implementation Phase

#### Create Interactive Component:

- Build fully functional component matching the design
- Implement all interactive states and behaviors
- Add proper TypeScript types/interfaces
- Include all variants from the tokens
- Ensure responsive design implementation
- Add proper error handling and edge cases
