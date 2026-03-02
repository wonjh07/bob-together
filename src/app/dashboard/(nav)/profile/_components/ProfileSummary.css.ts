import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
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
