import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const centeredStatusBox = style({
  paddingTop: '28px',
  fontSize: vars.fontSize.title,
  color: vars.color.subText,
  textAlign: 'center',
});

export const centeredStatusInline = style({
  padding: '12px 0',
  textAlign: 'center',
  color: vars.color.subText,
  fontSize: vars.fontSize.subText,
});

export const centeredEmptyText = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '8px 0',
});
