import type { ActionResult, GroupErrorCode } from '@/types/result';

export interface GroupSummary {
  groupId: string;
  name: string;
}

export interface GroupSearchCursor {
  name: string;
  groupId: string;
}

export interface GroupSearchItem {
  groupId: string;
  title: string;
  name: string;
  memberCount: number;
  isMember: boolean;
}

export interface UserSummary {
  userId: string;
  name?: string | null;
  nickname?: string | null;
}

export type CreateGroupResult = ActionResult<GroupSummary, GroupErrorCode>;
export type FindGroupResult = ActionResult<GroupSummary, GroupErrorCode>;
export type GetGroupResult = ActionResult<GroupSummary, GroupErrorCode>;
export type JoinGroupResult = ActionResult<{ groupId: string }, GroupErrorCode>;
export type SearchGroupsResult = ActionResult<
  { groups: GroupSummary[] },
  GroupErrorCode
>;
export type SearchGroupsWithCountResult = ActionResult<
  { groups: GroupSearchItem[]; nextCursor: GroupSearchCursor | null },
  GroupErrorCode
>;
export type GetMyGroupsResult = ActionResult<
  { groups: GroupSummary[] },
  GroupErrorCode
>;
export type SearchUsersResult = ActionResult<{ users: UserSummary[] }, GroupErrorCode>;
export type SendInvitationResult = ActionResult<void, GroupErrorCode>;

export const mapGroup = (group: { group_id: string; name: string }): GroupSummary => ({
  groupId: group.group_id,
  name: group.name,
});

export const mapUser = (user: {
  user_id: string;
  name?: string | null;
  nickname?: string | null;
}): UserSummary => ({
  userId: user.user_id,
  name: user.name ?? null,
  nickname: user.nickname ?? null,
});
