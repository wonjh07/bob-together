import type { ActionResult, GroupErrorType } from '@/types/result';

export interface GroupSummary {
  groupId: string;
  name: string;
}

export interface GroupSearchCursor {
  name: string;
  groupId: string;
}

export interface GroupManageCursor {
  joinedAt: string;
  groupId: string;
}

export interface GroupSearchItem {
  groupId: string;
  title: string;
  name: string;
  ownerProfileImage: string | null;
  memberCount: number;
  isMember: boolean;
}

export interface GroupManageItem {
  groupId: string;
  groupName: string;
  ownerName: string | null;
  ownerNickname: string | null;
  ownerProfileImage: string | null;
  joinedAt: string;
  createdAt: string;
  memberCount: number;
  isOwner: boolean;
}

export interface GroupMemberItem {
  userId: string;
  role: 'owner' | 'member';
  name: string | null;
  nickname: string | null;
  profileImage: string | null;
}

export interface UserSummary {
  userId: string;
  name?: string | null;
  nickname?: string | null;
  profileImage?: string | null;
}

export type CreateGroupResult = ActionResult<GroupSummary, GroupErrorType>;
export type FindGroupResult = ActionResult<GroupSummary, GroupErrorType>;
export type GetGroupResult = ActionResult<GroupSummary, GroupErrorType>;
export type JoinGroupResult = ActionResult<{ groupId: string }, GroupErrorType>;
export type LeaveGroupResult = ActionResult<{ groupId: string }, GroupErrorType>;
export type SearchGroupsResult = ActionResult<
  { groups: GroupSummary[] },
  GroupErrorType
>;
export type SearchGroupsWithCountResult = ActionResult<
  { groups: GroupSearchItem[]; nextCursor: GroupSearchCursor | null },
  GroupErrorType
>;
export type GetMyGroupsResult = ActionResult<
  { groups: GroupSummary[] },
  GroupErrorType
>;
export type ListMyGroupsWithStatsResult = ActionResult<
  { groups: GroupManageItem[]; nextCursor: GroupManageCursor | null },
  GroupErrorType
>;
export type GetGroupMembersResult = ActionResult<
  { memberCount: number; members: GroupMemberItem[]; currentUserId: string },
  GroupErrorType
>;
export type SearchUsersResult = ActionResult<{ users: UserSummary[] }, GroupErrorType>;
export type SearchGroupInvitableUsersResult = ActionResult<
  { users: UserSummary[]; pendingInviteeIds: string[] },
  GroupErrorType
>;
export type SendInvitationResult = ActionResult<void, GroupErrorType>;

export const mapGroup = (group: { group_id: string; name: string }): GroupSummary => ({
  groupId: group.group_id,
  name: group.name,
});

export const mapUser = (user: {
  user_id: string;
  name?: string | null;
  nickname?: string | null;
  profile_image?: string | null;
}): UserSummary => ({
  userId: user.user_id,
  name: user.name ?? null,
  nickname: user.nickname ?? null,
  profileImage: user.profile_image ?? null,
});
