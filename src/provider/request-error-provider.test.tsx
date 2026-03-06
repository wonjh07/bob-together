import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useRequestErrorContext, RequestErrorProvider } from './request-error-provider';

function TestConsumer() {
  const requestError = useRequestErrorContext();

  if (!requestError) {
    throw new Error('RequestErrorProvider is required.');
  }

  return (
    <div>
      <button
        type="button"
        onClick={() =>
          requestError.openRequestError('약속 정보를 불러올 수 없습니다.', {
            errorType: 'validation',
            ownerId: 'owner-a',
          })
        }>
        open
      </button>
      <button
        type="button"
        onClick={() => {
          requestError.closeRequestError();
        }}>
        close
      </button>
      <button
        type="button"
        onClick={() => {
          requestError.closeOwnedRequestError('owner-b');
        }}>
        close-other-owner
      </button>
      <button
        type="button"
        onClick={() => {
          requestError.closeOwnedRequestError('owner-a');
        }}>
        close-owner
      </button>
    </div>
  );
}

describe('RequestErrorProvider', () => {
  it('close 이후에는 같은 에러를 즉시 다시 열 수 있다', async () => {
    const user = userEvent.setup();

    render(
      <RequestErrorProvider>
        <TestConsumer />
      </RequestErrorProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(
      screen.queryByText('약속 정보를 불러올 수 없습니다.'),
    ).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'close' }));
    expect(
      screen.queryByText('약속 정보를 불러올 수 없습니다.'),
    ).toBeNull();

    await user.click(screen.getByRole('button', { name: 'open' }));
    expect(
      screen.queryByText('약속 정보를 불러올 수 없습니다.'),
    ).not.toBeNull();
  });

  it('다른 owner는 이미 열린 모달을 닫지 못한다', async () => {
    const user = userEvent.setup();

    render(
      <RequestErrorProvider>
        <TestConsumer />
      </RequestErrorProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'open' }));
    await user.click(screen.getByRole('button', { name: 'close-other-owner' }));

    expect(
      screen.queryByText('약속 정보를 불러올 수 없습니다.'),
    ).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'close-owner' }));

    expect(
      screen.queryByText('약속 정보를 불러올 수 없습니다.'),
    ).toBeNull();
  });
});
