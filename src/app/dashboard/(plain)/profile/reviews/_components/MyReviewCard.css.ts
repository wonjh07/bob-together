import { style } from '@vanilla-extract/css';

import {
  plainCard,
  plainCardBody,
  plainCardHeadRow,
  plainCardMeta,
  plainCardTitle,
} from '@/styles/primitives/plainCard.css';
import { vars } from '@/styles/theme.css';

export const card = style([plainCard, { position: 'relative' }]);

export const headRow = style([plainCardHeadRow]);

export const placeName = style([plainCardTitle]);

export const starRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

const starBase = style({
  fontSize: '1.5rem',
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

export const content = style([plainCardBody, { padding: '12px 0' }]);

export const date = style([plainCardMeta]);
