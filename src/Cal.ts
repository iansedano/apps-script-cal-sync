type EventMap = { [key: string]: GoogleAppsScript.Calendar.CalendarEvent };

function main() {
  const TIME_RANGE = DateUtil.getTimeRange(
    -CFG.DAYS_INTO_PAST,
    CFG.DAYS_INTO_FUTURE
  );

  // TARGET CAL
  const targetCal = CalendarApp.getCalendarById(CFG.MERGE_TARGET);
  const targetEvents: EventMap = targetCal
    .getEvents(...TIME_RANGE)
    .reduce((acc, event) => {
      const syncId = getMetadataFromDescription(event, "sync_id");
      if (syncId) {
        acc[syncId] = event;
      }
      return acc;
    }, {});

  // SOURCES
  Object.entries(CFG.SOURCES).forEach(([tag, calId]) => {
    console.log(`Syncing ${tag}`);
    // Filter target events to include only events originally from this source
    const filteredTargetEvents = Object.entries(targetEvents).reduce(
      (acc, [syncId, evt]) => {
        if (calId == getMetadataFromDescription(evt, "source_cal_id")) {
          acc[syncId] = evt;
        }
        return acc;
      },
      {}
    );

    // Get source events
    const sourceEvents: EventMap = CalendarApp.getCalendarById(calId)
      .getEvents(...TIME_RANGE)
      .reduce((acc, event) => {
        acc[getSyncId(event)] = event;
        return acc;
      }, {});

    // Update or create target events corresponding to source events
    Object.entries(sourceEvents).forEach(([syncId, sourceEvent]) => {
      if (filteredTargetEvents[syncId]) {
        console.log("Updating Event");
        updateEvent(filteredTargetEvents[syncId], tag, sourceEvent, calId);
      } else {
        console.log("Creating event");
        createEvent(sourceEvent, tag, calId, targetCal);
      }
    });

    // Delete events not present in source
    const [targetKeys, sourceKeys] = [
      new Set(Object.keys(filteredTargetEvents)),
      new Set(Object.keys(sourceEvents)),
    ];

    [...targetKeys]
      .filter((syncId) => !sourceKeys.has(syncId))
      .forEach((syncId) => {
        console.log("Deleting Event");
        filteredTargetEvents[syncId].deleteEvent();
      });

    console.log(`Finished syncing ${tag}`);
  });
}

function updateEvent(
  eventToUpdate: GoogleAppsScript.Calendar.CalendarEvent,
  tag: string,
  sourceEvent: GoogleAppsScript.Calendar.CalendarEvent,
  sourceCalId: string
): void {
  const se = sourceEvent;
  const eu = eventToUpdate;

  if (
    se.getLastUpdated().toISOString() ==
    getMetadataFromDescription(eu, "last_updated")
  ) {
    console.log("Skipping update, no change since last update");
    return;
  }

  eu.setTitle(`${tag} ${se.getTitle()}`);
  eu.setLocation(se.getLocation());

  if (se.isAllDayEvent()) {
    eu.setAllDayDates(se.getAllDayStartDate(), se.getAllDayEndDate());
  } else {
    eu.setTime(se.getStartTime(), se.getEndTime());
  }

  const header =
    [
      "SYNCED EVENT - DON'T MODIFY DESCRIPTION",
      "============================",
      `sync_id:{{${getSyncId(se)}}}`,
      `source_cal_id:{{${sourceCalId}}}`,
      `last_updated:{{${se.getLastUpdated().toISOString()}}}`,
      "=============================",
    ].join("\n") + "\n";

  eu.setDescription(`${header}${se.getDescription()}`);
}

function createEvent(
  sourceEvent: GoogleAppsScript.Calendar.CalendarEvent,
  tag: string,
  sourceCalId: string,
  targetCal: GoogleAppsScript.Calendar.Calendar
): GoogleAppsScript.Calendar.CalendarEvent {
  console.log("Creating event");
  const newEvent = targetCal.createEvent("temp", new Date(), new Date());
  updateEvent(newEvent, tag, sourceEvent, sourceCalId);
  return newEvent;
}

function getMetadataFromDescription(
  event: GoogleAppsScript.Calendar.CalendarEvent,
  key: string
): string | null {
  const pattern = new RegExp(`${key}:{{(.+)}}`);
  const result = pattern.exec(event.getDescription());
  return result ? result[1] : null;
}

function getSyncId(event: GoogleAppsScript.Calendar.CalendarEvent) {
  return hashCode(event.getStartTime().getTime() + event.getId());
}

function hashCode(str: string) {
  let hash = 0;
  let i: number;
  let chr: number;
  if (this.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function deleteAllEvents() {
  const TIME_RANGE = DateUtil.getTimeRange(
    -CFG.DAYS_INTO_PAST,
    CFG.DAYS_INTO_FUTURE
  );

  CalendarApp.getCalendarById(CFG.MERGE_TARGET)
    .getEvents(...TIME_RANGE)
    .forEach((ev) => ev.deleteEvent());
}
