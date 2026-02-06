import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const title = style({
  fontSize: vars.fontSize.instruction,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  marginBottom: '24px',
});

export const dropdown = style({
  width: '100%',
  position: 'relative',
});

export const dropdownButton = style({
  width: '100%',
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  color: vars.color.text,
  borderRadius: vars.radius.md,
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
});

export const dropdownMenu = style({
  position: 'absolute',
  top: '100%',
  left: 0,
  width: '100%',
  border: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
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
  ':hover': {
    backgroundColor: vars.color.stroke,
  },
});

export const dropdownItemActive = style({
  color: vars.color.main,
  fontWeight: vars.fontWeight.semibold,
});

export const helperText = style({
  minHeight: '32px',
  fontSize: vars.fontSize.text,
  color: vars.color.alert,
});
