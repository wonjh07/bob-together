import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const cardHead = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
});

export const date = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const creatorMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const creatorAvatar = style({
  width: '36px',
  height: '36px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.stroke,
  objectFit: 'cover',
});

export const creatorName = style({
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const title = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  wordBreak: 'break-word',
});

export const placeName = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  wordBreak: 'break-word',
  marginTop: '8px',
});

export const placeMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '4px',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const star = style({
  color: vars.color.star,
  fontSize: '1.35rem',
});

export const buttonRow = style({
  marginTop: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const buttonBase = style({
  flex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px',
  borderRadius: vars.radius.xlg,
  textDecoration: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const detailButton = style([
  buttonBase,
  {
    backgroundColor: vars.color.text,
    color: vars.color.background,
  },
]);

export const reviewButton = style([
  buttonBase,
  {
    backgroundColor: vars.color.main,
    color: vars.color.background,
  },
]);

export const reviewButtonDisabled = style([
  buttonBase,
  {
    backgroundColor: '#DBDEE5',
    color: vars.color.subText,
  },
]);
