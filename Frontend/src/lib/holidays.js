import { dayjs } from "./format";

export const holidayStatus = (h) => {
  const today = dayjs();
  if (today.isBefore(dayjs(h.startDate))) return "upcoming";
  if (today.isAfter(dayjs(h.endDate))) return "passed";
  return "ongoing";
};
