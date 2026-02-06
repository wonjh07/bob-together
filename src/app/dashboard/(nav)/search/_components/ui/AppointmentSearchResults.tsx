import AppointmentSearchCard from './AppointmentSearchCard';
import * as styles from './AppointmentSearchResults.css';

const dummyResults = [
  {
    id: '1',
    title: '마라탕 약속',
    date: '2025.01.14',
    timeRange: '13:00-14:00',
    hostName: '원짜게',
    memberCount: 2,
  },
  {
    id: '2',
    title: '카페 모임',
    date: '2025.01.20',
    timeRange: '18:00-19:30',
    hostName: '모구',
    memberCount: 3,
  },
];

export default function AppointmentSearchResults() {
  return (
    <div className={styles.list}>
      {dummyResults.map((result) => (
        <AppointmentSearchCard key={result.id} {...result} />
      ))}
    </div>
  );
}
