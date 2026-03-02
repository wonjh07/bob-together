import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const rowBase = style({
  display: 'flex',
});

export const rowDirection = styleVariants({
  row: {
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  column: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '4px',
  },
});

export const item = style({
  display: 'inline-flex',
  alignItems: 'center',
  fontSize: vars.fontSize.subText,
  gap: '4px',
});

export const icon = style({
  width: '18px',
  height: '18px',
  color: 'currentColor',
  flexShrink: 0,
});
