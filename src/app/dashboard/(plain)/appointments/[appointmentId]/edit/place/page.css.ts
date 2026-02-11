import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const page = style({
  width: '100%',
  height: '100%',
  backgroundColor: vars.color.background,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  margin: '16px 0',
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  minHeight: '18px',
});

export const locationRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
});

export const locationTitle = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const locationError = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
});

export const locationButton = style({
  border: 'none',
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  backgroundColor: vars.color.text,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  padding: '8px 12px',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const searchRow = style({
  display: 'flex',
  width: '100%',
  gap: '10px',
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

export const searchButton = style({
  border: 'none',
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  backgroundColor: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  padding: '8px 14px',
  whiteSpace: 'nowrap',
});

export const results = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const resultItem = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '10px',
  padding: '12px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  textAlign: 'left',
});

export const resultInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const resultName = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const resultAddress = style({
  margin: 0,
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});

export const selectButton = style({
  border: 'none',
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  backgroundColor: vars.color.text,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  padding: '8px 12px',
  whiteSpace: 'nowrap',
});

export const emptyResult = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '12px 0',
});
