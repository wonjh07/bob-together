import { style } from '@vanilla-extract/css';

import { centeredStatusBox } from '@/styles/primitives/feedback.css';
import { vars } from '@/styles/theme.css';

export const page = style({
  width: '100%',
  minHeight: '100%',
  backgroundColor: vars.color.background,
  display: 'flex',
  flexDirection: 'column',
});

export const statusBox = style([centeredStatusBox]);

export const summarySection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  padding: '16px',
});

export const date = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const placeName = style({
  margin: 0,
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  wordBreak: 'break-word',
});

export const placeMeta = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  flexWrap: 'wrap',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.subText,
});

export const star = style({
  fontSize: vars.fontSize.text,
  color: vars.color.star,
});

export const ratingSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '16px',
});

export const sectionTitle = style({
  fontSize: vars.fontSize.header,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
});

export const starRow = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
});

const starButtonBase = style({
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: '2rem',
  padding: 0,
  cursor: 'pointer',
});

export const starButton = style([
  starButtonBase,
  {
    color: vars.color.subText,
  },
]);

export const starButtonActive = style([
  starButtonBase,
  {
    color: vars.color.star,
  },
]);

export const reviewSection = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '16px',
});

export const reviewHead = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
});

export const count = style({
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.black,
});

export const textareaWrap = style({
  border: `1px solid ${vars.color.stroke}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.mainSoft,
  padding: '14px 16px',
});

export const textarea = style({
  width: '100%',
  border: 'none',
  backgroundColor: 'transparent',
  outline: 'none',
  resize: 'none',
  overflowY: 'auto',
  maxHeight: '220px',
  color: vars.color.text,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  selectors: {
    '&::placeholder': {
      color: vars.color.text,
      opacity: 0.8,
      fontWeight: vars.fontWeight.semibold,
    },
  },
});

const submitButtonBase = style({
  marginTop: '18px',
  marginBottom: '24px',
  padding: '12px',
  border: 'none',
  borderRadius: vars.radius.md,
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.semibold,
});

export const submitButton = style([
  submitButtonBase,
  {
    backgroundColor: vars.color.main,
    color: vars.color.background,
    cursor: 'pointer',
    selectors: {
      '&:disabled': {
        backgroundColor: vars.color.muted,
        color: vars.color.subText,
        cursor: 'not-allowed',
      },
    },
  },
]);

export const submitButtonDisabled = style([
  submitButtonBase,
  {
    backgroundColor: vars.color.muted,
    color: vars.color.subText,
    cursor: 'not-allowed',
  },
]);
