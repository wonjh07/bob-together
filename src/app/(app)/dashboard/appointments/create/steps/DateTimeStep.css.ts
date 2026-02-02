import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const stepTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '12px',
});

export const inputLabel = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const underlineInput = style({
  width: '100%',
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

export const timeRow = style({
  display: 'flex',
  gap: '12px',
});

export const timeInput = style({
  flex: 1,
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  minHeight: '16px',
});

export const primaryButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '12px 16px',
  borderRadius: vars.radius.md,
  border: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  background: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  textDecoration: 'none',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
