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
  touchAction: 'auto',
  overscrollBehaviorX: 'contain',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  selectors: {
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },
});

export const card = style({
  minWidth: '200px',
  minHeight: '200px',
  flex: '0 0 200px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '4px',
  padding: '16px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.stroke}`,
});

export const title = style({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  fontSize: vars.fontSize.title,
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
  fontSize: vars.fontSize.subText,
  color: vars.color.star,
});

export const scoreText = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const infoRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
});

export const writeButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '12px',
  width: '100%',
  padding: '6px',
  border: 'none',
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.main,
  color: vars.color.background,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  cursor: 'pointer',
  textDecoration: 'none',
});

export const loadMoreTrigger = style({
  flex: '0 0 1px',
  width: '1px',
  height: '1px',
});
