function setDateToMidnight(inputDate, nextDay) {
  const [year, month, date] = [
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  ];

  if (nextDay === false) {
    return new Date(year, month, date);
  } else if (nextDay === true) {
    return addDays(output, 1);
  }
}

function YMDMatch(dateA, dateB) {
  const [yearA, monthA, dayOfMonthA] = [
    dateA.getFullYear(),
    dateA.getMonth(),
    dateA.getDate()
  ];

  const [yearB, monthB, dayOfMonthB] = [
    dateB.getFullYear(),
    dateB.getMonth(),
    dateB.getDate()
  ];

  if (yearA === yearB && monthA === monthB && dayOfMonthA === dayOfMonthB)
    return true;

  return false;
}

function getYMDComponentsFromDate(date) {
  const isDateObject =
    date &&
    Object.prototype.toString.call(date) === "[object Date]" &&
    !isNaN(date);

  if (isDateObject) {
    const year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    return [year, month, day];
  } else throw "not a date!";
}

/**
 * This function takes in a date and returns two dates spanning
 * Monday to Sunday (7 days).
 */
function getWeekBoundaries(givenDate) {
  const BOUNDARY_MAP = {
    1: [0, 6],
    2: [-1, 5],
    3: [-2, 4],
    4: [-3, 3],
    5: [-4, 2],
    6: [-5, 1],
    0: [-6, 0]
  };

  const startingDay = givenDate.getDay();

  const startDate = addDays(givenDate, BOUNDARY_MAP[startingDay][0]);
  const endDate = addDays(givenDate, BOUNDARY_MAP[startingDay][1]);

  // if (endDate.getTime() - startDate.getTime() !== 691200000) {
  //   throw "Something went wrong while calculating week"
  // }
  return [startDate, endDate];
}

function getWeekList(date) {
  const [start, end] = getWeekBoundaries(date);

  const week = [start];

  for (let i = 0; i != 5; i++) {
    week.push(addDays(week[i], 1));
  }
  week.push(end);
  return week;
}

function addDays(date, days) {
  const output = new Date(date);
  output.setDate(output.getDate() + days);
  return output;
}

function getMidnight(inputDate) {
  const [year, month, date] = [
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  ];
  return new Date(year, month, date);
}

function msToHrs(t) {
  return (t / 1000 / 60 / 60).toPrecision(2);
}

function setDateToMidnight(inputDate, nextDay) {
  const [year, month, date] = [
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  ];

  if (nextDay === false) {
    return new Date(year, month, date);
  } else if (nextDat === true) {
    const output = new Date(year, month, date);
    output.setDate(output.getDate() + 1);
    return output;
  }
}

function yearMonthDateMatch(dateA, dateB) {
  const [yearA, monthA, dayOfMonthA] = [
    dateA.getFullYear(),
    dateA.getMonth(),
    dateA.getDate()
  ];

  const [yearB, monthB, dayOfMonthB] = [
    dateB.getFullYear(),
    dateB.getMonth(),
    dateB.getDate()
  ];

  if (yearA === yearB && monthA === monthB && dayOfMonthA === dayOfMonthB)
    return true;

  return false;
}
