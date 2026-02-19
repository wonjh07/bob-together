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
  gap: '12px',
});

export const caption = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: vars.color.subText,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const captionIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.subText,
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
});

export const card = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 0',
});

export const cardInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: 0,
});

export const avatar = style({
  width: '56px',
  height: '56px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
});

export const names = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const nickname = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const nicknameRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  minWidth: 0,
});

export const meText = style({
  color: vars.color.main,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  flexShrink: 0,
});

export const name = style({
  margin: 0,
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const moreButton = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.subText,
  fontSize: '1.7rem',
  lineHeight: 1,
  cursor: 'pointer',
});

export const errorBox = style({
  padding: '16px',
  color: vars.color.alert,
  fontSize: vars.fontSize.title,
  textAlign: 'center',
});
