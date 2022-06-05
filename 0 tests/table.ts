function test_loading_id() {
  const sheetdb = new SheetDb(Config.TEST_EVENT_DATA_SSID);
  const table = sheetdb.loadTable("test");
  console.log(table.getIds());
}

function test_generate_id() {
  const sheetdb = new SheetDb(Config.TEST_EVENT_DATA_SSID);
  const table = sheetdb.loadTable("test");
  console.log(table.createUniqueKeys(1));
}
