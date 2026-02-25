import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const root = style({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  gap: '8px',
  padding: '12px 16px',
  border: `1px solid ${vars.color.main}`,
  borderRadius: vars.radius.xlg,
  backgroundColor: vars.color.background,
});

export const input = style({
  flex: 1,
  minWidth: 0,
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
});

export const submitButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '28px',
  height: '28px',
  padding: 0,
  border: 'none',
  background: 'none',
  color: vars.color.main,
  cursor: 'pointer',
  transition: 'transform 0.1s ease-in-out',
  selectors: {
    '&:hover': {
      transform: 'scale(1.15)',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
});
