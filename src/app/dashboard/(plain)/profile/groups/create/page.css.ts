import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const page = style({
  width: '100%',
  minHeight: '100%',
  backgroundColor: vars.color.background,
});

export const content = style({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const form = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const label = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const input = style({
  flex: 1,
  border: 'none',
  borderBottom: `1px solid ${vars.color.stroke}`,
  padding: '8px 4px',
  fontSize: vars.fontSize.text,
  color: vars.color.text,
  background: 'transparent',
  outline: 'none',
  selectors: {
    '&:focus': {
      borderBottom: `1px solid ${vars.color.main}`,
    },
  },
});

export const submit = style({
  padding: '8px 14px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
  backgroundColor: vars.color.main,
  color: vars.color.background,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const helperText = style({
  minHeight: '18px',
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
});
