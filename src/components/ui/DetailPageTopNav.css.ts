import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const movebackContainer = style({
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  top: '0',
  right: '0',
  width: '100%',
  height: '60px',
  padding: '0 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const movebackButton = style({
  width: `40px`,
  height: `100%`,
  textAlign: 'start',
  background: 'transparent',
  border: 'none',
  fontSize: '2.25rem',
  color: vars.color.text,
  cursor: 'pointer',
  marginBottom: '2px',
});

export const title = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const primaryButton = style({
  width: '40px',
  textAlign: 'end',
  border: 'none',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.main,
  cursor: 'pointer',
  textDecoration: 'none',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
