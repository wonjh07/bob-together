import { updateAppointmentAction } from './update';

describe('updateAppointmentAction', () => {
  it('종료 시간이 시작 시간보다 이르면 invalid-time을 반환한다', async () => {
    const result = await updateAppointmentAction({
      appointmentId: '550e8400-e29b-41d4-a716-446655440000',
      title: '수정 테스트',
      date: '2026-02-02',
      startTime: '14:00',
      endTime: '13:00',
      place: {
        placeId: '550e8400-e29b-41d4-a716-446655440001',
        name: '테스트 장소',
        address: '서울시',
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
