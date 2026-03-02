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

export const memberCardLink = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.xlg,
  padding: '16px',
  textDecoration: 'none',
  color: 'inherit',
});

export const memberTitle = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const memberCardLinkText = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',
  flexShrink: 0,
});
