import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const movebackContainer = style({
  position: 'absolute',
  top: 0,
  width: '100%',
  height: '60px',
  padding: '0 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const movebackButton = style({
  height: `100%`,
  background: 'transparent',
  border: 'none',
  fontSize: '2.25rem',
  color: vars.color.text,
  cursor: 'pointer',
  marginBottom: '2px',
});

export const formContainer = style({
  height: `100%`,
  width: '100%',
  maxWidth: '480px',
  padding: '16px',
  overflowY: 'scroll',
});
