import { style } from '@vanilla-extract/css';

import { inlineMeText } from '@/styles/primitives/badge.css';
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

export const ownerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const avatar = style({
  width: '42px',
  height: '42px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
});

export const ownerNameRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const ownerName = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const meText = style([inlineMeText]);

export const footerRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const dateText = style({
  fontSize: vars.fontSize.text,
  color: vars.color.text,
});

export const memberMeta = style({
  display: 'inline-flex',
  alignItems: 'flex-end',
  gap: '4px',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
});
