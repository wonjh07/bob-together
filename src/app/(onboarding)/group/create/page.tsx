import { page, panel } from '../shared.css';
import { formTitle } from './page.css';
import GroupCreateForm from './GroupCreateForm';

export default function GroupCreatePage() {
  return (
    <div className={page}>
      <div className={panel}>
        <div className={formTitle}>그룹명을 입력해주세요</div>
        <GroupCreateForm />
      </div>
    </div>
  );
}
