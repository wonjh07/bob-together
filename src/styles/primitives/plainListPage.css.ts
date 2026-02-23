import { style } from '@vanilla-extract/css';

import {
  centeredStatusBox,
  centeredStatusInline,
} from '@/styles/primitives/feedback.css';
import { vars } from '@/styles/theme.css';

export const plainPage = style({
  width: '100%',
  height: '100%',
  overflowY: 'scroll',
  backgroundColor: vars.color.background,
});

export const plainList = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const plainStatusBox = style([centeredStatusBox]);

export const plainStatusInline = style([centeredStatusInline]);

export const plainLoadMoreTrigger = style({
  width: '100%',
  height: '1px',
});
