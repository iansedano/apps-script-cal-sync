namespace CalTyp {
  export type TimeRange = [start: Date, end: Date];

  export interface KeyEventData {
    eventId: string;
    title: string;
    start: GoogleAppsScript.Base.Date;
    end: GoogleAppsScript.Base.Date;
    linkedEvent?: string;
  }

  // Follows KeyEventData
  export type KeyEventDataRow = [
    string,
    string,
    GoogleAppsScript.Base.Date,
    GoogleAppsScript.Base.Date,
    string | null
  ];

  export interface CalSyncer {}

  export interface TargetCalWithSheet {
    getTrackedEvents(
      sourceCal: GoogleAppsScript.Calendar.Calendar
    ): Array<GoogleAppsScript.Calendar.CalendarEvent>;

    cleanOldEventsFromSheet(
      sourceCal: GoogleAppsScript.Calendar.Calendar
    ): void;

    checkLinkedEvents(sourceCal: GoogleAppsScript.Calendar.Calendar): void;
    cleanEventsMissing(events: Array<KeyEventData>): void;
  }
}
