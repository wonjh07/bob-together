export type AppointmentPersistedStatus = 'pending' | 'confirmed' | 'canceled';
export type AppointmentStatus = 'pending' | 'canceled';
export type AppointmentEffectiveStatus = AppointmentStatus | 'ended';

export function isAppointmentEndedByTime(endsAt: string): boolean {
  const endsAtTime = new Date(endsAt).getTime();
  if (Number.isNaN(endsAtTime)) {
    return false;
  }

  return endsAtTime <= Date.now();
}

export function getEffectiveAppointmentStatus(
  status: AppointmentPersistedStatus,
  endsAt: string,
): AppointmentEffectiveStatus {
  if (status === 'canceled') {
    return 'canceled';
  }

  return isAppointmentEndedByTime(endsAt) ? 'ended' : 'pending';
}
