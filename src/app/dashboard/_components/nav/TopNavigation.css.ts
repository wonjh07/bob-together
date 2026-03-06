import { keyframes, style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

const bubbleEntrance = keyframes({
  '0%': {
    opacity: 0,
    transform: 'translate(-8px, -50%) scale(0.96)',
  },
  '100%': {
    opacity: 1,
    transform: 'translate(0, -50%) scale(1)',
  },
});

const bubbleFloat = keyframes({
  '0%': {
    transform: 'translateY(-50%)',
  },
  '50%': {
    transform: 'translateY(calc(-50% - 4px))',
  },
  '100%': {
    transform: 'translateY(-50%)',
  },
});

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
  fontSize: '20px',
  fontWeight: 'bold',
  color: vars.color.main,
});

export const navRight = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const notificationLinkWrap = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const iconButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  color: vars.color.text,
  textDecoration: 'none',
  transition: 'color 0.2s ease, background-color 0.2s ease',
  selectors: {
    '&:active': {
      color: vars.color.background,
      backgroundColor: vars.color.text,
    },
    '&:focus-visible': {
      color: vars.color.background,
      backgroundColor: vars.color.text,
      outline: 'none',
    },
  },
  '@media': {
    '(hover: hover) and (pointer: fine)': {
      selectors: {
        '&:hover': {
          color: vars.color.background,
          backgroundColor: vars.color.text,
        },
      },
    },
  },
});

export const bellIcon = style({
  width: '28px',
  height: '28px',
});

export const bellIconUnread = style({
  color: vars.color.main,
});

export const menuButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'none',
  border: 'none',
  color: vars.color.text,
  transition: 'color 0.2s ease, background-color 0.2s ease',
  cursor: 'pointer',
  selectors: {
    '&:active': {
      color: vars.color.background,
      backgroundColor: vars.color.main,
    },
    '&:focus-visible': {
      color: vars.color.background,
      backgroundColor: vars.color.main,
      outline: 'none',
    },
  },
  '@media': {
    '(hover: hover) and (pointer: fine)': {
      selectors: {
        '&:hover': {
          color: vars.color.background,
          backgroundColor: vars.color.main,
        },
      },
    },
  },
});

export const menuIcon = style({
  width: '24px',
  height: '24px',
});

export const notificationBubble = style({
  position: 'absolute',
  top: '50%',
  right: 'calc(100% + 6px)',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  padding: '6px 8px',
  borderRadius: '999px 999px 0 999px',
  backgroundColor: vars.color.main,
  color: vars.color.background,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.16)',
  pointerEvents: 'none',
  zIndex: 1,
  animation: `${bubbleEntrance} 2000ms cubic-bezier(0.22, 1, 0.36, 1), ${bubbleFloat} 2.2s ease-in-out 220ms infinite`,
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animation: 'none',
    },
  },
});
