import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const completeTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  textAlign: 'center',
  marginBottom: '24px',
});

export const groupName = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  marginBottom: '4px',
});

export const caption = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  textAlign: 'center',
  marginBottom: '16px',
});
