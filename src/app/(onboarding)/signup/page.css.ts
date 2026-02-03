import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const signupPage = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  maxWidth: '480px',
  padding: '0 16px',
});

export const title = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  margin: '32px',
});

export const signupForm = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  marginBottom: '32px',
  gap: '4px',
});


export const buttonContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px',
  width: '100%',
});
