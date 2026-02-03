import { getGroupByIdAction } from '@/actions/group';
import GroupIcon from '@/components/icons/GroupIcon';

import GroupJoinConfirmClient from './GroupJoinConfirmClient';
import { groupName, message } from './page.css';
import {
  page,
  panel,
  iconWrap,
  buttonStack,
  helperText,
} from '../../shared.css';

type GroupJoinConfirmPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function GroupJoinConfirmPage({
  searchParams,
}: GroupJoinConfirmPageProps) {
  const groupId =
    typeof searchParams?.groupId === 'string' ? searchParams.groupId : '';
  const initialName =
    typeof searchParams?.groupName === 'string' ? searchParams.groupName : '';

  let resolvedName = initialName;
  let serverErrorMessage = '';

  if (groupId && !resolvedName) {
    const result = await getGroupByIdAction(groupId);
    if (!result.ok) {
      serverErrorMessage = result.message || '그룹 정보를 불러올 수 없습니다.';
    } else if (!result.data) {
      serverErrorMessage = '그룹 정보를 확인할 수 없습니다.';
    } else {
      resolvedName = result.data.name;
    }
  }

  return (
    <div className={page}>
      <div className={panel}>
        <div className={iconWrap}>
          <GroupIcon />
        </div>
        <div className={groupName}>{resolvedName || '그룹'}</div>
        <div className={message}>그룹에 가입하시겠습니까?</div>
        <div className={buttonStack}>
          <GroupJoinConfirmClient groupId={groupId} groupName={resolvedName} />
        </div>
        <div className={helperText}>{serverErrorMessage}</div>
      </div>
    </div>
  );
}
