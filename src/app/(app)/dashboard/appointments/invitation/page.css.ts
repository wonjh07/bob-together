import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const invitationPage = style({
  minHeight: '100%',
  width: '100%',
  display: 'flex',
});

export const invitationPanel = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
});

export const headerRow = style({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const headerTitle = style({
  width: '100%',
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const headerMeta = style({
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
});

export const actionLink = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.main,
  textDecoration: 'none',
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

export const searchRow = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

export const searchInput = style({
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

export const searchButton = style({
  padding: '8px 14px',
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.caption,
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
  background: 'white',
  border: `1px solid ${vars.color.stroke}`,
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

export const resultSub = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
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
