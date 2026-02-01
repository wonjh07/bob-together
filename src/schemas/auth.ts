import { z } from 'zod';

/**
 * 이메일 검증 스키마
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, '이메일을 입력해주세요.')
  .toLowerCase()
  .email('올바른 이메일 형식이 아닙니다.');

/**
 * 비밀번호 검증 스키마
 * - 최소 8자
 * - 영문, 숫자, 특수문자 포함
 */
export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/[A-Z]/, '비밀번호에 영문 대문자를 포함해야 합니다.')
  .regex(/[a-z]/, '비밀번호에 영문 소문자를 포함해야 합니다.')
  .regex(/[0-9]/, '비밀번호에 숫자를 포함해야 합니다.')
  .regex(/[^A-Za-z0-9]/, '비밀번호에 특수문자를 포함해야 합니다.');

/**
 * 이름 검증 스키마
 * - 2~50자
 * - 한글, 영문, 공백만 허용
 */
export const nameSchema = z
  .string()
  .min(2, '이름은 최소 2자 이상이어야 합니다.')
  .max(50, '이름은 50자를 초과할 수 없습니다.')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문, 공백만 사용 가능합니다.')
  .trim();

/**
 * 닉네임 검증 스키마
 * - 2~20자
 * - 한글, 영문, 숫자만 허용
 */
export const nicknameSchema = z
  .string()
  .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
  .max(20, '닉네임은 20자를 초과할 수 없습니다.')
  .regex(/^[가-힣a-zA-Z0-9]+$/, '닉네임은 한글, 영문, 숫자만 사용 가능합니다.')
  .trim();

/**
 * 로그인 스키마
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

/**
 * 회원가입 스키마
 */
export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirm: z.string().min(1, '비밀번호 확인을 입력해주세요.'),
    name: nameSchema,
    nickname: nicknameSchema,
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

/**
 * 타입 추론
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
