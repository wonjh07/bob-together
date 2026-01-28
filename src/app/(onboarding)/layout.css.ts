import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const loginLayoutContainer = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  minHeight: '100dvh',
  margin: '0 auto',
  padding: '16px',
  background: vars.color.mainSoft,
});
