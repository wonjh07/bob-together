import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const page = style({
  width: '100%',
  height: '100%',
  overflowY: 'scroll',
  backgroundColor: vars.color.background,
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
});

export const statusBox = style({
  paddingTop: '28px',
  fontSize: vars.fontSize.title,
  color: vars.color.subText,
  textAlign: 'center',
});

export const statusInline = style({
  padding: '12px 0',
  textAlign: 'center',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
});

export const loadMoreTrigger = style({
  width: '100%',
  height: '1px',
});
