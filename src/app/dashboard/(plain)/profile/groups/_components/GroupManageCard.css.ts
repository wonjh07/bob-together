import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const headRow = style({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: '12px',
});

export const groupName = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const footerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const dateText = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
});

export const memberMeta = style({
  display: 'inline-flex',
  alignItems: 'flex-end',
  gap: '4px',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
});
