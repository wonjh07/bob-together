import { style, styleVariants } from '@vanilla-extract/css';

import {
  badgeCanceled,
  badgeCreated,
  badgeEnded,
  badgeJoined,
  badgePending,
  inlineMeTextCompact,
} from '@/styles/primitives/badge.css';
import { vars } from '@/styles/theme.css';

export const card = style({
  backgroundColor: 'white',
  borderRadius: vars.radius.md,
  padding: '16px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  border: `1px solid ${vars.color.stroke}`,
  transition: 'box-shadow 0.2s ease',

  ':hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
});

export const cardHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '10px',
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
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const statusBadge = styleVariants({
  pending: [badgePending],
  canceled: [badgeCanceled],
  ended: [badgeEnded],
});

export const joinedBadge = style([badgeJoined]);

export const createdBadge = style([badgeCreated]);

export const editButton = style({
  padding: '6px 12px',
  backgroundColor: 'transparent',
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
  cursor: 'pointer',
  transition: 'all 0.2s ease',

  ':hover': {
    borderColor: vars.color.main,
    color: vars.color.main,
  },
});

export const placeInfo = style({
  marginBottom: '12px',
});

export const placeName = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
  marginBottom: '4px',
});

export const placeDetail = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: vars.fontSize.caption,
  color: vars.color.subText,
});

export const categoryTag = style({
  padding: '2px 6px',
  backgroundColor: vars.color.mainSoft,
  borderRadius: '4px',
  fontSize: vars.fontSize.caption,
  color: vars.color.main,
});

export const dateTimeInfo = style({
  display: 'flex',
  gap: '16px',
  marginBottom: '12px',
  flexWrap: 'wrap',
});

export const dateTimeItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
});

export const icon = style({
  width: '16px',
  height: '16px',
  color: vars.color.subText,
});

export const cardFooter = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '12px',
  borderTop: `1px solid ${vars.color.stroke}`,
});

export const participantInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
});

export const meBadge = style([inlineMeTextCompact]);

export const hostName = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
});

export const memberCount = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});

export const memberInfo = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

export const memberIcon = style({
  width: '16px',
  height: '16px',
  color: vars.color.subText,
});

export const statsInfo = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
});

export const commentInfo = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
});

export const commentIcon = style({
  width: '16px',
  height: '16px',
  color: vars.color.subText,
});

export const commentCount = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});
