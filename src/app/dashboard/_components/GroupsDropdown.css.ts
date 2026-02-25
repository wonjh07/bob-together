import { style } from '@vanilla-extract/css';

import * as dropdown from '@/styles/primitives/dropdown.css';
import { vars } from '@/styles/theme.css';

export const groupDropdown = style({
  position: 'relative',
});

export const groupButton = style([dropdown.triggerGhost]);

export const groupButtonActive = style({
  color: vars.color.main,
});

export const chevronIcon = style([dropdown.chevron]);

export const chevronIconOpen = style([dropdown.chevronOpen]);

export const dropdownMenu = style([
  dropdown.menuSurface,
  {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '160px',
    zIndex: 1000,
  },
]);

export const dropdownItem = style([
  dropdown.menuItemButton,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
]);

export const dropdownItemActive = style([dropdown.menuItemSelected]);

export const dropdownEmpty = style([dropdown.menuEmptyText]);

export const dropdownMeta = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});
