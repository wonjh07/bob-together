import { style } from '@vanilla-extract/css';

import * as dropdownStyles from '@/styles/primitives/dropdown.css';
import { vars } from '@/styles/theme.css';

export const wrap = style({
  position: 'relative',
  flexShrink: 0,
});

export const trigger = style([
  dropdownStyles.triggerGhost,
  {
    padding: 0,
    lineHeight: 1,
    color: vars.color.subText,
  },
]);

export const triggerIcon = style({
  width: '22px',
  height: '22px',
});

export const dropdown = style([
  dropdownStyles.menuSurface,
  {
    position: 'absolute',
    top: '30px',
    right: 0,
    width: '124px',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 10,
  },
]);

export const linkItem = style([dropdownStyles.menuItemLink]);

export const buttonItem = style([dropdownStyles.menuItemButton]);

export const dangerItem = style([dropdownStyles.menuItemDanger]);

export const disabledItem = style([dropdownStyles.menuItemDisabled]);
