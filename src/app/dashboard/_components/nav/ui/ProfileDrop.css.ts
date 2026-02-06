import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const dropdownContent = style({
  position: 'fixed',
  top: '60px',
  right: '16px',
  backgroundColor: vars.color.background,
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
  padding: '12px 0',
  zIndex: 1001,
  minWidth: '150px',
});

export const logoutButton = style({
  width: '100%',
  padding: '12px 16px',
  background: 'none',
  border: 'none',
  color: vars.color.text,
  fontSize: '14px',
  cursor: 'pointer',
  textAlign: 'left',
  transition: 'background-color 0.2s ease',

  ':hover': {
    backgroundColor: vars.color.stroke,
  },

  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});
