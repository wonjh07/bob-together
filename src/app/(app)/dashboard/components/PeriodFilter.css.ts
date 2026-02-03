import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const filterContainer = style({
  position: 'relative',
  display: 'inline-block',
});

export const filterButton = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  padding: '8px 12px',
  backgroundColor: 'white',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ':hover': {
    borderColor: vars.color.main,
  },
});

export const filterButtonActive = style({
  borderColor: vars.color.main,
  color: vars.color.main,
});

export const dropdownMenu = style({
  position: 'absolute',
  top: 'calc(100% + 4px)',
  left: 0,
  minWidth: '120px',
  backgroundColor: 'white',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.sm,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  zIndex: 100,
  overflow: 'hidden',
});

export const dropdownItem = style({
  padding: '10px 14px',
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
  cursor: 'pointer',
  transition: 'background-color 0.15s ease',

  ':hover': {
    backgroundColor: vars.color.mainSoft,
  },
});

export const dropdownItemSelected = style({
  backgroundColor: vars.color.mainSoft,
  color: vars.color.main,
  fontWeight: vars.fontWeight.medium,
});

export const chevronIcon = style({
  width: '16px',
  height: '16px',
  transition: 'transform 0.2s ease',
});

export const chevronIconOpen = style({
  transform: 'rotate(180deg)',
});
