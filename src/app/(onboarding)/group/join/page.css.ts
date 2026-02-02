import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const formTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  textAlign: 'left',
  marginBottom: '20px',
});

export const form = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const fieldLabel = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const fieldRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const lineInput = style({
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

export const compactButton = style({
  padding: '8px 14px',
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.caption,
});

export const results = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '100%',
});

export const resultItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  borderRadius: vars.radius.md,
  background: 'white',
  border: `1px solid ${vars.color.stroke}`,
});

export const resultName = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const resultButton = style({
  padding: '6px 12px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
  background: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const emptyResult = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '12px 0',
});
