'use server';

import { getUserData } from '@/actions/user';

import { dashboardContainer, userInfo, loadingContainer } from './page.css';

export default async function DashboardPage() {
  const result = await getUserData();

  if (!result.ok || !result.data) {
    return (
      <div className={loadingContainer}>
        오류:{' '}
        {!result.ok
          ? result.message || '알 수 없는 오류'
          : '사용자 정보를 가져올 수 없습니다'}
      </div>
    );
  }

  const user = result.data;

  return (
    <div className={dashboardContainer}>
      <div className={userInfo}>
        <h1>대시보드</h1>
        <div>
          <p>
            <strong>이메일:</strong> {user.email}
          </p>
          {user.name && (
            <p>
              <strong>이름:</strong> {user.name}
            </p>
          )}
          {user.nickname && (
            <p>
              <strong>닉네임:</strong> {user.nickname}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
