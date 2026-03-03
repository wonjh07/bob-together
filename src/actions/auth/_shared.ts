import type { ActionResult, AuthErrorCode } from '@/types/result';

export type LoginActionResult = ActionResult<void, AuthErrorCode>;
export type SignupActionResult = ActionResult<void, AuthErrorCode>;
export type LogoutActionResult = ActionResult<void, AuthErrorCode>;
export type FindEmailActionResult = ActionResult<
  { maskedEmail: string },
  AuthErrorCode | 'user-not-found'
>;
export type VerifyResetPasswordIdentityActionResult = ActionResult<
  void,
  AuthErrorCode | 'user-not-found'
>;
export type ResetPasswordByIdentityActionResult = ActionResult<
  void,
  AuthErrorCode | 'user-not-found'
>;

export type SignupParams = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};
