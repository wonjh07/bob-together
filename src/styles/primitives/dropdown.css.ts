import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const triggerOutline = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.background,
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'border-color 0.2s ease, color 0.2s ease',
  selectors: {
    '&:hover': {
      borderColor: vars.color.main,
      color: vars.color.main,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const triggerOutlineActive = style({
  borderColor: vars.color.main,
  color: vars.color.main,
});

export const triggerGhost = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  padding: '8px',
  border: 'none',
  background: 'none',
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  selectors: {
    '&:hover': {
      color: vars.color.main,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const chevron = style({
  width: '16px',
  height: '16px',
  transition: 'transform 0.2s ease',
});

export const chevronOpen = style({
  transform: 'rotate(180deg)',
});

export const menuSurface = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.background,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
});

const menuItemBase = style({
  width: '100%',
  display: 'block',
  padding: '12px 16px',
  border: 'none',
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: 'transparent',
  textAlign: 'left',
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.15s ease, color 0.15s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.mainSoft,
    },
    '&:last-child': {
      borderBottom: 'none',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const menuItemButton = style([menuItemBase]);

export const menuItemLink = style([menuItemBase]);

export const menuItemSelected = style({
  backgroundColor: vars.color.mainSoft,
  color: vars.color.main,
  fontWeight: vars.fontWeight.semibold,
});

export const menuItemDanger = style({
  color: vars.color.alert,
});

export const menuItemDisabled = style({
  width: '100%',
  display: 'block',
  padding: '12px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.mainSoft,
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  cursor: 'not-allowed',
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
});

export const menuEmptyText = style({
  padding: '12px 16px',
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});
