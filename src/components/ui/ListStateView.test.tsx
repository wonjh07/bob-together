import { render } from '@testing-library/react';

import ListStateView from './ListStateView';

const mockUseSyncRequestError = jest.fn();

jest.mock('@/hooks/useRequestError', () => ({
  useSyncRequestError: (params: unknown) => {
    mockUseSyncRequestError(params);
  },
}));

describe('ListStateView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('modal presentation이면 presenter를 통해 에러 모달을 연다', () => {
    render(
      <ListStateView
        isLoading={false}
        isError
        isEmpty={false}
        error={{
          errorType: 'server',
          message: '목록을 불러오지 못했습니다.',
        }}
        loadingText="loading"
        emptyText="empty"
        defaultErrorText="default"
        errorPresentation="modal"
      />,
    );

    expect(mockUseSyncRequestError).toHaveBeenCalledWith(
      expect.objectContaining({
        active: true,
        error: expect.objectContaining({
          errorType: 'server',
          message: '목록을 불러오지 못했습니다.',
        }),
      }),
    );
  });

  it('modal 에러가 해제되면 presenter를 통해 모달을 닫는다', () => {
    const { rerender } = render(
      <ListStateView
        isLoading={false}
        isError
        isEmpty={false}
        error={{
          errorType: 'server',
          message: '목록을 불러오지 못했습니다.',
        }}
        loadingText="loading"
        emptyText="empty"
        defaultErrorText="default"
        errorPresentation="modal"
      />,
    );

    rerender(
      <ListStateView
        isLoading={false}
        isError={false}
        isEmpty={false}
        error={null}
        loadingText="loading"
        emptyText="empty"
        defaultErrorText="default"
        errorPresentation="modal"
      />,
    );

    expect(mockUseSyncRequestError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        active: false,
        error: null,
      }),
    );
  });
});
