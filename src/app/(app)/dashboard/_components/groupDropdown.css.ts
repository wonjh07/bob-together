import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const groupDropdown = style({
  position: 'relative',
});

export const groupButton = style({
  background: 'none',
  border: 'none',
  fontSize: '14px',
  color: vars.color.text,
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'color 0.2s ease',

  ':hover': {
    color: vars.color.main,
  },
});

export const dropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: '0',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
  minWidth: '120px',
  zIndex: 1000,
  backgroundColor: vars.color.background,
  padding: '12px 0',
});

export const dropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  padding: '12px 16px',
  border: 'none',
  background: 'none',
  color: vars.color.text,
  textDecoration: 'none',
  fontSize: '14px',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  ':hover': {
    backgroundColor: vars.color.stroke,
  },
});

export const dropdownItemActive = style({
  color: vars.color.main,
  fontWeight: vars.fontWeight.semibold,
});

export const dropdownEmpty = style({
  padding: '12px 16px',
  color: vars.color.subText,
  fontSize: '13px',
});

export const dropdownMeta = style({
  fontSize: '12px',
  color: vars.color.subText,
});
