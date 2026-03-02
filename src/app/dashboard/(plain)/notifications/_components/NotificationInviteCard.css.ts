import { style } from '@vanilla-extract/css';

import {
  actionButtonBase,
  actionButtonMedium,
  actionButtonPrimary,
  actionButtonSecondary,
} from '@/styles/primitives/actionButton.css';
import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  padding: '14px 16px 16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
});

export const typeRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const typeLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.text,
});

export const typeIcon = style({
  width: '18px',
  height: '18px',
  color: vars.color.text,
});

export const messageRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const messageLink = style({
  textDecoration: 'none',
  color: 'inherit',
  selectors: {
    '&:hover': {
      opacity: 0.9,
    },
  },
});

export const messageIcon = style({
  width: '22px',
  height: '22px',
  color: vars.color.main,
  flexShrink: 0,
});

export const message = style({
  fontSize: vars.fontSize.title,
  color: vars.color.text,
  fontWeight: vars.fontWeight.medium,
  wordBreak: 'break-word',
});

export const metaRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
});

export const actionRow = style({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
});

export const actionButton = style({
  flex: 1,
});

const invitationActionButtonBase = style([
  actionButtonBase,
  actionButtonMedium,
  {
    width: '100%',
  },
]);

export const acceptButton = style([
  invitationActionButtonBase,
  actionButtonPrimary,
]);

export const rejectButton = style([
  invitationActionButtonBase,
  actionButtonSecondary,
]);
