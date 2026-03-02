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

export const captionCount = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
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

export const moreButton = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.subText,
  fontSize: '1.7rem',
  lineHeight: 1,
  cursor: 'pointer',
});
