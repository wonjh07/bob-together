import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '12px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const info = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  color: vars.color.text,
});

export const title = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const item = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  color: vars.color.subText,
});

export const subRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: vars.fontSize.text,
  color: vars.color.text,
});

export const hostAvatar = style({
  width: '28px',
  height: '28px',
  borderRadius: '9999px',
  border: `1px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  flexShrink: 0,
});

export const hostName = style({
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const memberMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: vars.color.subText,
});

export const detailButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  padding: '10px 16px',
  borderRadius: vars.radius.lg,
  border: 'none',
  backgroundColor: vars.color.main,
  color: vars.color.background,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
});
