'use client';

import CalendarEmptyIcon from '@/components/icons/CalendarEmptyIcon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { AppointmentCard } from './AppointmentCard';
import * as styles from './AppointmentListContent.css';

import type { AppointmentPage } from '@/libs/query/appointmentQueries';

interface EmptyStateBlockProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface AppointmentListContentProps {
  isLoading: boolean;
  showEmptyState: boolean;
  showList: boolean;
  appointments: AppointmentPage['appointments'];
  isFetchingNextPage: boolean;
  hasMore: boolean;
  loadMoreRef: (node: HTMLDivElement | null) => void;
}

function EmptyStateBlock({
  icon: Icon,
  title,
  description,
}: EmptyStateBlockProps) {
  return (
    <div className={styles.emptyState}>
      <Icon className={styles.emptyIcon} />
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDescription}>{description}</p>
    </div>
  );
}

function LoadingStateBlock({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div className={styles.loadingContainer}>
      <LoadingSpinner ariaLabel={ariaLabel} />
    </div>
  );
}

export default function AppointmentListContent({
  isLoading,
  showEmptyState,
  showList,
  appointments,
  isFetchingNextPage,
  hasMore,
  loadMoreRef,
}: AppointmentListContentProps) {
  if (isLoading) {
    return <LoadingStateBlock ariaLabel="약속 목록 로딩 중" />;
  }

  if (showEmptyState) {
    return (
      <EmptyStateBlock
        icon={CalendarEmptyIcon}
        title="약속이 없습니다"
        description="새로운 약속을 만들어 그룹원들과 함께해보세요!"
      />
    );
  }

  if (!showList) {
    return null;
  }

  return (
    <>
      <div className={styles.listContainer}>
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.appointmentId}
            appointment={appointment}
          />
        ))}
      </div>

      {isFetchingNextPage ? (
        <LoadingStateBlock ariaLabel="약속 목록 추가 로딩 중" />
      ) : null}

      {hasMore && !isFetchingNextPage ? (
        <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
      ) : null}
    </>
  );
}
