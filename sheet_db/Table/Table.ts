/*

The design of this class must take into account the fact that the
table will be reinitialized at every execution. Hence loading ids, headers,
values are all done depending on the task at hand.

*/

type RowResult = {
  rowNumber: number;
  row: Array<any>;
};

type ColumnResult = {
  columnNumber: number;
  column: Array<any>;
};

type Filter = {}; // key is header and value is value to filter
type OrderedFilterObject = { headers: string[]; values: any[] };
type Entry = { id: number };

interface TableInterface {
  getIds(): Array<number>;
  getHeaders(): Array<string>;
  getAllValues(): Array<Array<any>>;
  getNumRows(): number;
  getNumColumns(): number;
  getKeysCreated(): Array<number>;

  getColumnByHeader(headerName: string): ColumnResult;
  getRowById(id: number): RowResult;
  getRowsByFilter(filterObject: Filter): Array<RowResult>; // empty obj returns everything
  getEntries(filterObject: Filter): Array<Entry>; // empty obj returns everything

  addEntry(entry: Entry);
  addRow(row: Array<any>): void;
  updateValue(idToUpdate: number, headerName: string, value: any): number;
  updateRow(idToUpdate: number, row: Array<any>): void;
  deleteRow(idToDelete: number): void;
  createUniqueKeys(numberOfKeys: number): Array<number>;

  // checkUniqueKeys();
  // ensureSortedById();
  // checkLimits();
}

class _Table implements TableInterface {
  private _file: GoogleAppsScript.Spreadsheet.Spreadsheet;
  protected _sheet: GoogleAppsScript.Spreadsheet.Sheet;
  protected _dataRange: GoogleAppsScript.Spreadsheet.Range;

  protected ids: Array<number>;
  protected headers: Array<string>;
  protected numRows: number;
  protected numColumns: number;
  protected keysCreated: Array<number>;
  protected allValues: Array<Array<any>>;

  constructor(SS_ID: string, sheetName: string) {
    this._file = SpreadsheetApp.openById(SS_ID);
    this._sheet = this._file.getSheetByName(sheetName);
  }

  public getIds(): Array<number> {
    if (!this.ids) this._loadIds();
    return this.ids;
  }
  public getHeaders(): Array<string> {
    if (!this.headers) this._loadHeaders();
    return this.headers;
  }
  public getAllValues(): Array<Array<any>> {
    if (!this.allValues) this._loadAllValues();
    return this.allValues;
  }
  public getNumRows(): number {
    if (!this.numRows) this._loadDataRange();
    return this.numRows;
  }
  public getNumColumns(): number {
    if (!this.numColumns) this._loadDataRange();
    return this.numColumns;
  }
  public getKeysCreated(): Array<number> {
    return this.keysCreated;
  }

  protected _getRowNumber = TableInternalMethods._getRowNumber;
  protected _refreshMetaData = TableInternalMethods._refreshMetaData;
  protected _loadIds = TableInternalMethods._loadIds;
  protected _loadHeaders = TableInternalMethods._loadHeaders;
  protected _loadDataRange = TableInternalMethods._loadDataRange;
  protected _loadAllValues = TableInternalMethods._loadAllValues;

  public getColumnByHeader = TableGetMethods.getColumnByHeader;
  public getRowById = TableGetMethods.getRowById;
  public getRowsByFilter = TableGetMethods.getRowsByFilter;

  public getEntries = TableEntryMethods.getEntries;
  public addEntry = TableEntryMethods.addEntry;

  public createUniqueKeys = TableUpdateMethods.createUniqueKeys;
  public addRow = TableUpdateMethods.addRow;
  public updateValue = TableUpdateMethods.updateValue;
  public updateRow = TableUpdateMethods.updateRow;
  public deleteRow = TableUpdateMethods.deleteRow;
}

var Table = _Table;
