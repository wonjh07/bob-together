import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const row = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '4px',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
});

export const star = style({
  color: vars.color.star,
});

export const text = style({
  color: 'inherit',
});
