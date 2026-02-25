import { style } from '@vanilla-extract/css';

import { vars } from '@/styles/theme.css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
});

export const filtersContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  marginBottom: '8px',
});

export const filterRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap',
});

export const listContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const emptyState = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  textAlign: 'center',
});

export const emptyIcon = style({
  width: '64px',
  height: '64px',
  color: vars.color.stroke,
  marginBottom: '16px',
});

export const emptyTitle = style({
  fontSize: vars.fontSize.title,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.text,
  marginBottom: '8px',
});

export const emptyDescription = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});

export const loadingContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '24px',
});

export const loadMoreTrigger = style({
  height: '20px',
  marginTop: '8px',
});

export const errorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px',
  gap: '12px',
});

export const errorMessage = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.alert,
  textAlign: 'center',
});

export const retryButton = style({
  padding: '8px 16px',
  backgroundColor: vars.color.main,
  border: 'none',
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.subText,
  color: 'white',
  cursor: 'pointer',
  transition: 'opacity 0.2s ease',

  ':hover': {
    opacity: 0.9,
  },
});
