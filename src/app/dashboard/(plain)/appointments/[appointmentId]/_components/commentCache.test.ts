import {
  appendCommentToInfiniteData,
  removeCommentFromInfiniteData,
  replaceCommentInInfiniteData,
} from './commentCache';

import type {
  AppointmentCommentItem,
  AppointmentCommentsCursor,
} from '@/actions/appointment';
import type { AppointmentCommentsPage } from '@/libs/query/appointmentQueries';
import type { InfiniteData } from '@tanstack/react-query';

type AppointmentCommentsInfiniteData = InfiniteData<
  AppointmentCommentsPage,
  AppointmentCommentsCursor | null
>;

function createComment(overrides: Partial<AppointmentCommentItem> = {}): AppointmentCommentItem {
  return {
    commentId: 'comment-1',
    content: '기본 댓글',
    createdAt: '2026-03-02T12:00:00.000Z',
    userId: 'user-1',
    name: '홍길동',
    nickname: '길동',
    profileImage: null,
    ...overrides,
  };
}

function createData(
  pages: AppointmentCommentsPage[],
): AppointmentCommentsInfiniteData {
  return {
    pages,
    pageParams: Array.from({ length: pages.length }, () => null),
  };
}

describe('commentCache', () => {
  it('append: prev가 없으면 단일 페이지 데이터로 생성한다', () => {
    const comment = createComment();

    const next = appendCommentToInfiniteData(undefined, comment);

    expect(next.pages).toHaveLength(1);
    expect(next.pages[0]).toEqual({
      comments: [comment],
      commentCount: 1,
      nextCursor: null,
      currentUserId: comment.userId,
    });
  });

  it('append: 최신순 유지를 위해 기존 첫 페이지 앞에 댓글을 추가하고 count를 증가시킨다', () => {
    const existing = createComment({ commentId: 'comment-0', content: '이전 댓글' });
    const appended = createComment({ commentId: 'comment-1', content: '새 댓글' });
    const prev = createData([
      {
        comments: [existing],
        commentCount: 1,
        nextCursor: null,
        currentUserId: existing.userId,
      },
    ]);

    const next = appendCommentToInfiniteData(prev, appended);

    expect(next.pages[0].comments).toEqual([appended, existing]);
    expect(next.pages[0].commentCount).toBe(2);
  });

  it('replace: 대상 commentId만 교체한다', () => {
    const target = createComment({ commentId: 'comment-1', content: '원본' });
    const other = createComment({ commentId: 'comment-2', content: '다른 댓글' });
    const updated = createComment({ commentId: 'comment-1', content: '수정됨' });
    const prev = createData([
      {
        comments: [target, other],
        commentCount: 2,
        nextCursor: null,
        currentUserId: target.userId,
      },
    ]);

    const next = replaceCommentInInfiniteData(prev, target.commentId, updated);

    expect(next?.pages[0].comments).toEqual([updated, other]);
  });

  it('replace: 대상이 없으면 기존 참조를 유지한다', () => {
    const prev = createData([
      {
        comments: [createComment({ commentId: 'comment-1' })],
        commentCount: 1,
        nextCursor: null,
        currentUserId: 'user-1',
      },
    ]);

    const next = replaceCommentInInfiniteData(
      prev,
      'missing-comment',
      createComment({ commentId: 'missing-comment', content: '수정됨' }),
    );

    expect(next).toBe(prev);
  });

  it('remove: 삭제 성공 시 댓글 제거 + 첫 페이지 count 감소', () => {
    const keep = createComment({ commentId: 'comment-1' });
    const remove = createComment({ commentId: 'comment-2' });
    const prev = createData([
      {
        comments: [keep, remove],
        commentCount: 2,
        nextCursor: null,
        currentUserId: 'user-1',
      },
      {
        comments: [createComment({ commentId: 'comment-3' })],
        commentCount: 2,
        nextCursor: null,
        currentUserId: 'user-1',
      },
    ]);

    const result = removeCommentFromInfiniteData(prev, remove.commentId);

    expect(result.removed).toBe(true);
    expect(result.nextData?.pages[0].comments).toEqual([keep]);
    expect(result.nextData?.pages[0].commentCount).toBe(1);
  });

  it('remove: 대상이 없으면 removed=false와 기존 참조를 반환한다', () => {
    const prev = createData([
      {
        comments: [createComment({ commentId: 'comment-1' })],
        commentCount: 1,
        nextCursor: null,
        currentUserId: 'user-1',
      },
    ]);

    const result = removeCommentFromInfiniteData(prev, 'missing-comment');

    expect(result.removed).toBe(false);
    expect(result.nextData).toBe(prev);
  });
});
