import { style } from '@vanilla-extract/css';

export const row = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

export const icon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});
