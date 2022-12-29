type TimeRange = [start: Date, end: Date];

namespace DateUtil {
  export function getDateOffsetFromToday(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  export function getTimeRange(start: number, end: number): TimeRange {
    return [getDateOffsetFromToday(start), getDateOffsetFromToday(end)];
  }
}
