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

function pushNewEventsDataToSheet(
  ssId: string,
  calId: string,
  rows: any[][]
): void {
  if (rows.length !== 0) {
    const calSyncPropsSheet = SpreadsheetApp.openById(ssId);
    const sheet = calSyncPropsSheet.getSheetByName(calId);
    const lastRow = sheet.getLastRow();

    const range = sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length);
    range.setValues(rows);
  }
}

function clearOldSheetEventsData(
  ssId: string,
  calId: string,
  before: Date = DateUtil.getDateOffsetFromToday(-7)
): void {
  const calSyncPropsSheet = SpreadsheetApp.openById(ssId);
  const sheet = calSyncPropsSheet.getSheetByName(calId);
  const values = sheet.getDataRange().getValues();

  const filteredValues = values.filter((row: CalTyp.KeyEventDataRow) => {
    const data: CalTyp.EventEntry = {
      id: row[0],
      title: row[1],
      start: row[2],
      end: row[3],
      linkedEventId: row[4],
    };

    if (data.start.getTime() < before.getTime()) {
      return false;
    } else return true;
  });

  sheet.clear();
  sheet
    .getRange(1, 1, filteredValues.length, filteredValues[0].length)
    .setValues(filteredValues);
}

function deleteRowWithColA(value, calId, ssId) {
  const calSyncPropsSheet = SpreadsheetApp.openById(ssId);
  const sheet = calSyncPropsSheet.getSheetByName(calId);
  const dataRange = sheet.getDataRange();

  const colA = sheet
    .getRange(1, 1, dataRange.getNumRows(), 1)
    .getValues()
    .flat();
  console.log(colA);

  // BUG - Never seems to find anything and so just leaves the values in the sheet
  // which are cleaned up periodically by the clearOldSheetEventsData function
  const indexToDelete = colA.findIndex((eventId) => eventId == value);

  if (indexToDelete != -1) {
    sheet.getRange(1, 1, indexToDelete + 1, dataRange.getNumColumns()).clear();
  }
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
  eventList.forEach((event) => {
    STORAGE.addEntry(event);
  });
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
  toId: string,
  storage: _SheetDb
): void {
  const toCal = CalendarApp.getCalendarById(toId);

  const fromTable = storage.loadTable(fromId);
  const toTable = storage.loadTable(toId);

  eventList.forEach((event: CalTyp.EventEntry) => {
    const newEvent = toCal.createEvent(event.title, event.start, event.end);
    const newEventKeyData = extractKeyEventData(newEvent);
    newEventKeyData.linkedEventId = event.eventId;
    event.linkedEventId = newEvent.getId();
    toTable.addEntry(newEventKeyData);
    fromTable.addEntry(event);
  });
}

function updateExistingEvents(
  eventList: Array<CalTyp.EventEntry>,
  fromId: string,
  toId: string,
  storage: _SheetDb
): void {}

function syncCals(
  fromId: string,
  toId: string,
  storage: _SheetDb,
  timeRange: CalTyp.TimeRange = Config.TIME_RANGE
): void {
  const originEvents = getEventListFromCal(fromId, timeRange);
  const targetCalendar = getEventListFromCal(toId, timeRange);

  const savedOriginEventsData = getEventListFromStorage(fromId, storage);
  const savedTargetEventsData = getEventListFromStorage(toId, storage);

  // Set up tracking vars
  const targetEventsInOrigin = [];
  const eventsDataToAddToSheet = [];

  const updateList = checkForUpdatedEvents(originEvents, savedOriginEventsData);

  createNewEvents(updateList.newEvents, fromId, toId, storage);
  updateExistingEvents(updateList.updatedEvents, fromId, toId, storage);

  // for each origin event, find target event and update or create new event
  originEvents.forEach((event: CalTyp.EventEntry) => {
    const { eventId, title, start, end } = event;

    const targetEvent = savedTargetEventsData.find((targetEventData) => {
      return targetEventData.linkedEventId === eventId;
    });

    if (targetEvent) {
      const targetCalendarEvent = CalendarApp.getCalendarById(toId)
        .getEventById(targetEvent.eventId)
        .setTime(start, end)
        .setTitle(title);
      targetEventsInOrigin.push([
        targetCalendarEvent.getId(),
        title,
        start,
        end,
        eventId,
      ]);
    } else {
      const newEvent = CalendarApp.getCalendarById(toId).createEvent(
        title,
        start,
        end
      );
      eventsDataToAddToSheet.push([
        newEvent.getId(),
        title,
        start,
        end,
        eventId,
      ]);
      targetEventsInOrigin.push([newEvent.getId(), title, start, end, eventId]);
    }
  });

  savedTargetEventsData.forEach((targetEvent) => {
    const originEvent = originEventsData.find((originEventData) => {
      return originEventData.eventId === targetEvent.linkedEventId;
    });

    if (!originEvent) {
      targetCalendar.getEventById(targetEvent.eventId).deleteEvent();
      deleteRowWithColA(targetEvent.eventId, toId, ssId);
    }
  });

  pushNewEventsDataToSheet(ssId, toId, eventsDataToAddToSheet);
  clearOldSheetEventsData(ssId, toId, DateUtil.getDateOffsetFromToday(-20));
}
