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

export const container = style({
  width: '100%',
  maxWidth: '480px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const headerRow = style({
  width: '100%',
  position: 'absolute',
  top: 0,
  left: 0,
  height: '60px',
  padding: '0 16px',
});
