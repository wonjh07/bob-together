import { style } from '@vanilla-extract/css';

export const root = style({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '10px',
});

export const iconWrap = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
