import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const title = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
});

export const dropdown = style({
  position: 'relative',
});

export const dropdownButton = style({
  width: '100%',
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  color: vars.color.text,
  borderRadius: '8px',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
});

export const dropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: 0,
  width: '100%',
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
  padding: '8px 0',
  zIndex: 10,
});

export const dropdownItem = style({
  width: '100%',
  border: 'none',
  background: 'none',
  textAlign: 'left',
  padding: '12px 16px',
  cursor: 'pointer',
  color: vars.color.text,
});

export const dropdownItemActive = style({
  color: vars.color.main,
  fontWeight: vars.fontWeight.semibold,
});

export const helperText = style({
  minHeight: '20px',
  fontSize: vars.fontSize.text,
  color: vars.color.alert,
});

export const buttonRow = style({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const nextButton = style({
  border: 'none',
  borderRadius: '8px',
  backgroundColor: vars.color.main,
  color: vars.color.text,
  padding: '12px 16px',
  cursor: 'pointer',
});
