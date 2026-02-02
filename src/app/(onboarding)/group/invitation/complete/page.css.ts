import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const completeTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  textAlign: 'center',
  marginBottom: '24px',
});
