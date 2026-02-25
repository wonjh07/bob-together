import { style } from '@vanilla-extract/css';

import * as dropdown from '@/styles/primitives/dropdown.css';

export const filterContainer = style({
  position: 'relative',
  display: 'inline-block',
});

export const filterButton = style([dropdown.triggerOutline]);

export const filterButtonActive = style([dropdown.triggerOutlineActive]);

export const dropdownMenu = style([
  dropdown.menuSurface,
  {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 0,
    minWidth: '120px',
    zIndex: 100,
  },
]);

export const dropdownItem = style([dropdown.menuItemButton]);

export const dropdownItemSelected = style([dropdown.menuItemSelected]);

export const chevronIcon = style([dropdown.chevron]);

export const chevronIconOpen = style([dropdown.chevronOpen]);
