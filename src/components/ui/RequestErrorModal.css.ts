import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  zIndex: 2000,
});

export const dialog = style({
  width: '100%',
  maxWidth: '340px',
  borderRadius: vars.radius.xlg,
  backgroundColor: vars.color.background,
  border: `1px solid ${vars.color.stroke}`,
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
});

export const body = style({
  padding: '20px 18px 12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const title = style({
  margin: 0,
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const message = style({
  margin: 0,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
  lineHeight: 1.45,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const debugBox = style({
  marginTop: '4px',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.mainSoft,
  padding: '10px 10px 8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  maxHeight: '180px',
  overflow: 'auto',
});

export const debugTitle = style({
  margin: 0,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const debugMessage = style({
  margin: 0,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
  lineHeight: 1.4,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const footer = style({
  padding: '12px 18px 18px',
});

export const closeButton = style({
  width: '100%',
  border: 'none',
  borderRadius: vars.radius.md,
  padding: '10px 12px',
  backgroundColor: vars.color.main,
  color: vars.color.background,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
});
