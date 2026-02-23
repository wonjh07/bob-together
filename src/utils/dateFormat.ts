const KOREAN_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

function parseDate(value: string): Date | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function formatDateDot(value: string, fallback = '-'): string {
  const date = parseDate(value);
  if (!date) return fallback;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatDateKoreanWithWeekday(
  value: string,
  fallback = '-',
): string {
  const date = parseDate(value);
  if (!date) return fallback;

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = KOREAN_WEEKDAYS[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

export function formatTime24(value: string, fallback = '--:--'): string {
  const date = parseDate(value);
  if (!date) return fallback;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatTimeKoreanMeridiem(value: string, fallback = '-'): string {
  const date = parseDate(value);
  if (!date) return fallback;

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const period = hours < 12 ? '오전' : '오후';
  const displayHours = hours % 12 || 12;
  return `${period} ${displayHours}:${minutes}`;
}

export function formatTimeRange24(
  startAt: string,
  endsAt: string,
  separator = '-',
): string {
  return `${formatTime24(startAt)}${separator}${formatTime24(endsAt)}`;
}

export function formatTimeRangeKoreanMeridiem(
  startAt: string,
  endsAt: string,
  separator = ' - ',
): string {
  return `${formatTimeKoreanMeridiem(startAt)}${separator}${formatTimeKoreanMeridiem(endsAt)}`;
}

export function formatRelativeKorean(value: string): string {
  const date = parseDate(value);
  if (!date) return '';

  const diff = Date.now() - date.getTime();
  if (diff < 0) return '';

  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 60) {
    return `${Math.max(1, minutes)}분전`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}시간전`;
  }

  const days = Math.floor(hours / 24);
  return `${days}일전`;
}
