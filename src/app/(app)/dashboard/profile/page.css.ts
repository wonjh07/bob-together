import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const pageContainer = style({
  width: '100%',
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
});

export const header = style({
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
