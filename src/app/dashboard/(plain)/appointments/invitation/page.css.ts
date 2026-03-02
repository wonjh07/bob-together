import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const invitationPage = style({
  height: '100%',
  width: '100%',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const invitationPanel = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  paddingTop: '8px',
});

export const headerDescription = style({
  width: '100%',
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const headerMeta = style({
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
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
});

export const resultItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 0',
});

export const resultInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flex: 1,
  minWidth: 0,
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
  whiteSpace: 'nowrap',
  flexShrink: 0,
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
