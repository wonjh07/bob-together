import { style, styleVariants } from '@vanilla-extract/css';

import * as dropdown from '@/styles/primitives/dropdown.css';
import { vars } from '@/styles/theme.css';

export const groupDropdown = style({
  position: 'relative',
});

export const groupButtonLabel = style({
  maxWidth: '140px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

const groupButtonBase = style([
  dropdown.triggerGhost,
]);

export const groupButton = styleVariants({
  closed: [groupButtonBase],
  open: [
    groupButtonBase,
    {
      color: vars.color.main,
    },
  ],
});

const chevronIconBase = style([
  dropdown.chevron,
]);
export const chevronIcon = styleVariants({
  closed: [chevronIconBase],
  open: [
    chevronIconBase,
    {
      transform: 'rotate(180deg)',
    },
  ],
});

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

const dropdownItemBase = style([
  dropdown.menuItemButton,
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
]);
export const dropdownItem = styleVariants({
  default: [dropdownItemBase],
  selected: [
    dropdownItemBase,
    {
      backgroundColor: vars.color.mainSoft,
      color: vars.color.main,
      fontWeight: vars.fontWeight.semibold,
    },
  ],
});
export const dropdownItemLabel = style({
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const dropdownEmpty = style([dropdown.menuEmptyText]);
