'use client';

import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';
import Image from 'next/image';
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import toast from 'react-hot-toast';

import {
  createAppointmentCommentAction,
  deleteAppointmentCommentAction,
  updateAppointmentCommentAction,
  type AppointmentCommentItem,
  type AppointmentCommentsCursor,
} from '@/actions/appointment';
import CommentIcon from '@/components/icons/CommentIcon';
import PaperPlaneIcon from '@/components/icons/PaperPlaneIcon';
import OverflowMenu from '@/components/ui/OverflowMenu';
import {
  createAppointmentCommentsQueryOptions,
  type AppointmentCommentsPage,
} from '@/libs/query/appointmentQueries';
import {
  invalidateAppointmentListQueries,
  invalidateMyCommentsQueries,
} from '@/libs/query/invalidateAppointmentQueries';
import { useQueryScope } from '@/provider/query-scope-provider';
import { formatRelativeKorean } from '@/utils/dateFormat';

import * as styles from './AppointmentCommentsSection.css';

interface AppointmentCommentsSectionProps {
  appointmentId: string;
}

type AppointmentCommentsInfiniteData = InfiniteData<
  AppointmentCommentsPage,
  AppointmentCommentsCursor | null
>;

export default function AppointmentCommentsSection({
  appointmentId,
}: AppointmentCommentsSectionProps) {
  const queryClient = useQueryClient();
  const queryScope = useQueryScope();
  const queryOptions = createAppointmentCommentsQueryOptions(
    appointmentId,
    queryScope,
  );
  const commentsQuery = useInfiniteQuery(queryOptions);
  const pages = commentsQuery.data?.pages ?? [];
  const comments = pages
    .slice()
    .reverse()
    .flatMap((page) => page.comments);
  const commentCount = pages[0]?.commentCount ?? comments.length;
  const currentUserId = pages[0]?.currentUserId ?? null;
  const hasMore = commentsQuery.hasNextPage ?? false;
  const isLoadingMore = commentsQuery.isFetchingNextPage;
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openedMenuId, setOpenedMenuId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const element = textareaRef.current;
    if (!element) return;

    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [content]);

  useEffect(() => {
    const element = editTextareaRef.current;
    if (!element) return;

    element.style.height = '0px';
    element.style.height = `${element.scrollHeight}px`;
  }, [editingContent]);

  const submitComment = async () => {
    if (isSubmitting) return;

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMessage('댓글을 입력해주세요.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    const result = await createAppointmentCommentAction({
      appointmentId,
      content: trimmed,
    });

    setIsSubmitting(false);

    if (!result.ok || !result.data) {
      const message = !result.ok
        ? result.message || '댓글 작성에 실패했습니다.'
        : '댓글 작성에 실패했습니다.';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    const nextComment = result.data.comment;
    queryClient.setQueryData<AppointmentCommentsInfiniteData>(
      queryOptions.queryKey,
      (prev) => {
        if (!prev || prev.pages.length === 0) {
          return {
            pages: [
              {
                comments: [nextComment],
                commentCount: 1,
                nextCursor: null,
                currentUserId: nextComment.userId,
              },
            ],
            pageParams: [null],
          };
        }

        const [latestPage, ...restPages] = prev.pages;
        return {
          ...prev,
          pages: [
            {
              ...latestPage,
              comments: [...latestPage.comments, nextComment],
              commentCount: latestPage.commentCount + 1,
            },
            ...restPages,
          ],
        };
      },
    );
    await Promise.all([
      invalidateAppointmentListQueries(queryClient),
      invalidateMyCommentsQueries(queryClient),
    ]);
    setContent('');
    toast.success('댓글이 등록되었습니다.');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitComment();
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const toggleMenu = (commentId: string) => {
    setOpenedMenuId((prev) => (prev === commentId ? null : commentId));
  };

  const startEdit = (comment: AppointmentCommentItem) => {
    setOpenedMenuId(null);
    setEditingCommentId(comment.commentId);
    setEditingContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };

  const submitEdit = async () => {
    if (!editingCommentId || isEditSubmitting || isDeleteSubmitting) return;

    const trimmed = editingContent.trim();
    if (!trimmed) {
      toast.error('댓글을 입력해주세요.');
      return;
    }

    setIsEditSubmitting(true);
    const result = await updateAppointmentCommentAction({
      appointmentId,
      commentId: editingCommentId,
      content: trimmed,
    });
    setIsEditSubmitting(false);

    if (!result.ok || !result.data) {
      const message = !result.ok
        ? result.message || '댓글 수정에 실패했습니다.'
        : '댓글 수정에 실패했습니다.';
      toast.error(message);
      return;
    }

    const updatedComment = result.data.comment;
    queryClient.setQueryData<AppointmentCommentsInfiniteData>(
      queryOptions.queryKey,
      (prev) => {
        if (!prev) {
          return prev;
        }

        return {
          ...prev,
          pages: prev.pages.map((page) => ({
            ...page,
            comments: page.comments.map((comment) =>
              comment.commentId === editingCommentId ? updatedComment : comment,
            ),
          })),
        };
      },
    );
    await invalidateMyCommentsQueries(queryClient);
    setEditingCommentId(null);
    setEditingContent('');
    toast.success('댓글이 수정되었습니다.');
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitEdit();
  };

  const handleEditInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    if (event.nativeEvent.isComposing) return;

    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const handleDelete = async (commentId: string) => {
    if (isDeleteSubmitting || isEditSubmitting || isSubmitting) return;

    setOpenedMenuId(null);
    setIsDeleteSubmitting(true);

    const result = await deleteAppointmentCommentAction({
      appointmentId,
      commentId,
    });

    setIsDeleteSubmitting(false);

    if (!result.ok || !result.data) {
      const message = !result.ok
        ? result.message || '댓글 삭제에 실패했습니다.'
        : '댓글 삭제에 실패했습니다.';
      toast.error(message);
      return;
    }

    const deletedCommentId = result.data.commentId;
    queryClient.setQueryData<AppointmentCommentsInfiniteData>(
      queryOptions.queryKey,
      (prev) => {
        if (!prev || prev.pages.length === 0) {
          return prev;
        }

        let removed = false;
        const nextPages = prev.pages.map((page) => {
          const nextComments = page.comments.filter((comment) => {
            if (comment.commentId === deletedCommentId) {
              removed = true;
              return false;
            }
            return true;
          });

          return {
            ...page,
            comments: nextComments,
          };
        });

        if (!removed) {
          return prev;
        }

        const [latestPage, ...restPages] = nextPages;
        return {
          ...prev,
          pages: [
            {
              ...latestPage,
              commentCount: Math.max(0, latestPage.commentCount - 1),
            },
            ...restPages,
          ],
        };
      },
    );
    await Promise.all([
      invalidateAppointmentListQueries(queryClient),
      invalidateMyCommentsQueries(queryClient),
    ]);
    if (editingCommentId === deletedCommentId) {
      cancelEdit();
    }
    toast.success('댓글이 삭제되었습니다.');
  };

  const handleLoadOlderComments = async () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    await commentsQuery.fetchNextPage();
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <span>댓글</span>
        <CommentIcon className={styles.commentIcon} />
        <span className={styles.count}>{commentCount}</span>
      </div>

      <form className={styles.inputWrap} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleInputKeyDown}
          className={styles.input}
          placeholder="댓글을 입력해주세요"
          maxLength={200}
          rows={1}
        />
        <button
          type="submit"
          className={styles.submitButton}
          aria-label="댓글 등록"
          disabled={isSubmitting}>
          <PaperPlaneIcon className={styles.planeIcon} />
        </button>
      </form>

      <p className={styles.helperText}>{errorMessage}</p>

      {comments.length > 0 ? (
        <div className={styles.list}>
          {hasMore ? (
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={handleLoadOlderComments}
              disabled={isLoadingMore}>
              {isLoadingMore ? '불러오는 중...' : '이전 댓글 더보기'}
            </button>
          ) : null}
          {comments.map((comment) => {
            const displayName = comment.nickname || comment.name || '알 수 없음';
            const meta = [comment.name, formatRelativeKorean(comment.createdAt)]
              .filter(Boolean)
              .join(' · ');

            return (
              <div key={comment.commentId} className={styles.card}>
                <div className={styles.cardLeft}>
                  <Image
                    src={comment.profileImage || '/profileImage.png'}
                    alt="댓글 작성자 프로필 이미지"
                    width={56}
                    height={56}
                    className={styles.avatar}
                  />
                  <div className={styles.cardBody}>
                    <p className={styles.nickname}>{displayName}</p>
                    <p className={styles.meta}>{meta}</p>
                    {editingCommentId === comment.commentId ? (
                      <form
                        className={styles.editForm}
                        onSubmit={handleEditSubmit}>
                        <div className={styles.editInputWrap}>
                          <textarea
                            ref={editTextareaRef}
                            value={editingContent}
                            onChange={(event) =>
                              setEditingContent(event.target.value)
                            }
                            onKeyDown={handleEditInputKeyDown}
                            className={styles.input}
                            placeholder="댓글을 입력해주세요"
                            maxLength={200}
                            rows={1}
                          />
                        </div>
                        <div className={styles.editActions}>
                          <button
                            type="button"
                            className={styles.editCancelButton}
                            onClick={cancelEdit}
                            disabled={isEditSubmitting}>
                            취소
                          </button>
                          <button
                            type="submit"
                            className={styles.editSubmitButton}
                            disabled={isEditSubmitting}>
                            수정
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className={styles.content}>{comment.content}</p>
                    )}
                  </div>
                </div>
                {comment.userId === currentUserId ? (
                  <OverflowMenu
                    isOpen={openedMenuId === comment.commentId}
                    isDisabled={isDeleteSubmitting || isEditSubmitting}
                    ariaLabel="댓글 메뉴"
                    onToggle={() => toggleMenu(comment.commentId)}
                    onClose={() => setOpenedMenuId(null)}
                    items={[
                      {
                        key: 'edit',
                        label: '댓글 수정',
                        onClick: () => startEdit(comment),
                      },
                      {
                        key: 'delete',
                        label: '댓글 삭제',
                        danger: true,
                        onClick: () => handleDelete(comment.commentId),
                      },
                    ]}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.empty}>아직 댓글이 없습니다.</p>
      )}
    </div>
  );
}
