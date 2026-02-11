import { globalStyle } from '@vanilla-extract/css';

import { vars } from './theme.css';

globalStyle('body', {
  fontFamily: `var(--font-pretendard), ${vars.font.body}`, // 오른쪽 변수는 폰트가 로드되지 않을 때 fall back
});

// 터치 동작 및 오버스크롤 동작 전역 설정
globalStyle('html, body', {
  touchAction: 'pan-x pan-y',
  overscrollBehaviorY: 'none',
  overscrollBehaviorX: 'none',
});

globalStyle(`::-webkit-scrollbar`, {
  display: 'none',
});
