import { style, styleVariants } from '@vanilla-extract/css';

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
  marginBottom: '12px',
});

export const titleRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: 1,
  minWidth: 0,
});

export const title = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const statusBadgeBase = style({
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.medium,
  whiteSpace: 'nowrap',
});

export const statusBadge = styleVariants({
  confirmed: [
    statusBadgeBase,
    {
      backgroundColor: '#E8F5E9',
      color: vars.color.success,
    },
  ],
  pending: [
    statusBadgeBase,
    {
      backgroundColor: '#FFF3E0',
      color: vars.color.main,
    },
  ],
  canceled: [
    statusBadgeBase,
    {
      backgroundColor: '#FFEBEE',
      color: vars.color.alert,
    },
  ],
});

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
  gap: '8px',
});

export const meBadge = style({
  padding: '2px 8px',
  backgroundColor: vars.color.button,
  color: 'white',
  borderRadius: '12px',
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.medium,
});

export const hostName = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.text,
});

export const memberCount = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});
