import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const list = style({
  display: 'flex',
  flexDirection: 'column',
});

export const status = style({
  padding: '20px 16px',
  textAlign: 'center',
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
});

export const loadMoreTrigger = style({
  width: '100%',
  height: '1px',
});
