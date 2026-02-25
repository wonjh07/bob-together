import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const loadingWrap = style({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
});

export const loadingText = style({
  margin: 0,
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  fontWeight: vars.fontWeight.medium,
});
