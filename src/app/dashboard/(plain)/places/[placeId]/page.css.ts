import { style } from '@vanilla-extract/css';

import {
  centeredStatusBox,
  centeredStatusInline,
} from '@/styles/primitives/feedback.css';
import { vars } from '@/styles/theme.css';

export const page = style({
  width: '100%',
  height: '100%',
  overflowY: 'scroll',
  backgroundColor: vars.color.background,
});

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
  padding: '16px',
});

export const summarySection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const placeName = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const placeMeta = style({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '4px',
  color: vars.color.subText,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const star = style({
  color: vars.color.star,
});

export const address = style({
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
  fontWeight: vars.fontWeight.medium,
  wordBreak: 'break-word',
});

export const mapWrapper = style({
  borderRadius: vars.radius.xlg,
  overflow: 'hidden',
  border: `1px solid ${vars.color.stroke}`,
});

export const reviewSection = style({
  width: '100%',
});

export const reviewHeader = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '0 16px',
});

export const reviewIcon = style({
  width: '18px',
  height: '18px',
  color: vars.color.subText,
});

export const reviewTitle = style({
  fontSize: vars.fontSize.text,
  color: vars.color.subText,
  fontWeight: vars.fontWeight.semibold,
});

export const reviewList = style({
  display: 'flex',
  flexDirection: 'column',
});

export const statusBox = style([centeredStatusBox]);

export const statusInline = style([centeredStatusInline]);

export const loadMoreTrigger = style({
  width: '100%',
  height: '1px',
});
