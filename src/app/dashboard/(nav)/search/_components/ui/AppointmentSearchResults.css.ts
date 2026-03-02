import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const list = style({
  display: 'flex',
  flexDirection: 'column',
});

export const statusMessage = style({
  padding: '20px 16px',
  textAlign: 'center',
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
});

export const stateBox = style({
  padding: '20px 16px',
});

export const statusInline = style({
  padding: '16px',
});

export const loadMoreTrigger = style({
  width: '100%',
  height: '1px',
});
