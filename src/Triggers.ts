function refreshCalendarTriggers() {
  ScriptApp.getProjectTriggers().forEach((trigger) => {
    if (trigger.getTriggerSource() == ScriptApp.TriggerSource.CALENDAR) {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  Object.values(CFG.SOURCES).forEach((calId) => {
    ScriptApp.newTrigger("main")
      .forUserCalendar(calId)
      .onEventUpdated()
      .create();
  });
}
