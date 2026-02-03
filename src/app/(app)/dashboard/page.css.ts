import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const dashboardContainer = style({
  width: '100%',
  minHeight: '100%',
  backgroundColor: vars.color.background,
});

export const loadingContainer = style({
  width: '100%',
  height: '200px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: vars.fontSize.text,
  color: vars.color.text,
});
