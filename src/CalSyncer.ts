class CalSyncer {
  calPropTable: any;
  fromCal: GoogleAppsScript.Calendar.Calendar;
  toCal: GoogleAppsScript.Calendar.Calendar;
  timeRange: CalTyp.TimeRange;
  originEvents: Array<CalTyp.KeyEventData>;
  targetEvents: Array<CalTyp.KeyEventData>;
  savedEvents: Array<any>;

  constructor(
    timeRange: CalTyp.TimeRange,
    fromCalId: string,
    toCalId: string,
    ssIdForProps: string
  ) {
    const calPropDb = new SheetDb(ssIdForProps);

    if (calPropDb.loadTable(toCalId) == null) {
      const headers = ["eventId", "title", "start", "end", "linkedEvent"];
      calPropDb.createTable(toCalId, headers);
    }
    this.calPropTable = calPropDb[toCalId];

    this.fromCal = CalendarApp.getCalendarById(fromCalId);
    this.toCal = CalendarApp.getCalendarById(toCalId);
    this.timeRange = timeRange;

    this.originEvents = this.fromCal
      .getEvents(...this.timeRange)
      .map(extractKeyEventData);
    this.targetEvents = this.toCal
      .getEvents(...this.timeRange)
      .map(extractKeyEventData);
    this.savedEvents = this.calPropTable.getEntriesByFilter();
  }

  execute() {
    this.originEvents.forEach((eventToSync: CalTyp.KeyEventData) => {
      const { eventId, title, start, end } = eventToSync;

      const targetEvent: CalTyp.KeyEventData = this.savedEvents.find(
        (targetEventData) => {
          return targetEventData.linkedEvent === eventId;
        }
      );

      const usedEvents = [];

      if (targetEvent) {
        const e = this.toCal.getEventById(targetEvent.eventId);
        e.setTime(start, end);
        e.setTitle(title);
      } else {
        const newEvent = this.toCal.createEvent(title, start, end);
        eventToSync.linkedEvent = newEvent.getId();
        this.calPropTable.addEntry(eventToSync);
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

  pushNewEventsDataToSheet(ssId: string, calId: string, rows: any[][]): void {
    if (rows.length !== 0) {
      const calSyncPropsSheet = SpreadsheetApp.openById(ssId);
      const sheet = calSyncPropsSheet.getSheetByName(calId);
      const lastRow = sheet.getLastRow();

      const range = sheet.getRange(lastRow + 1, 1, rows.length, rows[0].length);
      range.setValues(rows);
    }
  }

  clearOldSheetEventsData(
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
}
