import { style } from '@vanilla-extract/css';

export const page = style({
  width: '100%',
  minHeight: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
});

export const panel = style({
  width: '100%',
  maxWidth: '480px',
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '16px',
});

export const headerRow = style({
  width: '100%',
  paddingBottom: '16px',
});
