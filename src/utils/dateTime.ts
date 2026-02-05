export const getDefaultDateTimeValues = () => {
  const now = new Date();
  const pad = (value: number) => value.toString().padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
  const startTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const end = new Date(now.getTime() + 60 * 60 * 1000);
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

  return { date, startTime, endTime };
};
