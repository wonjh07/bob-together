import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const button = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '12px 16px',
  borderRadius: `0.5rem`,
  border: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.mainSoft,
  cursor: 'pointer',
});

export const submitButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '16px',
  fontWeight: vars.fontWeight.bold,
  color: 'white',
  background: vars.color.main,
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
