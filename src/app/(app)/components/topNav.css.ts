import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const topNav = style({
  position: 'fixed',
  top: '0',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: '768px',
  height: '60px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: '16px',
  paddingRight: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.background,
  zIndex: 100,
});

export const logoSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  cursor: 'pointer',
  fontSize: '20px',
  fontWeight: 'bold',
  color: vars.color.main,
});

export const navRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
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
  top: '100%',
  right: 0,
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  minWidth: '120px',
  zIndex: 1000,
  backgroundColor: vars.color.background,
});

export const dropdownItem = style({
  display: 'block',
  padding: '12px 16px',
  color: vars.color.text,
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'background-color 0.2s ease',

  ':hover': {
    color: vars.color.main,
  },
});

export const groupDropdown = style({
  position: 'relative',
});

export const userIcon = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  overflow: 'hidden',
  background: 'none',
  outline: `2px solid ${vars.color.stroke}`,
  borderRadius: '50%',
  transition: 'outline 0.2s ease',
  cursor: 'pointer',

  ':hover': {
    outline: `2px solid ${vars.color.main}`,
  },
});
