export const invitationKeys = {
  all: ['invitations'] as const,
  receivedRoot: () => [...invitationKeys.all, 'received'] as const,
  received: () => [...invitationKeys.receivedRoot()] as const,
};
