import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  gap: '12px',
  padding: '20px 12px',
  borderTop: `1px solid ${vars.color.stroke}`,
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
});

export const itemLink = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
  width: '100%',
});

export const icon = style({
  color: vars.color.main,
  flexShrink: 0,
});

export const label = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
  textAlign: 'center',
  lineHeight: 1.2,
});
