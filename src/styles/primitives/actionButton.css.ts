import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const actionButtonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  textDecoration: 'none',
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

export const actionButtonSmall = style({
  padding: '8px',
  borderRadius: vars.radius.xlg,
  fontSize: vars.fontSize.text,
});

export const actionButtonMedium = style({
  padding: '11px 16px',
  borderRadius: vars.radius.lg,
  fontSize: vars.fontSize.title,
});

export const actionButtonPrimary = style({
  backgroundColor: vars.color.main,
  color: vars.color.background,
});

export const actionButtonSecondary = style({
  backgroundColor: vars.color.text,
  color: vars.color.background,
});

export const actionButtonMuted = style({
  backgroundColor: vars.color.muted,
  color: vars.color.subText,
});
