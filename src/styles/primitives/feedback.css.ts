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

export const centeredErrorBox = style({
  padding: '16px',
  color: vars.color.alert,
  fontSize: vars.fontSize.title,
  textAlign: 'center',
});

export const centeredEmptyText = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
  textAlign: 'center',
  padding: '8px 0',
});

export const feedbackPanelText = style({
  margin: 0,
  padding: '10px 12px',
  borderRadius: vars.radius.md,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  textAlign: 'center',
});
