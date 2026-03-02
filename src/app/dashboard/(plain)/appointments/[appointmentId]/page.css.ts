import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const page = style({
  width: '100%',
  height: '100%',
  padding: '16px',
  overflowY: 'scroll',
  backgroundColor: vars.color.background,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const appointmentTitle = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  margin: '4px 0',
});

export const placeName = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const placeSection = style({
  marginTop: '14px',
  width: '100%',
});

export const placeMetaRow = style({
  marginTop: '6px',
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
});

export const star = style({
  color: vars.color.star,
});

export const mapWrapper = style({
  marginTop: '16px',
  borderRadius: vars.radius.xlg,
  overflow: 'hidden',
  border: `1px solid ${vars.color.stroke}`,
});

export const section = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.xlg,
  padding: '12px',
});

export const memberRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const memberActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
});

export const memberTitle = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const memberButton = style({
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.text,
  color: vars.color.background,
  padding: '8px 16px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  textDecoration: 'none',
});

export const actionButton = style({
  width: '100%',
  border: 'none',
  borderRadius: vars.radius.lg,
  padding: '12px 16px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.background,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  },
});

export const inviteButton = style([
  actionButton,
  {
    backgroundColor: vars.color.button,
  },
]);

export const confirmButton = style([
  actionButton,
  {
    backgroundColor: vars.color.success,
  },
]);

export const cancelButton = style([
  actionButton,
  {
    backgroundColor: vars.color.alert,
  },
]);
