function testTrackingService() {

  // TODAY TEST
  // console.log(
  //   trackingService(
  //     "GET",
  //     ["date"],
  //     {date: "today"}
  //   )
  // )

  // SPECIFIC DATE TEST
  // console.log(
  //   trackingService(
  //     "GET",
  //     ["date"],
  //     {year: 2021, month: 05, day:03}
  //   )
  // )

  // WEEK TEST
  // console.log(
  //   trackingService(
  //     "GET",
  //     ["week"],
  //     {date:new Date(2021, 3, 30)}
  //   )
  // )

  // POST SINGLE VALUE TEST
  // console.log(
  //   trackingService(
  //     "POST",
  //     ["date"],
  //     {date:new Date(2021, 3, 30)}
  //   )
  // )

  // POST NEW ROW TEST
  // console.log(
  //   trackingService(
  //     "POST",
  //     ["date"],
  //     {date:new Date(2021, 3, 30)}
  //   )
  // )

  // POST UPDATE ROW TEST
  // console.log(
  //   trackingService(
  //     "POST",
  //     ["date"],
  //     {date:new Date(2021, 3, 30)}
  //   )
  // )

}

function trackingService(method, path, body) {

    switch (path[0]) {
        case "date":
            switch (method){
                case "GET":
                    return getDate(body.date)
                case "POST":
                    return postDate(body)
            }
                
        case "week":
            switch (method){
                case "GET":
                    return getWeek(body.date)
                case "POST":
                    throw "can't POST week, POST dates instead"
            }
        default:
            throw "invalid path"
    }

}


function getDate(date) {
    const table = new Table("Tracking")

    const [y, m, d] = getYMDComponentsFromDate(date)

    const [yearIndex, monthIndex, dateIndex] = [
        table.headers.indexOf("year"),
        table.headers.indexOf("month"),
        table.headers.indexOf("day")
    ]

    console.log(y, m, d)
    console.log(table.data)

    const output = table.data.filter(row => {
        if (
            y == row[yearIndex] &&
            m == row[monthIndex] &&
            d == row[dateIndex]
        ) return true
        return false
    })

    if (output.length > 1) throw "duplicate result for date!"
    if (output.length === 0 ) throw "no results for date!"

    return {
      headers: table.headers,
      metadata:table.metadata,
      data: output
    }
} 

function postDate(body){

    const table = new Table("Tracking")

    const [y, m, d] = getYMDComponentsFromDate(body.date)

    const [yearIndex, monthIndex, dateIndex] = [
        table.headers.indexOf("year"),
        table.headers.indexOf("month"),
        table.headers.indexOf("day")
    ]

    if (body.hasOwnProperty("id")) {
        const row = table.getRow(body.id)

        table.headers.forEach((header, i)=> {
            if (body.hasOwnProperty(header)){
                row[i] = body[header]
            }
        })
        table.updateRow(row)
    } else {
        const newRow = table.headers.map(header => {
            if (body.hasOwnProperty(header)) {
                return body[header]
            } else {
                return ""
            }
        })
        table.addRow(newRow)
    }
}


function getWeek(date) {
    
    const table = new Table("Tracking")

    const output = {
        headers: table.headers,
        metadata: table.metadata,
        data:[]
    }

    const weekList = getWeekList(date)

    console.log("weeklist", weekList)

    const weekComponentList = weekList.map(date => {
        return getYMDComponentsFromDate(date)
    })

    console.log("weekComponentlist", weekComponentList)

    const [yearIndex, monthIndex, dateIndex] = [
        table.headers.indexOf("year"),
        table.headers.indexOf("month"),
        table.headers.indexOf("day")
    ]

    output.data = table.data.filter(row => {

        let filter = false

        weekComponentList.forEach(dateComponents => {
          if (
                row[yearIndex] == dateComponents[0] &&
                row[monthIndex] == dateComponents[1] &&
                row[dateIndex] == dateComponents[2]
            ) filter =  true
        })

        return filter

    })

    return output

}