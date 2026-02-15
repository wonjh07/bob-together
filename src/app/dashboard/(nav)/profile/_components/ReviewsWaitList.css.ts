import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  width: '100%',
  height: 'auto',
});

export const emptyState = style({
  padding: '16px',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
});

export const scrollRow = style({
  display: 'flex',
  gap: '16px',
  overflowX: 'auto',
  padding: '16px',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
});

export const card = style({
  minWidth: '200px',
  minHeight: '200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '4px',
  padding: '16px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.stroke}`,
});

export const title = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const scoreRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  marginBottom: '8px',
});

export const star = style({
  fontSize: '16px',
  color: vars.color.star,
});

export const score = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: '#8D8F94',
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: '#8D8F94',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
});

export const writeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '12px',
  width: '100%',
  height: '40px',
  border: 'none',
  borderRadius: vars.radius.xlg,
  backgroundColor: vars.color.main,
  color: vars.color.background,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  textDecoration: 'none',
});
