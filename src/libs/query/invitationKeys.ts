import { withQueryScope, type QueryScope } from './queryScope';

export const invitationKeys = {
  all: ['invitations'] as const,
  receivedRoot: () => [...invitationKeys.all, 'received'] as const,
  received: (scope?: QueryScope) =>
    withQueryScope([...invitationKeys.receivedRoot()] as const, scope),
};
