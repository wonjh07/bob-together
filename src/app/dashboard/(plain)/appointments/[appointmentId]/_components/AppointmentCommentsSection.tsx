'use client';

import CommentIcon from '@/components/icons/CommentIcon';
import ListStateView from '@/components/ui/ListStateView';

import AppointmentCommentComposer from './AppointmentCommentComposer';
import AppointmentCommentListItem from './AppointmentCommentItem';
import * as styles from './AppointmentCommentsSection.css';
import useAppointmentCommentsController from './useAppointmentCommentsController';

interface AppointmentCommentsSectionProps {
  appointmentId: string;
}

export default function AppointmentCommentsSection({
  appointmentId,
}: AppointmentCommentsSectionProps) {
  const {
    commentsQuery,
    comments,
    commentCount,
    currentUserId,
    hasMore,
    isLoadingMore,
    loadMoreRef,
    content,
    errorMessage,
    isCreating,
    isCommentBusy,
    setContent,
    submitComment,
    updateComment,
    deleteComment,
  } = useAppointmentCommentsController({ appointmentId });

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span>댓글</span>
        <CommentIcon className={styles.commentIcon} />
        <span className={styles.count}>{commentCount}</span>
      </div>

      <AppointmentCommentComposer
        content={content}
        errorMessage={errorMessage}
        isSubmitting={isCreating}
        onChange={setContent}
        onSubmit={submitComment}
      />

      {commentsQuery.isLoading || commentsQuery.isError || comments.length === 0 ? (
        <ListStateView
          isLoading={commentsQuery.isLoading}
          isError={commentsQuery.isError}
          isEmpty={!commentsQuery.isLoading && !commentsQuery.isError}
          error={commentsQuery.error}
          errorPresentation="modal"
          loadingVariant="spinner"
          loadingText="댓글을 불러오는 중..."
          emptyText="아직 댓글이 없습니다."
          defaultErrorText="댓글을 불러오지 못했습니다."
          className={styles.empty}
        />
      ) : (
        <div className={styles.list}>
          {comments.map((comment) => (
            <AppointmentCommentListItem
              key={comment.commentId}
              comment={comment}
              currentUserId={currentUserId}
              isBusy={isCommentBusy(comment.commentId)}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
          ))}
          {isLoadingMore ? (
            <div className={styles.loadMoreStatus}>불러오는 중...</div>
          ) : null}
          {hasMore && !isLoadingMore ? (
            <div ref={loadMoreRef} className={styles.loadMoreTrigger} />
          ) : null}
        </div>
      )}
    </div>
  );
}
