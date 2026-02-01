export const bp = {
  xsm: '320px', // 초소형 디바이스
  sm: '480px', // 모바일
  md: '768px', // 태블릿
  lg: '1024px', // 노트북
  xl: '1280px', // FHD+
} as const;

export const mq = {
  xsmUp: `screen and (min-width: ${bp.xsm})`,
  smUp: `screen and (min-width: ${bp.sm})`,
  mdUp: `screen and (min-width: ${bp.md})`,
  lgUp: `screen and (min-width: ${bp.lg})`,
  xlUp: `screen and (min-width: ${bp.xl})`,
} as const;
