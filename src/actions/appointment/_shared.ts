import type { ActionResult, AppointmentErrorCode } from '@/types/result';

export type PeriodFilter = 'today' | 'week' | 'month' | 'all';
export type TypeFilter = 'all' | 'created' | 'joined';

export interface AppointmentSearchCursor {
  startAt: string;
  appointmentId: string;
}

export interface AppointmentSearchItem {
  appointmentId: string;
  title: string;
  startAt: string;
  endsAt: string;
  hostName: string | null;
  hostNickname: string | null;
  memberCount: number;
}

export interface AppointmentListItem {
  appointmentId: string;
  title: string;
  status: 'pending' | 'confirmed' | 'canceled';
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
  status: 'pending' | 'confirmed' | 'canceled';
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

export type GetAppointmentDetailResult = ActionResult<
  { appointment: AppointmentDetailItem },
  AppointmentErrorCode
>;

export type UpdateAppointmentStatusResult = ActionResult<
  { status: 'pending' | 'confirmed' | 'canceled' },
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
