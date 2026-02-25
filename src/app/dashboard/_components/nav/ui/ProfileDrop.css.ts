import { style } from '@vanilla-extract/css';

import * as dropdown from '@/styles/primitives/dropdown.css';

export const dropdownContent = style([
  dropdown.menuSurface,
  {
    position: 'fixed',
    top: '60px',
    right: '16px',
    minWidth: '150px',
    zIndex: 1001,
  },
]);

export const logoutButton = style([dropdown.menuItemButton]);
