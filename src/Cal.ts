type EventMap = { [key: string]: GoogleAppsScript.Calendar.CalendarEvent };

function main() {
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

  Object.entries(CFG.SOURCES).forEach(([tag, calId]) => {
    const sourceEvents: EventMap = CalendarApp.getCalendarById(calId)
      .getEvents(...TIME_RANGE)
      .reduce((out, event) => {
        out[event.getId()] = event;
        return out;
      }, {});

    console.log(Object.values(sourceEvents).map((e) => e.getTitle()));

    // Update or create
    Object.entries(sourceEvents).forEach(([eventId, sourceEvent]) => {
      if (targetEvents[eventId]) {
        updateEvent(targetEvents[eventId], tag, sourceEvent);
      } else {
        createEvent(sourceEvent, tag, targetCal);
      }
    });

    // Delete events not present in source
    const [targetKeys, sourceKeys] = [
      new Set(Object.keys(targetEvents)),
      new Set(Object.keys(sourceEvents)),
    ];

    [...targetKeys]
      .filter((eventId) => !sourceKeys.has(eventId))
      .forEach((eventId) => targetEvents[eventId].deleteEvent());
  });
}

function getMetadataFromDescription(
  event: GoogleAppsScript.Calendar.CalendarEvent,
  key: string
): string | null {
  const pattern = new RegExp(`${key}:{{(.+)}}`);
  const result = pattern.exec(event.getDescription())[1];
  return result ? result[1] : null;
}

function updateEvent(
  eventToUpdate: GoogleAppsScript.Calendar.CalendarEvent,
  tag: string,
  sourceEvent: GoogleAppsScript.Calendar.CalendarEvent
): void {
  const se = sourceEvent;
  const eu = eventToUpdate;

  eu.setTitle(tag + se.getTitle());
  eu.setLocation(se.getLocation());

  if (se.isAllDayEvent()) {
    eu.setAllDayDates(se.getAllDayStartDate(), se.getAllDayEndDate());
  } else {
    eu.setTime(se.getStartTime(), se.getEndTime());
  }

  const header =
    [
      "SYNCED EVENT - DON'T MODIFY DESCRIPTION",
      "==================================================",
      `source_event_id:{{${se.getId()}}}`,
      `source_cal_id:{{${se.getOriginalCalendarId()}}}`,
      `last_updated:{{${se.getLastUpdated().toISOString()}}}`,
      "==================================================",
    ].join("\n") + "\n";

  eu.setDescription(`${header}${se.getDescription()}`);
}

function createEvent(
  sourceEvent: GoogleAppsScript.Calendar.CalendarEvent,
  tag: string,
  targetCal: GoogleAppsScript.Calendar.Calendar
): GoogleAppsScript.Calendar.CalendarEvent {
  const newEvent = targetCal.createEvent("temp", new Date(), new Date());
  updateEvent(newEvent, tag, sourceEvent);
  return newEvent;
}
