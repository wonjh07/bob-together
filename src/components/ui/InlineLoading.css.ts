import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const row = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

export const text = style({
  margin: 0,
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  fontWeight: vars.fontWeight.medium,
});
