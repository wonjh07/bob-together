// src/styles/layout.css.ts
import { style } from '@vanilla-extract/css';

import { mq } from './responsive.css';
import { vars } from './theme.css';

export const appShell = style({
  // vh는 모바일에서 주소창 등에 의해 뷰포트 높이가 변할 수 있어 dvh 사용
  // pc 에서는 그대로 vh로 동작
  minHeight: '100dvh', // ✅ 모바일에서 화면 전체 높이 차지
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: vars.color.black,
});

export const appFrame = style({
  background: vars.color.mainSoft,
  width: '100%',
  maxWidth: '1024px',
  minHeight: '100dvh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  // 아이폰을 safe area inset
  paddingBottom: 'env(safe-area-inset-bottom)',
  '@media': {
    [mq.mdUp]: {},
    [mq.lgUp]: {},
    [mq.xlUp]: {},
  },
});

export const flexCenter = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
