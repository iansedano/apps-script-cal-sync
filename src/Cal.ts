/**
 * Filter event object
 */
function extractKeyEventData(
  event: GoogleAppsScript.Calendar.CalendarEvent
): CalTyp.KeyEventData {
  return {
    eventId: event.getId(),
    title: event.getTitle(),
    start: event.getStartTime(),
    end: event.getEndTime(),
  };
}

function getEventList(calId: String, timeRange: CalTyp.TimeRange) {
  return CalendarApp.getCalendarById(calId)
    .getEvents(...timeRange)
    .map(extractKeyEventData);
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
    const data: CalTyp.KeyEventData = {
      id: row[0],
      title: row[1],
      start: row[2],
      end: row[3],
      linkedEvent: row[4],
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

function syncCals(
  fromId: string,
  toId: string,
  ssId: string,
  timeRange: CalTyp.TimeRange
): void {
  const originEvents = getEventList(fromId, timeRange);
  const targetCalendar = getEventList(toId, timeRange);

  const savedTargetEventsData = getSavedDataOnEvents(
    targetEventsData,
    ssId,
    toId
  );

  // Set up tracking vars
  const targetEventsInOrigin = [];
  const eventsDataToAddToSheet = [];

  // for each origin event, find target event and update or create new event
  originEventsData.forEach((event: CalTyp.KeyEventData) => {
    const { id, title, start, end } = event;

    const targetEvent = savedTargetEventsData.find((targetEventData) => {
      return targetEventData.linkedEvent === id;
    });

    if (targetEvent) {
      const e = targetCalendar.getEventById(targetEvent.id);
      e.setTime(start, end);
      e.setTitle(title);
      targetEventsInOrigin.push([e.getId(), title, start, end, id]);
    } else {
      const newEvent = targetCalendar.createEvent(title, start, end);
      eventsDataToAddToSheet.push([newEvent.getId(), title, start, end, id]);
      targetEventsInOrigin.push([newEvent.getId(), title, start, end, id]);
    }
  });

  savedTargetEventsData.forEach((targetEvent) => {
    const originEvent = originEventsData.find((originEventData) => {
      return originEventData.id === targetEvent.linkedEvent;
    });

    if (!originEvent) {
      targetCalendar.getEventById(targetEvent.id).deleteEvent();
      deleteRowWithColA(targetEvent.id, toId, ssId);
    }
  });

  pushNewEventsDataToSheet(ssId, toId, eventsDataToAddToSheet);
  clearOldSheetEventsData(ssId, toId, DateUtil.getDateOffsetFromToday(-20));
}
