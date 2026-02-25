import { style } from '@vanilla-extract/css';

import {
  actionButtonBase,
  actionButtonPrimary,
} from '@/styles/primitives/actionButton.css';
import * as chip from '@/styles/primitives/chip.css';
import {
  plainLoadMoreTrigger,
  plainList,
  plainPage,
  plainStatusBox,
  plainStatusInline,
} from '@/styles/primitives/plainListPage.css';
import { vars } from '@/styles/theme.css';

export const page = plainPage;
export const list = plainList;
export const statusBox = plainStatusBox;
export const statusInline = plainStatusInline;
export const loadMoreTrigger = plainLoadMoreTrigger;

export const filterBox = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'nowrap',
  gap: '12px',
  padding: '14px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const filterContainer = style([
  chip.chipContainer,
  {
    flex: '1 1 auto',
    minWidth: 0,
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
]);
export const chipButton = style([chip.chipButton]);
export const chipButtonActive = style([chip.chipButtonActive]);

export const filterActions = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  width: 'auto',
  marginLeft: 'auto',
  justifyContent: 'flex-end',
  flexShrink: 0,
});

export const createButton = style([
  actionButtonBase,
  actionButtonPrimary,
  {
    width: '36px',
    height: '36px',
    padding: 0,
    borderRadius: '9999px',
    flexShrink: 0,
    lineHeight: 0,
  },
]);

export const findButton = style([
  actionButtonBase,
  {
    width: '36px',
    height: '36px',
    padding: 0,
    borderRadius: '9999px',
    flexShrink: 0,
    lineHeight: 0,
    backgroundColor: vars.color.text,
    color: vars.color.background,
  },
]);
