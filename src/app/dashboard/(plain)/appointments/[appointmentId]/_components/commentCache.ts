import type {
  AppointmentCommentItem,
  AppointmentListCursor,
  AppointmentCommentsCursor,
} from '@/actions/appointment';
import type {
  AppointmentCommentsPage,
  AppointmentPage,
} from '@/libs/query/appointmentQueries';
import type { InfiniteData } from '@tanstack/react-query';

export type AppointmentCommentsInfiniteData = InfiniteData<
  AppointmentCommentsPage,
  AppointmentCommentsCursor | null
>;

export type AppointmentListInfiniteData = InfiniteData<
  AppointmentPage,
  AppointmentListCursor | null
>;

export function appendCommentToInfiniteData(
  prev: AppointmentCommentsInfiniteData | undefined,
  nextComment: AppointmentCommentItem,
): AppointmentCommentsInfiniteData {
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
        comments: [nextComment, ...latestPage.comments],
        commentCount: latestPage.commentCount + 1,
      },
      ...restPages,
    ],
  };
}

export function replaceCommentInInfiniteData(
  prev: AppointmentCommentsInfiniteData | undefined,
  commentId: string,
  updatedComment: AppointmentCommentItem,
): AppointmentCommentsInfiniteData | undefined {
  if (!prev) {
    return prev;
  }

  let replaced = false;
  const pages = prev.pages.map((page) => ({
    ...page,
    comments: page.comments.map((comment) => {
      if (comment.commentId !== commentId) {
        return comment;
      }
      replaced = true;
      return updatedComment;
    }),
  }));

  if (!replaced) {
    return prev;
  }

  return {
    ...prev,
    pages,
  };
}

export function removeCommentFromInfiniteData(
  prev: AppointmentCommentsInfiniteData | undefined,
  commentId: string,
): {
  nextData: AppointmentCommentsInfiniteData | undefined;
  removed: boolean;
} {
  if (!prev || prev.pages.length === 0) {
    return {
      nextData: prev,
      removed: false,
    };
  }

  let removed = false;
  const pages = prev.pages.map((page) => {
    const comments = page.comments.filter((comment) => {
      if (comment.commentId !== commentId) {
        return true;
      }
      removed = true;
      return false;
    });

    return {
      ...page,
      comments,
    };
  });

  if (!removed) {
    return {
      nextData: prev,
      removed: false,
    };
  }

  const [latestPage, ...restPages] = pages;
  return {
    nextData: {
      ...prev,
      pages: [
        {
          ...latestPage,
          commentCount: Math.max(0, latestPage.commentCount - 1),
        },
        ...restPages,
      ],
    },
    removed: true,
  };
}

export function patchCommentCountInAppointmentListData(
  prev: AppointmentListInfiniteData | undefined,
  appointmentId: string,
  delta: number,
): AppointmentListInfiniteData | undefined {
  if (!prev || delta === 0) {
    return prev;
  }

  let changed = false;
  const pages = prev.pages.map((page) => {
    let pageChanged = false;
    const appointments = page.appointments.map((appointment) => {
      if (appointment.appointmentId !== appointmentId) {
        return appointment;
      }

      const nextCommentCount = Math.max(0, appointment.commentCount + delta);
      if (nextCommentCount === appointment.commentCount) {
        return appointment;
      }

      changed = true;
      pageChanged = true;
      return {
        ...appointment,
        commentCount: nextCommentCount,
      };
    });

    if (!pageChanged) {
      return page;
    }

    return {
      ...page,
      appointments,
    };
  });

  if (!changed) {
    return prev;
  }

  return {
    ...prev,
    pages,
  };
}
