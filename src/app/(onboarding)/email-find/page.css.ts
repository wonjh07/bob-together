import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const emailFindPage = style({
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

export const description = style({
  width: '100%',
  marginBottom: '16px',
  color: vars.color.subText,
  fontSize: vars.fontSize.text,
  textAlign: 'center',
});

export const emailFindForm = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '4px',
});

export const submitButton = style({
  padding: '12px',
  fontSize: '16px',
  fontWeight: vars.fontWeight.bold,
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

export const resultBox = style({
  width: '100%',
  marginTop: '20px',
  padding: '14px 12px',
  borderRadius: '10px',
  border: `1px solid ${vars.color.stroke}`,
  background: vars.color.mainSoft,
  color: vars.color.text,
});

export const resultLabel = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  marginBottom: '6px',
});

export const resultEmail = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
});

export const notFoundText = style({
  width: '100%',
  marginTop: '16px',
  fontSize: vars.fontSize.text,
  color: vars.color.alert,
  textAlign: 'center',
});

export const linkContainer = style({
  marginTop: '24px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});
