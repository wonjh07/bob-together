import { keyframes, style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const root = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
});

export const spinner = style({
  display: 'inline-block',
  borderStyle: 'solid',
  borderColor: vars.color.stroke,
  borderTopColor: vars.color.main,
  borderRadius: '50%',
  animation: `${spin} 0.8s linear infinite`,
});

export const spinnerSubtle = style({
  borderTopColor: vars.color.subText,
});

export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});
