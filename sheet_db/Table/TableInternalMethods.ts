namespace TableInternalMethods {
  export function _loadHeaders(this: _Table): void {
    if (!this._dataRange) this._loadDataRange();
    this.headers = this._sheet
      .getRange(1, 1, 1, this.numColumns)
      .getValues()[0];
    if (this.headers[0] !== "id") throw "first column is not id";
  }

  export function _loadIds(this: _Table): void {
    if (!this._dataRange) this._loadDataRange();
    this.ids = this._sheet.getRange(1, 1, this.numRows, 1).getValues().flat();
    if (typeof this.ids[1] !== "number") throw "first id is not a number";
  }

  export function _loadDataRange(this: _Table): void {
    this._dataRange = this._sheet.getDataRange();
    this.numRows = this._dataRange.getNumRows();
    this.numColumns = this._dataRange.getNumColumns();
  }

  export function _loadAllValues(this: _Table): void {
    if (!this._dataRange) this._loadDataRange();
    this.allValues = this._dataRange.getValues();
  }

  export function _getRowNumber(this: _Table, searchId: number): number {
    if (!this.ids) this._loadIds();

    for (const [index, id] of this.ids.entries()) {
      if (id === searchId) {
        // index + 1 because rows begin at 1 not 0
        const rowNumber = index + 1;
        return rowNumber;
      }
    }
  }

  export function _refreshMetaData(this: _Table) {
    if (this._dataRange) this._loadDataRange(); // Needs to be first
    if (this.headers) this._loadHeaders();
    if (this.ids) this._loadIds();
    if (this.allValues) this._loadAllValues();
  }
}
