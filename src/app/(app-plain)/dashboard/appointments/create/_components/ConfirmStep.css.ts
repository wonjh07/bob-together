import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

export const stepTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  marginBottom: '16px',
});

export const summaryCard = style({
  background: 'white',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
});

export const summaryRow = style({
  display: 'flex',
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  gap: '4px',
});

export const summaryValue = style({
  color: vars.color.text,
  fontWeight: vars.fontWeight.semibold,
});

export const mapWrapper = style({
  marginBottom: '16px',
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
