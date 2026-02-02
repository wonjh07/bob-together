import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const dashboardContainer = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: vars.color.main,
  padding: '20px',
  boxSizing: 'border-box',
});

export const userInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '24px',
  backgroundColor: vars.color.background,
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '12px',
  maxWidth: '480px',
  width: '100%',
});

export const loadingContainer = style({
  width: '100%',
  height: '100dvh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '18px',
  color: vars.color.text,
});
