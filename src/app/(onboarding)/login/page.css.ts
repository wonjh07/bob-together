import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const loginPage = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  maxWidth: '480px',
  padding: '0 16px',
});

export const serviceTitle = style({
  fontSize: vars.fontSize.serviceTitle,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const title = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  margin: `24px`,
});

export const loginForm = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const linkContainer = style({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  gap: `32px`,
  padding: '32px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const buttonContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
});

export const submitButton = style({
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '8px',
  background: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
});
