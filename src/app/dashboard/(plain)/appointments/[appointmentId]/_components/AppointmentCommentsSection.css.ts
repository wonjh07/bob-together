import { style } from '@vanilla-extract/css';

import { centeredEmptyText } from '@/styles/primitives/feedback.css';
import { vars } from '@/styles/theme.css';

export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
  marginTop: '16px',
  marginBottom: '80px',
});

export const header = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: vars.color.text,
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.bold,
});

export const commentIcon = style({
  width: '24px',
  height: '24px',
  color: vars.color.subText,
});

export const count = style({
  color: vars.color.subText,
});

export const inputWrap = style({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px',
  width: '100%',
  border: `1px solid ${vars.color.main}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.mainSoft,
  padding: '12px 16px',
});

export const input = style({
  flex: 1,
  border: 'none',
  background: 'transparent',
  outline: 'none',
  resize: 'none',
  overflowY: 'auto',
  maxHeight: '108px',
  lineHeight: 1.4,
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

export const submitButton = style({
  width: '24px',
  height: '24px',
  border: 'none',
  borderRadius: '999px',
  backgroundColor: 'transparent',
  color: vars.color.main,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const planeIcon = style({
  width: '28px',
  height: '28px',
});

export const helperText = style({
  margin: 0,
  minHeight: '16px',
  fontSize: vars.fontSize.caption,
  color: vars.color.alert,
});

export const list = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '18px',
});

export const card = style({
  display: 'flex',
  justifyContent: 'space-between',
});

export const cardLeft = style({
  display: 'flex',
  gap: '12px',
  minWidth: 0,
  flex: 1,
});

export const avatar = style({
  width: '44px',
  height: '44px',
  borderRadius: '999px',
  border: `2px solid ${vars.color.stroke}`,
  objectFit: 'cover',
  backgroundColor: vars.color.stroke,
  flexShrink: 0,
});

export const cardBody = style({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
});

export const nickname = style({
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const meta = style({
  margin: '2px 0 0',
  fontSize: vars.fontSize.subText,
  color: vars.color.subText,
});

export const content = style({
  margin: '6px 0 0',
  fontSize: vars.fontSize.text,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.black,
  lineHeight: 1.35,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
});

export const editForm = style({
  marginTop: '8px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const editInputWrap = style({
  display: 'flex',
  alignItems: 'flex-end',
  gap: '8px',
  width: '100%',
  border: `1px solid ${vars.color.main}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.mainSoft,
  padding: '10px 12px',
});

export const editActions = style({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
});

const editButtonBase = style({
  border: 'none',
  borderRadius: vars.radius.sm,
  padding: '8px 12px',
  fontSize: vars.fontSize.subText,
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  selectors: {
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
});

export const editCancelButton = style([
  editButtonBase,
  {
    backgroundColor: vars.color.stroke,
    color: vars.color.subText,
  },
]);

export const editSubmitButton = style([
  editButtonBase,
  {
    backgroundColor: vars.color.main,
    color: vars.color.background,
  },
]);

export const empty = style([centeredEmptyText]);
