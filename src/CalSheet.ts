class TargetCalWithSheet implements CalTyp.TargetCalWithSheet {
  private _sheetDb: _SheetDb;
  private _targetCal: GoogleAppsScript.Calendar.Calendar;
  private _timeRange: CalTyp.TimeRange;

  constructor(
    targetCal: GoogleAppsScript.Calendar.Calendar,
    spreadSheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
    timeRange: CalTyp.TimeRange
  ) {
    this._sheetDb = new SheetDb(spreadSheet.getId());
    this._targetCal = targetCal;
    this._timeRange = timeRange;
  }

  getTrackedEvents(sourceCal: GoogleAppsScript.Calendar.Calendar): Array<any> {
    const events = sourceCal.getEvents(
      this._timeRange.start,
      this._timeRange.end
    );

    const table: _Table = this._sheetDb[sourceCal.getId()];

    const trackedEvents = table.getEntriesByFilter({});

    return;
  }

  cleanOldEventsFromSheet(): void {}
  checkLinkedEvents(): void {}
  cleanEventsMissing(events: Array<CalTyp.KeyEventData>): void {}
}
