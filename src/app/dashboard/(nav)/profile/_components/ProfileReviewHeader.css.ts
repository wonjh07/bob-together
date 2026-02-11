import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const headerContainer = style({
  width: '100%',
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const headerTitle = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const headerSubText = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.main,
});
