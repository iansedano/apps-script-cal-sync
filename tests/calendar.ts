function test_getSavedEventsData() {
  const originCalendar = "ian@realpython.com";
  const calendarToSyncTo =
    "9cmp5khc3e1mdbm4quvrfbk60g@group.calendar.google.com";
  const ssid = Config.TEST_EVENT_DATA_SSID;

  const timeRange = DateUtil.getTimeRange(-1, 7);

  const originEvents = CalendarApp.getCalendarById(originCalendar).getEvents(
    ...timeRange
  );

  const originEventsData = originEvents.map(extractKeyEventData);

  const targetCalendar = CalendarApp.getCalendarById(calendarToSyncTo);
  const targetEvents = targetCalendar.getEvents(...timeRange);
  const targetEventsData = targetEvents.map(extractKeyEventData);
  const savedTargetEventsData = getSavedDataOnEvents(
    targetEventsData,
    ssid,
    calendarToSyncTo
  );

  console.log({ originEventsData, targetEventsData, savedTargetEventsData });
}

function test_sync_class() {
  const syncer = new CalSyncer(
    DateUtil.getTimeRange(-1, 7),
    "ian@realpython.com",
    "9cmp5khc3e1mdbm4quvrfbk60g@group.calendar.google.com",
    Config.TEST_EVENT_DATA_SSID
  );
}

function test_initial_sync() {
  initialSyncCal("ian@realpython.com");
}
