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
): Array<CalTyp.EventEntry> {
  return CalendarApp.getCalendarById(calId)
    .getEvents(...timeRange)
    .map(extractKeyEventData)
    .map((event) => {
      return { ...event, calId };
    });
}

function initialSyncCal(
  calId: string,
  timeRange: CalTyp.TimeRange = Config.TIME_RANGE
): void {
  const eventList = getEventListFromCal(calId, timeRange);
  console.log({ calId });
  const storedEvents = STORAGE.getEntries({ calId });
  console.log({ storedEvents });
  if (storedEvents.length !== 0) {
    throw `Sheet ${calId} has data, please clear before making initial sync`;
  }

  STORAGE.addEntries(eventList);
}

function checkForUpdatedEvents(
  originEvents: Array<CalTyp.EventEntry>,
  savedOriginEvents: Array<CalTyp.EventEntry>
): CalTyp.UpdateList {
  const updatedEvents = [];
  const newEvents = [];
  const deletedEvents = [];

  // Check for modified and new events
  originEvents.forEach((event: CalTyp.EventEntry) => {
    const savedEvent = savedOriginEvents.find(
      (savedEvent: CalTyp.EventEntry) => {
        return savedEvent.eventId == event.eventId;
      }
    );

    if (savedEvent) {
      for (const [key, value] of Object.entries(savedEvent)) {
        if (event[key] !== value) {
          updatedEvents.push(savedEvent);
          break;
        }
      }
    } else newEvents.push(savedEvent);
  });

  // Check for deleted events
  savedOriginEvents.forEach((event: CalTyp.EventEntry) => {
    const originEvent = originEvents.find((originEvent: CalTyp.EventEntry) => {
      return originEvent.eventId == event.eventId;
    });
    if (!originEvent) deletedEvents.push(event);
  });

  return { newEvents, updatedEvents, deletedEvents };
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
