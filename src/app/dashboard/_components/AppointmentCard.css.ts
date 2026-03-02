import { style, styleVariants } from '@vanilla-extract/css';

import {
  badgeCanceled,
  badgeCreated,
  badgeEnded,
  badgeJoined,
  badgePending,
} from '@/styles/primitives/badge.css';
import { vars } from '@/styles/theme.css';

export const card = style({
  display: 'block',
  padding: '16px',
  borderBottom: `1px solid ${vars.color.stroke}`,
  textDecoration: 'none',
  color: 'inherit',
  contentVisibility: 'auto',
  containIntrinsicSize: '168px',
  transition: 'background-color 0.2s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.mainSoft,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.main}`,
      outlineOffset: '-2px',
    },
  },
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: '12px',
});

export const headerMain = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  flex: 1,
  minWidth: 0,
});

export const badgeRow = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '8px',
});

export const title = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
});

export const statusBadge = styleVariants({
  pending: [badgePending],
  canceled: [badgeCanceled],
  ended: [badgeEnded],
});

export const joinedBadge = style([badgeJoined]);

export const createdBadge = style([badgeCreated]);

export const placeInfo = style({
  marginBottom: '12px',
});

export const cardFooter = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const participantInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const memberCount = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});

export const statsInfo = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
});

export const commentCount = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});
