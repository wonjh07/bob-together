import { resolveLoginRedirectPath } from './redirect';

describe('resolveLoginRedirectPath', () => {
  it('redirect 파라미터가 없으면 /dashboard를 반환한다', () => {
    expect(resolveLoginRedirectPath(null)).toBe('/dashboard');
  });

  it('상대 경로 redirect를 그대로 반환한다', () => {
    expect(resolveLoginRedirectPath('/dashboard/appointments/abc')).toBe(
      '/dashboard/appointments/abc',
    );
  });

  it('외부 URL은 /dashboard로 대체한다', () => {
    expect(resolveLoginRedirectPath('https://example.com')).toBe('/dashboard');
    expect(resolveLoginRedirectPath('javascript:alert(1)')).toBe('/dashboard');
  });

  it('protocol-relative 경로는 /dashboard로 대체한다', () => {
    expect(resolveLoginRedirectPath('//evil.com/path')).toBe('/dashboard');
  });
});
