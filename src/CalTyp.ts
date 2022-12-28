type TimeRange = [start: Date, end: Date];

interface EventEntry {
  id?: number;
  eventId?: string;
  calId?: string;
  title?: string;
  start?: GoogleAppsScript.Base.Date;
  end?: GoogleAppsScript.Base.Date;
  linkedEventId?: string;
  linkedCalId?: string;
  allDayEvent?: boolean;
  recurringEvent?: boolean;
}

interface UpdateList {
  newEvents: Array<EventEntry>;
  updatedEvents: Array<EventEntry>;
  deletedEvents: Array<EventEntry>;
}

// Follows KeyEventData
type KeyEventDataRow = [
  string,
  string,
  GoogleAppsScript.Base.Date,
  GoogleAppsScript.Base.Date,
  string | null
];

interface CalSyncer {}

interface TargetCalWithSheet {
  getTrackedEvents(
    sourceCal: GoogleAppsScript.Calendar.Calendar
  ): Array<GoogleAppsScript.Calendar.CalendarEvent>;

  cleanOldEventsFromSheet(sourceCal: GoogleAppsScript.Calendar.Calendar): void;

  checkLinkedEvents(sourceCal: GoogleAppsScript.Calendar.Calendar): void;
  cleanEventsMissing(events: Array<EventEntry>): void;
}
