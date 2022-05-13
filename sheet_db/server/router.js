function doGet(e) {
  sLog("GET received")
  sLog(e.parameters)

  const path = e.parameters.path
  const fields = e.parameters.fields

  result = route('GET', path, {"fields": fields})

  return respond(result)
}

function doPost(e) {
  sLog("POST received")
  sLog(e.postData)
  sLog(e.parameters)

  const path = e.parameters.path[0]

  let payload;
  try {
    payload = JSON.parse(e.postData.contents)
  } catch (e) {
    return respond ({
      message: "ERROR: check body"
    })
  }
  
  result = route('POST', path, payload)

  return respond(result)
}


function respond(obj) {
  console.log(obj)
  if (typeof(obj) === 'object' && obj !== null){
    return ContentService
      .createTextOutput(JSON.stringify(obj))
  } else {
    throw "invalid response, must be object"
  }
  
}

/**
 * path
 *  trackingEntries
 *    date
 *    week
 * 
 * fields
 *  i.e
 *      id, year, month, day, steps, push-ups etc.. or *
 * 
 * LATER
 *  users
 *      name
 *      id
 * 
 * 
 */

/*
let url = 'https://script.google.com/macros/s/[ID]/exec'
let content = {
        method: 'POST',
        body: JSON.stringify({"hello":"1"})
    }
fetch(url, content)
    .then(resp => console.log(resp.json()))
 */
// https://github.com/tanaikech/taking-advantage-of-Web-Apps-with-google-apps-script#corsinwebapps
// https://x-team.com/blog/google-apps-script-rest/