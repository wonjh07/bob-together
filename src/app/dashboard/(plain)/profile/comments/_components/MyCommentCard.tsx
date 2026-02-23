'use client';

import CalendarIcon from '@/components/icons/CalendarIcon';
import IconLabel from '@/components/ui/IconLabel';
import OverflowMenu from '@/components/ui/OverflowMenu';
import { formatDateDot } from '@/utils/dateFormat';

import * as styles from './MyCommentCard.css';

import type { MyCommentItem } from '@/actions/appointment';

interface MyCommentCardProps {
  comment: MyCommentItem;
  isMenuOpen: boolean;
  isDeleting: boolean;
  onToggleMenu: (commentId: string) => void;
  onCloseMenu: () => void;
  onDeleteComment: (appointmentId: string, commentId: string) => void;
}

export default function MyCommentCard({
  comment,
  isMenuOpen,
  isDeleting,
  onToggleMenu,
  onCloseMenu,
  onDeleteComment,
}: MyCommentCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.headerRow}>
        <IconLabel
          className={styles.titleRow}
          icon={<CalendarIcon className={styles.calendarIcon} />}>
          <h2 className={styles.title}>{comment.appointmentTitle}</h2>
        </IconLabel>

        <OverflowMenu
          isOpen={isMenuOpen}
          isDisabled={isDeleting}
          ariaLabel="댓글 메뉴"
          onToggle={() => onToggleMenu(comment.commentId)}
          onClose={onCloseMenu}
          items={[
            {
              key: 'detail',
              label: '약속 상세 보기',
              href: `/dashboard/appointments/${comment.appointmentId}`,
            },
            {
              key: 'delete',
              label: '댓글 삭제',
              danger: true,
              onClick: () =>
                onDeleteComment(comment.appointmentId, comment.commentId),
            },
          ]}
        />
      </div>

      <p className={styles.content}>{comment.content}</p>
      <p className={styles.date}>{formatDateDot(comment.createdAt)}</p>
    </article>
  );
}
