import { createAppointmentAction } from './appointment';

describe('createAppointmentAction', () => {
  it('종료 시간이 시작 시간보다 이르면 invalid-time을 반환한다', async () => {
    const result = await createAppointmentAction({
      title: '점심 약속',
      date: '2026-02-02',
      startTime: '14:00',
      endTime: '13:00',
      place: {
        kakaoId: '123',
        name: '테스트 장소',
        address: '서울시',
        roadAddress: null,
        category: null,
        latitude: 37.5,
        longitude: 127.0,
      },
    });

    expect(result).toEqual({
      ok: false,
      error: 'invalid-time',
      message: '종료 시간이 시작 시간보다 늦어야 합니다.',
    });
  });
});
