import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const topNav = style({
  position: 'absolute',
  top: '0',
  right: '0',
  width: '100%',
  height: '60px',
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
});

export const backButton = style({
  width: '40px',
  height: '100%',
  border: 'none',
  background: 'transparent',
  textAlign: 'start',
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

export const completeButton = style({
  width: '40px',
  border: 'none',
  background: 'transparent',
  textAlign: 'end',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.main,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});
