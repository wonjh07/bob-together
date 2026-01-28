// 이메일 유효성 검사
export const validateEmail = (value: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!value) return '';
  if (!emailRegex.test(value)) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  return '';
};

// 닉네임 유효성 검사
export const validateNickname = (value: string): string => {
  if (!value) return '';
  if (value.length < 2) {
    return '닉네임은 최소 2자 이상이어야 합니다.';
  }
  if (value.length > 20) {
    return '닉네임은 최대 20자까지 입력 가능합니다.';
  }
  return '';
};

// 비밀번호 유효성 검사
export const validatePassword = (value: string): string => {
  if (!value) return '';
  if (value.length < 8) {
    return '비밀번호는 최소 8자 이상이어야 합니다.';
  }
  if (!/[a-z]/.test(value) || !/[0-9]/.test(value)) {
    return '비밀번호는 영문자와 숫자를 포함해야 합니다.';
  }
  return '';
};

// 비밀번호 일치 검사
export const validatePasswordMatch = (
  password: string,
  confirmPassword: string,
): string => {
  if (confirmPassword && confirmPassword !== password) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return '';
};
