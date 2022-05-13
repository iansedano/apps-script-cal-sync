function sLog(value="") {
    const file = SpreadsheetApp.openById(SS_ID);
    const sheet = file.getSheetByName('post_log');
    sheet.appendRow([new Date(), JSON.stringify(value)])
  }