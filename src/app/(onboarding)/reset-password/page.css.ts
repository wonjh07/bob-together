import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const resetPasswordPage = style({
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

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '4px',
});

export const verifyButton = style({
  padding: '12px',
  fontSize: '16px',
  fontWeight: vars.fontWeight.bold,
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '8px',
  background: vars.color.main,
  color: vars.color.background,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  ':disabled': {
    cursor: 'not-allowed',
    opacity: 0.6,
  },
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

export const verifiedBox = style({
  width: '100%',
  marginTop: '16px',
  padding: '12px',
  borderRadius: '10px',
  border: `1px solid ${vars.color.success}`,
  color: vars.color.success,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  textAlign: 'center',
});

export const updateFormWrap = style({
  width: '100%',
  marginTop: '16px',
});

export const linkContainer = style({
  marginTop: '24px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});
