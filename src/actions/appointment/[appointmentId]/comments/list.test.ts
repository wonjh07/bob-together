import { getAppointmentCommentsAction } from './list';

describe('getAppointmentCommentsAction', () => {
  it('잘못된 약속 ID 형식이면 invalid-format을 반환한다', async () => {
    const result = await getAppointmentCommentsAction('not-uuid');

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });
});
