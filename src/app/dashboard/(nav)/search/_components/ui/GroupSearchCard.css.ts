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
  color: vars.color.text,
});

export const subRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: vars.fontSize.text,
  color: vars.color.text,
});

export const ownerAvatar = style({
  display: 'flex',
  alignItems: 'center',
  borderRadius: '9999px',
  objectFit: 'cover',
  border: `1px solid ${vars.color.stroke}`,
});

export const ownerName = style({
  color: vars.color.text,
});

export const memberMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: vars.color.subText,
});

export const joinButton = style({
  padding: '10px 16px',
  borderRadius: vars.radius.lg,
  border: 'none',
  backgroundColor: vars.color.main,
  color: vars.color.background,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
});

export const memberButton = style({
  padding: '10px 16px',
  borderRadius: vars.radius.lg,
  border: 'none',
  backgroundColor: vars.color.stroke,
  color: vars.color.subText,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'default',
});
