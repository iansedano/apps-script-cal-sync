namespace DateUtil {
  export function getDateOffsetFromToday(days: number) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  export function getTimeRange(start: number, end: number): CalTyp.TimeRange {
    return {
      start: getDateOffsetFromToday(start),
      end: getDateOffsetFromToday(end),
    };
  }
}
