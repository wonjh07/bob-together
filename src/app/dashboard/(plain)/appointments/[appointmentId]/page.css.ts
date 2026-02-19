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

export const section = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.xlg,
  padding: '16px',
});

export const authorRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '14px',
});

export const authorAvatar = style({
  width: '56px',
  height: '56px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
});

export const authorNameLine = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const meText = style({
  color: vars.color.main,
});

export const authorMeta = style({
  marginTop: '4px',
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});

export const appointmentTitle = style({
  margin: 0,
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const dateTimeRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
});

export const dateTimeItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const dateTimeIcon = style({
  width: '22px',
  height: '22px',
  color: vars.color.main,
});

export const placeName = style({
  margin: 0,
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

export const memberRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const memberInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const memberIcon = style({
  width: '24px',
  height: '24px',
  color: vars.color.black,
});

export const memberTitle = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const memberButton = style({
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.text,
  color: vars.color.background,
  padding: '8px 12px',
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

export const actionRow = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
});

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

export const activateButton = style([
  actionButton,
  {
    backgroundColor: vars.color.button,
  },
]);

export const errorBox = style({
  padding: '16px',
  color: vars.color.alert,
  fontSize: vars.fontSize.title,
  textAlign: 'center',
});
