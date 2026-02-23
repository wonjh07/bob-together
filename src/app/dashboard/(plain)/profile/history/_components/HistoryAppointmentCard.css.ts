import { style } from '@vanilla-extract/css';

import {
  actionButtonBase,
  actionButtonMuted,
  actionButtonPrimary,
  actionButtonSecondary,
  actionButtonSmall,
} from '@/styles/primitives/actionButton.css';
import {
  plainCard,
  plainCardHeadRow,
  plainCardTitle,
} from '@/styles/primitives/plainCard.css';
import { vars } from '@/styles/theme.css';

export const card = style([plainCard]);

export const cardHead = style([plainCardHeadRow, { alignItems: 'center' }]);

export const date = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const creatorMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const creatorAvatar = style({
  width: '36px',
  height: '36px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  backgroundColor: vars.color.stroke,
  objectFit: 'cover',
});

export const creatorName = style({
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const title = style([plainCardTitle]);

export const placeName = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.text,
  wordBreak: 'break-word',
  marginTop: '8px',
});

export const placeMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '4px',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const star = style({
  color: vars.color.star,
  fontSize: '1.35rem',
});

export const buttonRow = style({
  marginTop: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const buttonBase = style([actionButtonBase, actionButtonSmall, { flex: 1 }]);

export const detailButton = style([
  buttonBase,
  actionButtonSecondary,
]);

export const reviewButton = style([
  buttonBase,
  actionButtonPrimary,
]);

export const reviewButtonDisabled = style([
  buttonBase,
  actionButtonMuted,
]);
