'use server';

import { getUserData } from './actions';
import { dashboardContainer, userInfo, loadingContainer } from './page.css';

export default async function DashboardPage() {
  const { user, error } = await getUserData();

  if (error || !user) {
    return <div className={loadingContainer}>오류: {error}</div>;
  }

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
