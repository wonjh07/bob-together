import type { ServiceErrorCode } from '@/actions/_common/service-action';
import type { ActionResult } from '@/types/result';

export interface InvitationCursor {
  createdTime: string;
  invitationId: string;
}

export interface InvitationListItem {
  invitationId: string;
  type: 'group' | 'appointment';
  status: 'pending' | 'accepted' | 'rejected' | 'canceled';
  createdTime: string;
  inviterId: string;
  inviterName: string | null;
  inviterNickname: string | null;
  inviterProfileImage: string | null;
  groupId: string;
  groupName: string | null;
  appointmentId: string | null;
  appointmentTitle: string | null;
  appointmentEndsAt: string | null;
}

export type InvitationErrorCode = ServiceErrorCode;

export type ListReceivedInvitationsResult = ActionResult<
  {
    invitations: InvitationListItem[];
    nextCursor: InvitationCursor | null;
  },
  InvitationErrorCode
>;

export type InvitationIndicatorResult = ActionResult<
  {
    hasUnreadInvitations: boolean;
  },
  InvitationErrorCode
>;

export type MarkInvitationIndicatorSeenResult = ActionResult<void, InvitationErrorCode>;

export type RespondToInvitationResult = ActionResult<
  {
    invitationId: string;
    status: 'accepted' | 'rejected';
    type: 'group' | 'appointment';
    groupId: string;
    appointmentId: string | null;
  },
  InvitationErrorCode
>;
