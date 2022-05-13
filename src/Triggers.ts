function copyRealPythonEventsToAlarmCal(): void {
  const originCalendar = "ian@realpython.com";
  const calendarToSyncTo = "iansedano@gmail.com";

  syncCals(
    originCalendar,
    calendarToSyncTo,
    Config.EVENT_DATA_SSID,
    DateUtil.getTimeRange(-1, 7)
  );
}

function sixHours() {
  copyRealPythonEventsToAlarmCal();
}
