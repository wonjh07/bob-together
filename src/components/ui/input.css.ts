import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const inputWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const inputLabel = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
  marginBottom: '4px',
});

export const inputField = style({
  width: '100%',
  padding: '12px',
  fontSize: vars.fontSize.text,
  color: vars.color.text,
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '12px',
  background: 'transparent',
  outline: 'none',
  transition: 'border-color 0.2s ease-in-out',
  '::placeholder': {
    color: vars.color.subText,
  },
  ':focus': {
    borderColor: vars.color.main,
  },
});

export const caption = style({
  fontSize: vars.fontSize.caption,
  color: '#FF0000',
  minHeight: '20px',
});
