import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const groupName = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  marginBottom: '6px',
});

export const message = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  textAlign: 'center',
  marginBottom: '24px',
});
