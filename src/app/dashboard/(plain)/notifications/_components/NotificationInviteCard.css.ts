import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  padding: '14px 16px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const typeRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const typeLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const typeIcon = style({
  width: '22px',
  height: '22px',
  color: vars.color.text,
  opacity: 0.9,
});

export const messageRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const messageLink = style({
  textDecoration: 'none',
  color: 'inherit',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
  },
});

export const messageIcon = style({
  width: '22px',
  height: '22px',
  color: vars.color.main,
  flexShrink: 0,
});

export const message = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  lineHeight: 1.35,
  color: vars.color.text,
  wordBreak: 'break-word',
});

export const metaRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const avatar = style({
  width: '30px',
  height: '30px',
  borderRadius: '9999px',
  border: `1px solid ${vars.color.stroke}`,
  objectFit: 'cover',
});

export const metaText = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
});

export const actionRow = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

export const actionButton = style({
  flex: 1,
  padding: '11px 16px',
  border: 'none',
  borderRadius: vars.radius.lg,
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const acceptButton = style({
  color: vars.color.background,
  backgroundColor: vars.color.main,
});

export const rejectButton = style({
  color: vars.color.background,
  backgroundColor: vars.color.text,
});

export const statusText = style({
  margin: 0,
  padding: '10px 12px',
  borderRadius: vars.radius.md,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  textAlign: 'center',
});

export const acceptedStatus = style({
  backgroundColor: vars.color.mainSoft,
  color: vars.color.main,
});

export const rejectedStatus = style({
  backgroundColor: vars.color.stroke,
  color: vars.color.subText,
});

export const endedText = style({
  margin: 0,
  padding: '10px 12px',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.stroke,
  color: vars.color.subText,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  textAlign: 'center',
});
