import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  padding: `16px`,
  gap: '8px',
  fontWeight: vars.fontWeight.thin,
  fontSize: vars.fontSize.instruction,
  boxSizing: 'border-box',
});

export const buttonContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  width: '100%',
  maxWidth: '768px',
});

export const serviceTitle = style({
  fontSize: vars.fontSize.serviceTitle,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const title = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
  margin: `32px`,
});
