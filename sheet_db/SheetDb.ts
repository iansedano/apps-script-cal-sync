class _SheetDb {
  SS_ID: string;
  file: GoogleAppsScript.Spreadsheet.Spreadsheet;

  constructor(SS_ID: string) {
    this.SS_ID = SS_ID;
    this.file = SpreadsheetApp.openById(SS_ID);

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    return new Proxy(this, {
      get: function (target, prop: string) {
        if (!target[prop]) {
          target.loadTable(prop);
        }

        return target[prop];
      },
    });
  }

  loadTable(name: string) {
    if (!this[name]) {
      this[name] = new Table(this.SS_ID, name);
    } else {
      return null;
    }
  }

  createTable(name: string, headers: Array<string>) {
    if (!this[name]) {
      let sheet = this.file.getSheets().find((sheet) => {
        if (sheet.getName() === name) {
          return true;
        } else return false;
      });
      if (!sheet) {
        sheet = this.file.insertSheet(name);
        sheet.appendRow(["id", ...headers]);
      } else {
        throw "sheet with this name already exists!";
      }
    }

    this[name] = new Table(this.SS_ID, name);
  }
}

var SheetDb = _SheetDb;
