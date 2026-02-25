import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const invitationPage = style({
  width: '100%',
  minHeight: '100%',
  backgroundColor: vars.color.background,
});

export const invitationPanel = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  padding: '24px 16px 16px',
});

export const headerDescription = style({
  width: '100%',
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const searchBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const searchLabel = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
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
  padding: '12px',
  borderRadius: vars.radius.md,
  background: vars.color.background,
  border: `1px solid ${vars.color.stroke}`,
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

export const inviteButton = style({
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

export const invitedButton = style({
  background: vars.color.stroke,
  color: vars.color.text,
});

export const helperText = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
  minHeight: '18px',
});

export const emptyResult = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '8px 0',
});
