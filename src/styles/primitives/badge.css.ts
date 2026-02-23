import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const badgePillBase = style({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.medium,
  whiteSpace: 'nowrap',
});

export const badgePending = style([
  badgePillBase,
  {
    backgroundColor: '#FFF3E0',
    color: vars.color.main,
  },
]);

export const badgeCanceled = style([
  badgePillBase,
  {
    backgroundColor: '#FFEBEE',
    color: vars.color.alert,
  },
]);

export const badgeEnded = style([
  badgePillBase,
  {
    backgroundColor: '#EAEAEA',
    color: vars.color.subText,
  },
]);

export const badgeJoined = style([
  badgePillBase,
  {
    backgroundColor: '#E8F5E9',
    color: vars.color.success,
  },
]);

export const badgeCreated = style([
  badgePillBase,
  {
    backgroundColor: vars.color.mainSoft,
    color: vars.color.main,
  },
]);

export const inlineMeText = style({
  color: vars.color.main,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  flexShrink: 0,
});

export const inlineMeTextCompact = style([
  inlineMeText,
  {
    fontSize: vars.fontSize.caption,
    fontWeight: vars.fontWeight.medium,
  },
]);

export const badgeToneAccepted = style({
  backgroundColor: vars.color.mainSoft,
  color: vars.color.main,
});

export const badgeToneMuted = style({
  backgroundColor: vars.color.stroke,
  color: vars.color.subText,
});
