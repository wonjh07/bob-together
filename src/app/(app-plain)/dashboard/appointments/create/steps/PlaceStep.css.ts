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

export const searchRow = style({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  gap: '12px',
});

export const searchButton = style({
  padding: '12px 20px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
  background: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
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
});

export const locationButton = style({
  padding: '8px 12px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
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
  padding: '0 24px',
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

export const primaryButton = style({
  position: 'absolute',
  top: 0,
  right: 0,
  margin: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
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
