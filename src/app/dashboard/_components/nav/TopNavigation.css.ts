
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
  gap: '12px',
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  color: vars.color.text,
  textDecoration: 'none',
  transition: 'color 0.2s ease, background-color 0.2s ease',
  selectors: {
    '&:hover': {
      color: vars.color.main,
      backgroundColor: vars.color.mainSoft,
    },
  },
});

export const bellIcon = style({
  width: '22px',
  height: '22px',
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
  border: 'none',

  ':hover': {
    outline: `2px solid ${vars.color.main}`,
  },
});
