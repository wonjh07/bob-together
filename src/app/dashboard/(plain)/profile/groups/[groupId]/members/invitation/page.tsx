import GroupMemberInvitationClient from './GroupMemberInvitationClient';

type GroupMemberInvitationPageProps = {
  params: {
    groupId: string;
  };
};

export default function GroupMemberInvitationPage({
  params,
}: GroupMemberInvitationPageProps) {
  return <GroupMemberInvitationClient groupId={params.groupId} />;
}
