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
  gap: '24px',
  margin: '16px 0',
});

export const block = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const label = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  lineHeight: 1.2,
});

export const dateTimeRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  flexWrap: 'wrap',
});

export const dateTimeItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
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

export const timeRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const timeInput = style({
  width: 'auto',
});

export const dateTimeIcon = style({
  width: '24px',
  height: '24px',
  color: vars.color.main,
});

export const placeName = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const placeMetaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  flexWrap: 'wrap',
});

export const star = style({
  color: vars.color.star,
});

export const mapWrapper = style({
  borderRadius: vars.radius.xlg,
  overflow: 'hidden',
  border: `1px solid ${vars.color.stroke}`,
});

export const placeChangeButton = style({
  width: '100%',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  border: 'none',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.main,
  color: vars.color.background,
  textDecoration: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  padding: '12px 16px',
});

export const helperText = style({
  minHeight: '16px',
  margin: 0,
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
});

export const errorBox = style({
  padding: '16px',
  color: vars.color.alert,
  fontSize: vars.fontSize.title,
  textAlign: 'center',
});
