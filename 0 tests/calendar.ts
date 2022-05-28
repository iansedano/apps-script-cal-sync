function test_initial_sync() {
  initialSyncCal("ian@realpython.com");
  Utilities.sleep(1000);
  STORAGE.clearEntries();
}
