import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '12px',
  padding: '20px 12px',
  borderTop: `1px solid ${vars.color.stroke}`,
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const item = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
  textDecoration: 'none',
});

export const icon = style({
  width: '36px',
  height: '36px',
  color: vars.color.main,
});

export const label = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.subText,
});
