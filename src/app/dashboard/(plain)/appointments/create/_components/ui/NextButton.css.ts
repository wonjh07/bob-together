import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const buttonContainer = style({
  position: 'absolute',
  top: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  height: '60px',
  padding: '0 16px',
});

export const primaryButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: vars.radius.sm,
  border: 'none',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.medium,
  background: vars.color.main,
  color: vars.color.mainSoft,
  cursor: 'pointer',
  textDecoration: 'none',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
