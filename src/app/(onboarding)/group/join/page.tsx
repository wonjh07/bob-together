import GroupJoinClient from './GroupJoinClient';
import { page, panel } from '../shared.css';
import { formTitle } from './page.css';

export default function GroupJoinPage() {
  return (
    <div className={page}>
      <div className={panel}>
        <div className={formTitle}>그룹명을 입력해주세요</div>
        <GroupJoinClient />
      </div>
    </div>
  );
}
