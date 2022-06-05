function test_initial_sync_2() {
  initialSyncCal(
    CalendarApp.getCalendarById("ian@realpython.com"),
    Config.TIME_RANGE,
    CalendarApp.getCalendarById(
      "9cmp5khc3e1mdbm4quvrfbk60g@group.calendar.google.com"
    )
  );
  Utilities.sleep(1000);
}

// function test_initial_sync() {
//   initialSyncCal("ian@realpython.com");
//   Utilities.sleep(1000);
//   STORAGE.clearAllEntries();
// }
