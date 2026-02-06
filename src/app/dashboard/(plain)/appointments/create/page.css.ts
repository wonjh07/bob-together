import { style } from '@vanilla-extract/css';

export const page = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  flexDirection: 'column',
});

export const panel = style({
  width: '100%',
  height: '100%',
  gap: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  overflowY: 'scroll',
});