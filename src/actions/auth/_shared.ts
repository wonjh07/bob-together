import type { ActionResult, AuthErrorType } from '@/types/result';

export type LoginActionResult = ActionResult<void, AuthErrorType>;
export type SignupActionResult = ActionResult<void, AuthErrorType>;
export type LogoutActionResult = ActionResult<void, AuthErrorType>;
export type FindEmailActionResult = ActionResult<
  { maskedEmail: string },
  AuthErrorType
>;
export type VerifyResetPasswordIdentityActionResult = ActionResult<
  void,
  AuthErrorType
>;
export type ResetPasswordByIdentityActionResult = ActionResult<
  void,
  AuthErrorType
>;

export type SignupParams = {
  email: string;
  password: string;
  name: string;
  nickname: string;
};
