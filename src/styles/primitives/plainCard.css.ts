import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const plainCard = style({
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const plainCardHeadRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
});

export const plainCardTitle = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  wordBreak: 'break-word',
});

export const plainCardBody = style({
  fontSize: vars.fontSize.text,
  color: vars.color.black,
  fontWeight: vars.fontWeight.semibold,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const plainCardMeta = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  fontWeight: vars.fontWeight.medium,
});
