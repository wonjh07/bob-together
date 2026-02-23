import type { ActionResult, AppointmentErrorCode } from '@/types/result';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';
export type TypeFilter = 'all' | 'created' | 'joined';

export interface AppointmentSearchCursor {
  startAt: string;
  appointmentId: string;
}

export interface AppointmentHistoryCursor {
  offset: number;
}

export interface MyReviewCursor {
  offset: number;
}

export interface ReviewableAppointmentsCursor {
  offset: number;
}

export interface MyCommentCursor {
  offset: number;
}

export interface AppointmentSearchItem {
  appointmentId: string;
  title: string;
  startAt: string;
  endsAt: string;
  hostName: string | null;
  hostNickname: string | null;
  hostProfileImage: string | null;
  memberCount: number;
}

export interface AppointmentHistoryItem {
  appointmentId: string;
  title: string;
  startAt: string;
  endsAt: string;
  creatorId: string;
  creatorName: string | null;
  creatorNickname: string | null;
  creatorProfileImage: string | null;
  place: {
    placeId: string;
    name: string;
    address: string;
    category: string | null;
    reviewAverage: number | null;
    reviewCount: number;
  };
  memberCount: number;
  isOwner: boolean;
  canWriteReview: boolean;
}

export interface ReviewableAppointmentItem {
  appointmentId: string;
  title: string;
  startAt: string;
  endsAt: string;
  placeId: string;
  placeName: string;
  reviewAverage: number | null;
  reviewCount: number;
}

export interface AppointmentReviewTargetItem {
  appointmentId: string;
  title: string;
  startAt: string;
  endsAt: string;
  place: {
    placeId: string;
    name: string;
    address: string;
    category: string | null;
    reviewAverage: number | null;
    reviewCount: number;
  };
  myReview: {
    score: number | null;
    content: string | null;
  } | null;
  hasReviewed: boolean;
  canWriteReview: boolean;
}

export interface MyReviewItem {
  appointmentId: string;
  placeId: string;
  placeName: string;
  score: number;
  content: string;
  editedAt: string;
}

export interface MyCommentItem {
  commentId: string;
  appointmentId: string;
  appointmentTitle: string;
  content: string;
  createdAt: string;
}

export interface AppointmentListItem {
  appointmentId: string;
  title: string;
  status: 'pending' | 'canceled';
  startAt: string;
  endsAt: string;
  creatorId: string;
  creatorName: string | null;
  creatorNickname: string | null;
  place: {
    placeId: string;
    name: string;
    address: string;
    category: string | null;
  };
  memberCount: number;
  commentCount: number;
  isOwner: boolean;
  isMember: boolean;
}

export interface AppointmentDetailItem {
  appointmentId: string;
  title: string;
  status: 'pending' | 'canceled';
  startAt: string;
  endsAt: string;
  createdAt: string;
  creatorId: string;
  creatorName: string | null;
  creatorNickname: string | null;
  creatorProfileImage: string | null;
  place: {
    placeId: string;
    name: string;
    address: string;
    category: string | null;
    latitude: number;
    longitude: number;
    reviewAverage: number | null;
    reviewCount: number;
  };
  memberCount: number;
  isOwner: boolean;
  isMember: boolean;
}

export interface AppointmentMemberItem {
  userId: string;
  name: string | null;
  nickname: string | null;
  profileImage: string | null;
  role: 'owner' | 'member';
}

export interface AppointmentCommentItem {
  commentId: string;
  content: string;
  createdAt: string;
  userId: string;
  name: string | null;
  nickname: string | null;
  profileImage: string | null;
}

export interface ListAppointmentsParams {
  groupId: string;
  period?: PeriodFilter;
  type?: TypeFilter;
  cursor?: string;
  limit?: number;
}

export type ListAppointmentsResult = ActionResult<
  {
    appointments: AppointmentListItem[];
    nextCursor: string | null;
  },
  AppointmentErrorCode
>;

export type CreateAppointmentResult = ActionResult<
  { appointmentId: string },
  AppointmentErrorCode
>;

export type SendAppointmentInvitationResult = ActionResult<
  void,
  AppointmentErrorCode
>;

export type SearchAppointmentsResult = ActionResult<
  {
    appointments: AppointmentSearchItem[];
    nextCursor: AppointmentSearchCursor | null;
  },
  AppointmentErrorCode
>;

export type ListAppointmentHistoryResult = ActionResult<
  {
    appointments: AppointmentHistoryItem[];
    nextCursor: AppointmentHistoryCursor | null;
  },
  AppointmentErrorCode
>;

export type GetAppointmentDetailResult = ActionResult<
  { appointment: AppointmentDetailItem },
  AppointmentErrorCode
>;

export type UpdateAppointmentStatusResult = ActionResult<
  { status: 'pending' | 'canceled' },
  AppointmentErrorCode
>;

export type UpdateAppointmentResult = ActionResult<
  { appointmentId: string },
  AppointmentErrorCode
>;

export type JoinAppointmentResult = ActionResult<void, AppointmentErrorCode>;
export type LeaveAppointmentResult = ActionResult<void, AppointmentErrorCode>;

export type GetAppointmentMembersResult = ActionResult<
  {
    memberCount: number;
    members: AppointmentMemberItem[];
    currentUserId: string;
  },
  AppointmentErrorCode
>;

export type GetAppointmentInvitationStateResult = ActionResult<
  {
    memberIds: string[];
    pendingInviteeIds: string[];
  },
  AppointmentErrorCode
>;

export type GetAppointmentCommentsResult = ActionResult<
  {
    commentCount: number;
    comments: AppointmentCommentItem[];
    currentUserId: string;
  },
  AppointmentErrorCode
>;

export type CreateAppointmentCommentResult = ActionResult<
  {
    comment: AppointmentCommentItem;
  },
  AppointmentErrorCode
>;

export type UpdateAppointmentCommentResult = ActionResult<
  {
    comment: AppointmentCommentItem;
  },
  AppointmentErrorCode
>;

export type DeleteAppointmentCommentResult = ActionResult<
  {
    commentId: string;
  },
  AppointmentErrorCode
>;

export type ListReviewableAppointmentsResult = ActionResult<
  {
    appointments: ReviewableAppointmentItem[];
    nextCursor: ReviewableAppointmentsCursor | null;
  },
  AppointmentErrorCode
>;

export type GetAppointmentReviewTargetResult = ActionResult<
  {
    target: AppointmentReviewTargetItem;
  },
  AppointmentErrorCode
>;

export type SubmitPlaceReviewResult = ActionResult<
  {
    appointmentId: string;
    placeId: string;
    score: number;
    content: string;
    mode: 'created' | 'updated';
  },
  AppointmentErrorCode
>;

export type ListMyReviewsResult = ActionResult<
  {
    reviews: MyReviewItem[];
    nextCursor: MyReviewCursor | null;
  },
  AppointmentErrorCode
>;

export type ListMyCommentsResult = ActionResult<
  {
    comments: MyCommentItem[];
    nextCursor: MyCommentCursor | null;
  },
  AppointmentErrorCode
>;

export type DeleteMyReviewResult = ActionResult<
  {
    appointmentId: string;
  },
  AppointmentErrorCode
>;
