import { style } from '@vanilla-extract/css';

import {
  actionButtonBase,
  actionButtonMedium,
  actionButtonPrimary,
} from '@/styles/primitives/actionButton.css';
import { vars } from '@/styles/theme.css';

const fullWidth = style({
  width: '100%',
});

export const button = style([
  actionButtonBase,
  actionButtonMedium,
  fullWidth,
  {
    borderRadius: vars.radius.sm,
    fontSize: vars.fontSize.text,
    color: vars.color.mainSoft,
  },
]);

export const submitButton = style([
  actionButtonBase,
  actionButtonPrimary,
  fullWidth,
  {
    padding: '12px',
    borderRadius: vars.radius.sm,
    fontSize: vars.fontSize.text,
    fontWeight: vars.fontWeight.bold,
  },
]);

export const buttonContent = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
});

export const buttonIcon = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

export const buttonLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});
