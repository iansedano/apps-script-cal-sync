interface ConfigObject {
  EVENT_DATA_SSID: string;
  TEST_EVENT_DATA_SSID: string;
  TIME_RANGE: CalTyp.TimeRange;
  STORAGE: _Table;
}

const Config: ConfigObject = {
  EVENT_DATA_SSID: "1_XVFb2erZT9EyevCnqRr0UH2kpNFoMl_CO726UivXCk",
  TEST_EVENT_DATA_SSID: "1hkyW1CybhzjZWFQrvkiKtkJSxfG8OzYJqb4hAhSN2sE",
  TIME_RANGE: DateUtil.getTimeRange(-1, 7),
};

const STORAGE = new SheetDb(
  "1hkyW1CybhzjZWFQrvkiKtkJSxfG8OzYJqb4hAhSN2sE"
).loadTable("cal-sync");

// namespace Config {
//   export const EVENT_DATA_SSID: string =
//     "1_XVFb2erZT9EyevCnqRr0UH2kpNFoMl_CO726UivXCk";
//   export const TEST_EVENT_DATA_SSID: string =
//     "1hkyW1CybhzjZWFQrvkiKtkJSxfG8OzYJqb4hAhSN2sE";
//   export const TIME_RANGE: [number, number] = [-1, 7];
// }
