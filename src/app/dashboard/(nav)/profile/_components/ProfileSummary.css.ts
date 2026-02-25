import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
});

export const userInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const avatar = style({
  borderRadius: '999px',
  objectFit: 'cover',
  background: vars.color.stroke,
  border: `2px solid ${vars.color.stroke}`,
});

export const nickname = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const settingsButton = style({
  width: '44px',
  height: '44px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.subText,
  textDecoration: 'none',
});

export const settingsIcon = style({
  width: '28px',
  height: '28px',
});
