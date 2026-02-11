import { updateAppointmentStatusAction } from './updateAppointmentStatusAction';

describe('updateAppointmentStatusAction', () => {
  it('약속 ID 형식이 올바르지 않으면 invalid-format을 반환한다', async () => {
    const result = await updateAppointmentStatusAction({
      appointmentId: 'invalid-id',
      status: 'confirmed',
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-format',
      message: '유효한 약속 ID가 아닙니다.',
    });
  });
});
