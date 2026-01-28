'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';

import { signupAction } from './actions';
import { signupPage, signupForm, title, buttonContainer } from './page.css';
import { useOnboardingLayout } from '../layout';
import {
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordMatch,
} from './utils/validation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const { setShowMoveback } = useOnboardingLayout();

  useEffect(() => {
    setShowMoveback(true);
    return () => setShowMoveback(false);
  }, [setShowMoveback]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setErrors((prev) => ({
      ...prev,
      nickname: validateNickname(value),
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: validatePasswordMatch(password, value),
    }));
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      errors.email ||
      errors.nickname ||
      errors.password ||
      errors.confirmPassword
    ) {
      alert('입력 항목을 확인해주세요.');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const result = await signupAction({
        email,
        password,
        name,
        nickname,
      });

      if (result && !result.ok) {
        setServerError(result.error || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setServerError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={signupPage}>
      <div className={title}>회원가입</div>
      <form className={signupForm} onSubmit={handleSignup}>
        <Input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={handleEmailChange}
          caption={errors.email}
          required
        />
        <Input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={handleNicknameChange}
          caption={errors.nickname}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={handlePasswordChange}
          caption={errors.password}
          required
        />
        <Input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          caption={errors.confirmPassword}
          required
        />
        {serverError && <div style={{ color: '#FF0000' }}>{serverError}</div>}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            background: '#4A90E2',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}>
          {isLoading ? '가입 중...' : '제출'}
        </button>
      </form>
      <div className={buttonContainer}>
        <p>이미 계정이 있으신가요?</p>
        <Link href="/login">로그인</Link>
      </div>
    </div>
  );
}
