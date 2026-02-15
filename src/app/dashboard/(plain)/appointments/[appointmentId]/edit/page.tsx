import { redirect } from 'next/navigation';

import { getAppointmentDetailAction } from '@/actions/appointment';

import AppointmentEditTopNav from './_components/AppointmentEditTopNav';
import AppointmentEditClient from './AppointmentEditClient';
import * as styles from './page.css';

type AppointmentEditPageProps = {
  params: {
    appointmentId: string;
  };
  searchParams?: Record<string, string | string[] | undefined>;
};

function toDateInputValue(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toTimeInputValue(isoString: string): string {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function isDateInput(value: string | null): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isTimeInput(value: string | null): value is string {
  return Boolean(value && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function pickParam(
  searchParams: Record<string, string | string[] | undefined> | undefined,
  key: string,
): string | null {
  const value = searchParams?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export default async function AppointmentEditPage({
  params,
  searchParams,
}: AppointmentEditPageProps) {
  const appointmentId = params.appointmentId;
  const result = await getAppointmentDetailAction(appointmentId);

  if (!result.ok || !result.data) {
    return (
      <div className={styles.page}>
        <AppointmentEditTopNav />
        <div className={styles.errorBox}>
          {result.ok
            ? '약속 정보를 불러올 수 없습니다.'
            : result.message || '약속 정보를 불러올 수 없습니다.'}
        </div>
      </div>
    );
  }

  const appointment = result.data.appointment;
  if (!appointment.isOwner) {
    redirect(`/dashboard/appointments/${appointmentId}`);
  }

  const queryPlaceName = pickParam(searchParams, 'placeName');
  const queryPlaceAddress = pickParam(searchParams, 'placeAddress');
  const queryPlaceCategory = pickParam(searchParams, 'placeCategory');
  const queryPlaceLatitude = pickParam(searchParams, 'placeLatitude');
  const queryPlaceLongitude = pickParam(searchParams, 'placeLongitude');
  const queryPlaceKakaoId = pickParam(searchParams, 'placeKakaoId');

  const parsedLat = queryPlaceLatitude ? Number(queryPlaceLatitude) : NaN;
  const parsedLng = queryPlaceLongitude ? Number(queryPlaceLongitude) : NaN;
  const hasQueryPlace =
    Boolean(queryPlaceName && queryPlaceAddress) &&
    Number.isFinite(parsedLat) &&
    Number.isFinite(parsedLng);

  const place = hasQueryPlace
    ? {
        placeId: null as string | null,
        kakaoId: queryPlaceKakaoId,
        name: queryPlaceName!,
        address: queryPlaceAddress!,
        category: queryPlaceCategory,
        latitude: parsedLat,
        longitude: parsedLng,
        reviewAverage: null as number | null,
        reviewCount: 0,
      }
    : {
        ...appointment.place,
        kakaoId: null as string | null,
      };

  const queryTitle = pickParam(searchParams, 'title');
  const queryDate = pickParam(searchParams, 'date');
  const queryStartTime = pickParam(searchParams, 'startTime');
  const queryEndTime = pickParam(searchParams, 'endTime');

  const initialTitle = queryTitle ?? appointment.title;
  const initialDate = isDateInput(queryDate)
    ? queryDate
    : toDateInputValue(appointment.startAt);
  const initialStartTime = isTimeInput(queryStartTime)
    ? queryStartTime
    : toTimeInputValue(appointment.startAt);
  const initialEndTime = isTimeInput(queryEndTime)
    ? queryEndTime
    : toTimeInputValue(appointment.endsAt);

  return (
    <AppointmentEditClient
      appointmentId={appointmentId}
      initialStatus={appointment.status}
      initialEndsAt={appointment.endsAt}
      initialTitle={initialTitle}
      initialDate={initialDate}
      initialStartTime={initialStartTime}
      initialEndTime={initialEndTime}
      initialPlace={place}
    />
  );
}
