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

export const searchBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const helperText = style({
  minHeight: '18px',
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
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
  gap: '12px',
  padding: '12px',
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
});

export const resultInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
});

export const resultName = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const resultSub = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const joinButton = style({
  padding: '6px 12px',
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

export const joinedButton = style({
  backgroundColor: vars.color.stroke,
  color: vars.color.text,
});

export const emptyResult = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '8px 0',
});
