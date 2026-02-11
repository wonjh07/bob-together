export const mockUser = { id: 'user-1' };

export const createQueryMock = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  or: jest.fn().mockReturnThis(),
  neq: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  maybeSingle: jest.fn(),
  single: jest.fn(),
});

export const resetAllMocks = () => {
  jest.clearAllMocks();
};
