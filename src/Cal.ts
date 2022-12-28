const TIME_RANGE = DateUtil.getTimeRange(
  CFG.DAYS_INTO_PAST,
  CFG.DAYS_INTO_FUTURE
);

function main() {
  // get events from target
  const targetCal = CalendarApp.getCalendarById(CFG.MERGE_TARGET);
  const targetEvents = targetCal
    .getEvents(...TIME_RANGE)
    .reduce((out, event) => {
      const originalId = getOriginalEventId(event);
      if (originalId) {
        out[originalId] = event;
      }
      return out;
    }, {});

  // for cal in sources
  //   get events, compare, create/update as needed

  Object.entries(CFG.SOURCES).forEach(([key, value]) =>
    syncCal(value, key, targetEvents, targetCal)
  );

  // delete events that no longer exist
}

function syncCal(
  tag: string,
  sourceCalId: string,
  targetEvents: { [key: string]: GoogleAppsScript.Calendar.CalendarEvent },
  targetCal: GoogleAppsScript.Calendar.Calendar
) {
  const sourceEvents = CalendarApp.getCalendarById(sourceCalId).getEvents(
    ...TIME_RANGE
  );

  sourceEvents.forEach((event) => {
    if (targetEvents[event.getId()]) {
    }
  });
}

function getOriginalEventId(event: GoogleAppsScript.Calendar.CalendarEvent) {
  const pattern = /ORIGINAL_EVENT_ID:{{(.+)}}/;
  const result = pattern.exec(event.getDescription())[1];
  return result ? result[1] : null;
}

function wasCreatedByCalSync(event: GoogleAppsScript.Calendar.CalendarEvent) {
  if (/ORIGINAL_EVENT_ID:{{.+}}/.test(event.getDescription())) {
    return true;
  }
  return false;
}

function getEventListFromCal(
  calId: string,
  timeRange: TimeRange
): EventEntry[] {
  return CalendarApp.getCalendarById(calId).getEvents(...timeRange);
}

function initialSyncCal(
  sourceCal: GoogleAppsScript.Calendar.Calendar,
  timeRange: TimeRange = TIME_RANGE,
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
  events: EventEntry[],
  targetCal: GoogleAppsScript.Calendar.Calendar
): EventEntry[] {
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
): UpdateList {
  const updatedEvents = [];
  const newEvents = [];
  const deletedEvents = [];

  const savedEvents = STORAGE.getEntries({
    calId: sourceCal.getId(),
    linkedCalId: targetCal.getId(),
  });

  savedEvents.forEach((event: EventEntry) => {
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
  // savedEvents.forEach((event: EventEntry) => {
  //   const savedEvent = savedOriginEvents.find(
  //     (savedEvent: EventEntry) => {
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
  // savedOriginEvents.forEach((event: EventEntry) => {
  //   const originEvent = originEvents.find((originEvent: EventEntry) => {
  //     return originEvent.eventId == event.eventId;
  //   });
  //   if (!originEvent) deletedEvents.push(event);
  // });

  // return { newEvents, updatedEvents, deletedEvents };
}

function createNewEvents(
  eventList: Array<GoogleAppsScript.Calendar.CalendarEvent>,
  fromId: string,
  toId: string
): void {
  const toCal = CalendarApp.getCalendarById(toId);

  eventList.forEach((event: EventEntry) => {
    const newEvent = toCal.createEvent(event.title, event.start, event.end);
    const newEventKeyData = extractKeyEventData(newEvent);
    newEventKeyData.linkedEventId = event.eventId;
    event.linkedEventId = newEvent.getId();
    // ...
  });
}

function updateExistingEvents(
  eventList: Array<GoogleAppsScript.Calendar.CalendarEvent>,
  fromId: string,
  toId: string
): void {}
