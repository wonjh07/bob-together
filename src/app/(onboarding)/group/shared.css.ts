import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const page = style({
  minHeight: '100dvh',
  width: '100%',
  background: vars.color.mainSoft,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px 20px 32px',
});

export const panel = style({
  width: '100%',
  maxWidth: '420px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const iconWrap = style({
  width: '84px',
  height: '84px',
  borderRadius: '28px',
  background: vars.color.notification,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: vars.color.main,
  marginBottom: '24px',
});

export const title = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  textAlign: 'center',
  marginBottom: '8px',
});

export const subtitle = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.subText,
  textAlign: 'center',
  lineHeight: 1.5,
  marginBottom: '28px',
});

export const buttonStack = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
});

export const buttonBase = style({
  padding: '12px 16px',
  borderRadius: vars.radius.md,
  border: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  textAlign: 'center',
  // 줄 바꿈 방지
  whiteSpace: 'nowrap',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const primaryButton = style({
  background: vars.color.main,
  color: vars.color.mainSoft,
});

export const secondaryButton = style({
  background: vars.color.text,
  color: vars.color.mainSoft,
});

export const outlineButton = style({
  background: 'transparent',
  color: vars.color.text,
  border: `1px solid ${vars.color.stroke}`,
});

export const linkButton = style({
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  marginTop: '8px',
  minHeight: '18px',
});
