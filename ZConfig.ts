interface ConfigObject {
  EVENT_DATA_SSID: string;
  TEST_EVENT_DATA_SSID: string;
  TEST_EVENT_SHEET_NAME: string;
  TIME_RANGE: CalTyp.TimeRange;
}

const Config: ConfigObject = {
  EVENT_DATA_SSID: "1_XVFb2erZT9EyevCnqRr0UH2kpNFoMl_CO726UivXCk",
  TEST_EVENT_DATA_SSID: "1hkyW1CybhzjZWFQrvkiKtkJSxfG8OzYJqb4hAhSN2sE",
  TEST_EVENT_SHEET_NAME: "cal-sync",
  TIME_RANGE: DateUtil.getTimeRange(-1, 7),
};

const STORAGE = new Table(
  SpreadsheetApp.openById(Config.TEST_EVENT_DATA_SSID).getSheetByName(
    Config.TEST_EVENT_SHEET_NAME
  )
);

// namespace Config {
//   export const EVENT_DATA_SSID: string =
//     "1_XVFb2erZT9EyevCnqRr0UH2kpNFoMl_CO726UivXCk";
//   export const TEST_EVENT_DATA_SSID: string =
//     "1hkyW1CybhzjZWFQrvkiKtkJSxfG8OzYJqb4hAhSN2sE";
//   export const TIME_RANGE: [number, number] = [-1, 7];
// }
