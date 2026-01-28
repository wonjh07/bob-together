import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const successPage = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  maxWidth: '480px',
  padding: '0 16px',
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
  width: '100%',
});

export const title = style({
  fontSize: '28px',
  fontWeight: 'bold',
  color: vars.color.main,
  textAlign: 'center',
});

export const message = style({
  fontSize: '16px',
  color: vars.color.text,
  textAlign: 'center',
  lineHeight: '1.6',
});

export const buttonContainer = style({
  marginTop: '16px',
});

export const button = style({
  width: '100%',
  padding: '12px',
  fontSize: '16px',
  fontWeight: 'bold',
  border: 'none',
  borderRadius: '8px',
  background: vars.color.main,
  color: 'white',
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'block',
  textAlign: 'center',
});
