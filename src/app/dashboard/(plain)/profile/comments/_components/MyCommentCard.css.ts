import { style } from '@vanilla-extract/css';

import {
  plainCard,
  plainCardBody,
  plainCardHeadRow,
  plainCardMeta,
  plainCardTitle,
} from '@/styles/primitives/plainCard.css';
import { vars } from '@/styles/theme.css';

export const card = style([plainCard, { position: 'relative', gap: '14px' }]);

export const headerRow = style([plainCardHeadRow]);

export const titleRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const calendarIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.main,
  flexShrink: 0,
});

export const title = style([plainCardTitle]);

export const content = style([plainCardBody]);

export const date = style([plainCardMeta]);
