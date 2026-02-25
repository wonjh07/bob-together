import { style } from '@vanilla-extract/css';

import {
  plainCard,
  plainCardBody,
  plainCardHeadRow,
  plainCardMeta,
  plainCardTitle,
} from '@/styles/primitives/plainCard.css';
import { vars } from '@/styles/theme.css';

export const card = style([plainCard]);

export const headRow = style([plainCardHeadRow, { alignItems: 'center' }]);

export const userRow = style({
  flex: 1,
  minWidth: 0,
});

export const avatar = style({
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
});

export const name = style([plainCardTitle, { fontSize: vars.fontSize.title }]);

export const meta = style([plainCardMeta]);

export const moreButton = style({
  border: 'none',
  backgroundColor: 'transparent',
  color: vars.color.subText,
  fontSize: '32px',
  lineHeight: 1,
  width: '36px',
  height: '36px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'default',
});

export const starRow = style({
  marginTop: '10px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

const starBase = style({
  fontSize: '1.6rem',
  lineHeight: 1,
});

export const starFilled = style([
  starBase,
  {
    color: vars.color.star,
  },
]);

export const starEmpty = style([
  starBase,
  {
    color: vars.color.subText,
  },
]);

export const content = style([plainCardBody, { marginTop: '10px' }]);
