function copyRealPythonEventsToAlarmCal(): void {
  const originCalendar = "ian@realpython.com";
  const calendarToSyncTo = "iansedano@gmail.com";

  const storage = new SheetDb(Config.TEST_EVENT_DATA_SSID);

  syncCals(originCalendar, calendarToSyncTo, storage);
}

function sixHours() {
  copyRealPythonEventsToAlarmCal();
}
