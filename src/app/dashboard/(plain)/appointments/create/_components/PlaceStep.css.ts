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
  marginBottom: '24px',
});

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '4px',
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
  padding: '8px 12px',
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

export const searchRow = style({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  gap: '12px',
});

export const searchButton = style({
  padding: '8px 16px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  background: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  minHeight: '24px',
});

export const locationRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  background: 'white',
  marginBottom: '24px',
});

export const locationInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const locationTitle = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const locationHint = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});

export const locationError = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  minHeight: '24px',
});

export const locationButton = style({
  padding: '8px 12px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  background: vars.color.text,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const mapWrapper = style({
  marginBottom: '16px',
});

export const results = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '100%',
  marginBottom: '20px',
  overflowY: 'auto',
});

export const resultItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  background: 'white',
  cursor: 'pointer',
  width: '100%',
  textAlign: 'left',
});

export const resultInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const resultName = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const resultAddress = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});

export const selectedTag = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.main,
  fontWeight: vars.fontWeight.semibold,
});

export const emptyResult = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '8px 0',
});
