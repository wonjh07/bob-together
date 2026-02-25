import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const topNav = style({
  position: 'absolute',
  top: 0,
  right: 0,
  width: '100%',
  height: '60px',
  display: 'grid',
  gridTemplateColumns: '1fr auto 1fr',
  columnGap: '8px',
  alignItems: 'center',
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
});

export const backButton = style({
  width: '44px',
  height: '100%',
  border: 'none',
  background: 'transparent',
  fontSize: '2rem',
  color: vars.color.text,
  textAlign: 'center',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const title = style({
  justifySelf: 'center',
  minWidth: 0,
  maxWidth: '100%',
  padding: '0 8px',
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  textAlign: 'center',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: vars.color.black,
});

export const rightButton = style({
  minWidth: '40px',
  width: 'auto',
  height: '40px',
  padding: '0 16px',
  border: 'none',
  background: 'transparent',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  textAlign: 'end',
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',
  color: vars.color.main,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const spacer = style({
  width: '40px',
  minWidth: '40px',
  height: '40px',
  justifySelf: 'end',
});
