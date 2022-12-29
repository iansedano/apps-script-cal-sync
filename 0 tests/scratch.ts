function test() {
  const TIME_RANGE = DateUtil.getTimeRange(
    -CFG.DAYS_INTO_PAST,
    CFG.DAYS_INTO_FUTURE
  );

  const targetCal = CalendarApp.getCalendarById(CFG.MERGE_TARGET);
  const targetEvents: EventMap = targetCal
    .getEvents(...TIME_RANGE)
    .reduce((out, event) => {
      const originalId = getMetadataFromDescription(event, "source_event_id");
      if (originalId) {
        out[originalId] = event;
      }
      return out;
    }, {});
  console.log(Object.values(targetEvents).map((e) => e.getTitle()));

  Object.entries(CFG.SOURCES).forEach(([tag, calId]) => {
    const sourceEvents: EventMap = CalendarApp.getCalendarById(calId)
      .getEvents(...TIME_RANGE)
      .reduce((out, event) => {
        out[event.getId()] = event;
        return out;
      }, {});

    console.log(Object.values(sourceEvents).map((e) => e.getTitle()));
  });
}
