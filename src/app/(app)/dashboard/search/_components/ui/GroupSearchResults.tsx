import GroupSearchCard from './GroupSearchCard';
import { list } from './GroupSearchResults.css';

const dummyGroups = [
  {
    id: '1',
    title: '마라탕 모임',
    name: '원짜게',
    memberCount: 17,
    isMember: true,
  },
  {
    id: '2',
    title: '주말 번개',
    name: '원짜게아님',
    memberCount: 2,
    isMember: false,
  },
];

export default function GroupSearchResults() {
  return (
    <div className={list}>
      {dummyGroups.map((group) => (
        <GroupSearchCard key={group.id} {...group} />
      ))}
    </div>
  );
}
