import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const serviceTitle = style({
  fontSize: vars.fontSize.serviceTitle,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.main,
  marginBottom: '8px',
});

export const entryTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  textAlign: 'center',
  marginBottom: '12px',
});

export const entryDescription = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  textAlign: 'center',
  lineHeight: 1.6,
  marginBottom: '28px',
});
