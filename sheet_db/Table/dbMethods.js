/**
 * @param {string} tableName
 * @param {array} ids
 */
function get(tableName, ids) {
  const table = new Table(tableName)
  const filteredData = table.data.filter(row => ids.include(row[0]));
  return {headers: table.headers, metadata: table.metadata, data: filteredData};
}

function getAll(tableName){
  const table = new Table(tableName)
  return {headers: table.headers, metadata: table.metadata, data: table.data};
}

/**
 * @param {string} tableName
 * @param {Object=} body - fields to include, empty
 */
function insert(tableName, body = {}) {
  const table = new Table(tableName)

  if (Object.keys(body).length >= table.headers.length) {
    throw "body has too many properties"
  }
  if (body.hasOwnProperty("id")) throw "don't provide an id in the body"

  for (let key in body) {
    if (table.headers.includes(key) === false) {
      throw `body has invalid property ${key}`
    }
  }

  const row = table.headers.map((header, i) => {
    return body.hasOwnProperty(header)
      ? body[header] : ""
  })

  table.addRow(row)
}

/**
 * @param {string} tableName
 * @param {string} id
 * @param {string} header
 * @param {string} value
 */
function updateSingleValue(tableName, id, header, value) {
  const table = new Table(tableName)
  table.updateValue(id, header, value)
}

function updateRow(tableName, id, body) {
  const table = new Table(tableName)
}


function list(tableName, query) {
  // query = {"DateRange": [date1, date2]}
  try {
    const startDate = setDateToMidnight(query.DateRange[0], false)
    const endDate = setDateToMidnight(query.DateRange[1], true)
    const startTime = startDate.getTime()
    const endTime = endDate.getTime()
  } catch (e) {
    return "invalid query"
  }

  // TODO - deal with types (make some or most unsupported)
  const table = new Table(tableName)
  // TODO - get all values, search for match with all query items


  table.data.filter(row => {
    const rowObject = table.headers.reduce((output, header, i) => {
      output[header] = row[i]
      return output
    }, {})
    for (const [key, values] of Object.entries(query)){
      values.forEach(value => {
        if (rowObject[key] === value) return true
      })
    }
    return false
  })
  // TODO - if date, then do some date handling
}
