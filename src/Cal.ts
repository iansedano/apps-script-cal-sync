/**
 * Filter event object
 */
function extractKeyEventData(
  event: GoogleAppsScript.Calendar.CalendarEvent
): CalTyp.EventEntry {
  return {
    eventId: event.getId(),
    title: event.getTitle(),
    start: event.getStartTime(),
    end: event.getEndTime(),
    allDayEvent: event.isAllDayEvent(),
    recurringEvent: event.isRecurringEvent(),
  };
}

function getEventListFromCal(
  calId: string,
  timeRange: CalTyp.TimeRange
): CalTyp.EventEntry[] {
  return CalendarApp.getCalendarById(calId)
    .getEvents(...timeRange)
    .map(extractKeyEventData)
    .map((event) => {
      return { ...event, calId };
    });
}

function initialSyncCal(
  sourceCal: GoogleAppsScript.Calendar.Calendar,
  timeRange: CalTyp.TimeRange = Config.TIME_RANGE,
  targetCal: GoogleAppsScript.Calendar.Calendar
): void {
  const eventList = getEventListFromCal(sourceCal.getId(), timeRange);
  const storedEvents = STORAGE.getEntries({ calId: sourceCal.getId() });
  if (storedEvents.length !== 0) {
    throw `Sheet ${sourceCal.getId()} has data, please clear before making initial sync`;
  }
  const newEventList = createLinkedEvents(eventList, targetCal);

  STORAGE.addEntries(newEventList);
}

function createLinkedEvents(
  events: CalTyp.EventEntry[],
  targetCal: GoogleAppsScript.Calendar.Calendar
): CalTyp.EventEntry[] {
  return events.map((event) => {
    const id = targetCal
      .createEvent(event.title, event.start, event.end)
      .getId();
    event.linkedCalId = targetCal.getId();
    event.linkedEventId = id;
    return event;
  });
}

function checkForUpdatedEvents(
  sourceCal: GoogleAppsScript.Calendar.Calendar,
  targetCal: GoogleAppsScript.Calendar.Calendar
): CalTyp.UpdateList {
  const updatedEvents = [];
  const newEvents = [];
  const deletedEvents = [];

  const savedEvents = STORAGE.getEntries({
    calId: sourceCal.getId(),
    linkedCalId: targetCal.getId(),
  });

  savedEvents.forEach((event: CalTyp.EventEntry) => {
    const actualEvent = CalendarApp.getEventById(event.eventId);

    if (!actualEvent) {
      deletedEvents.push(event.id);
      return;
    }

    const actualEventData = extractKeyEventData(actualEvent);

    if (
      !Object.entries(actualEvent).every(([key, value]) => event[key] == value)
    ) {
      updatedEvents.push(event.id);
    }
  });

  // Check for modified and new events
  // savedEvents.forEach((event: CalTyp.EventEntry) => {
  //   const savedEvent = savedOriginEvents.find(
  //     (savedEvent: CalTyp.EventEntry) => {
  //       return savedEvent.eventId == event.eventId;
  //     }
  //   );

  //   if (savedEvent) {
  //     for (const [key, value] of Object.entries(savedEvent)) {
  //       if (event[key] !== value) {
  //         updatedEvents.push(savedEvent);
  //         break;
  //       }
  //     }
  //   } else newEvents.push(savedEvent);
  // });

  // // Check for deleted events
  // savedOriginEvents.forEach((event: CalTyp.EventEntry) => {
  //   const originEvent = originEvents.find((originEvent: CalTyp.EventEntry) => {
  //     return originEvent.eventId == event.eventId;
  //   });
  //   if (!originEvent) deletedEvents.push(event);
  // });

  // return { newEvents, updatedEvents, deletedEvents };
}

function createNewEvents(
  eventList: Array<CalTyp.EventEntry>,
  fromId: string,
  toId: string
): void {
  const toCal = CalendarApp.getCalendarById(toId);

  eventList.forEach((event: CalTyp.EventEntry) => {
    const newEvent = toCal.createEvent(event.title, event.start, event.end);
    const newEventKeyData = extractKeyEventData(newEvent);
    newEventKeyData.linkedEventId = event.eventId;
    event.linkedEventId = newEvent.getId();
    // ...
  });
}

function updateExistingEvents(
  eventList: Array<CalTyp.EventEntry>,
  fromId: string,
  toId: string
): void {}
