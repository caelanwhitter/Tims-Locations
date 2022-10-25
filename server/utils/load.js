// reads and returns file's contents

const fs = require("fs/promises");

/**
 * get all lines from the csv file
 * @param filepath The path to the csv file
 * @returns the file's contents
 */
async function getFileContents(filepath) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  let file = await fs.readFile(filepath, "utf-8");
  return file;
}

/**
 * For each line from the csv file,
 * separate all the columns and create
 * an object that contains only the columns
 * that will be used for the application.
 * @returns all the filtered lines from the csv file
 */
async function getRows(filepath) {
  let fileContents = await getFileContents(filepath);

  // splits the file into lines
  let rows = fileContents.split("\n");

  // will hold only the necessary columns information
  // for each line
  let data = [];

  // splits each line into columns
  rows.forEach(line => {
    // splits line on a comma surrounded by anything but a white space before and after
    if (line !== "") {
      let allColumns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

      // ony selects the necessary columns
      // restaurant_id, diningHours, driveThruHours
      let columns = [allColumns[0], allColumns[2], allColumns[4]];

      // get the latitude and longitude
      const coordinates = getCoordinates(allColumns);
      columns.push(coordinates[0]);
      columns.push(coordinates[1]);

      // get the address and the phone number
      const adrAndPhone = getAddressAndPhone(allColumns);
      columns.push(adrAndPhone[0]);
      columns.push(adrAndPhone[1]);

      // adds the filtered row to data
      data.push(columns);
    }
  });
  // removes the first row which is only the column names
  data.shift();
  // returns all the lines filtered
  return data;
}

/**
 * Makes sure the coordinates are numbers
 * @param {array} line the row in an array
 * @returns the validated coordinates
 */
function getCoordinates(line) {
  let lat = 0;
  let long = 0;
  for (let i = 10; i < line.length; i++) {
    if (!isNaN(line[parseInt(i)])) {
      lat = line[parseInt(i)];
      long = line[i + 1];
      break;
    }
  }
  return [lat, long];
}

/**
 * Gets the restaurant's address and phone number
 * @param {array} line the row in an array
 * @returns the address and phone number in an array
 */
function getAddressAndPhone(line) {

  let address = "";
  let phone = "";

  /* address and phone
   * if the length of the row is 32, meaning that
   * the parkingType has a value, the address is on index 24
   * and the phone number is on the index 27
   */
  if (line.length === 32) {
    address = line[24];
    phone = line[27];
    /* if the length of the row is 24
     * meaning that the Tim Hortons's franchise group name is
     * the Michigan State University
     */
  } else if (line.length === 24) {
    address = line[18];
    phone = line[20];
  } else {
    address = line[24];
    phone = line[26];
  }
  if (address !== undefined) {
    address = address.replace(/"/g, "");
  }  
  return [address, phone];
}

/**
 * Creates the documents that will be inserted into the database
 * @returns the created documents
 */
async function getDocuments(filepath) {
  // get all the rows
  let rows = await getRows(filepath);

  let documents = [];

  rows.forEach(row => {

    if (row[5] !== undefined) {
      row[5] = row[5].toString().replace(/"/g, "");
    } else {
      console.log(row[0])
    }
    // split the diningRoomHours into an array
    let diningHours = row[1].split(",");
    // remove first object in the array(type)
    diningHours.shift();
    // get the open and close hours for the dining room
    let diningRoomHours = getOpenHours(diningHours);

    // split the drivethrough hours into an array
    // if there is no drivethrough, let drivethrough to ""
    let driveThruHours = {};
    let drivethru = row[2].split(",");
    // remove first object in the array(type)
    drivethru.shift();
    // get the open and close hours for the drivethrough
    driveThruHours = getOpenHours(drivethru);

    // create and add the document to the array
    documents.push({
      diningRoomHours: diningRoomHours,
      driveThruHours: driveThruHours,
      geo: {
        "type": "Point",
        "coordinates": [
          parseFloat(row[4]),
          parseFloat(row[3])
        ]
      },
      address: row[5],
      phone: row[6]
    })
  });
  return documents;
}

/**
 * Create an open to close hours object
 * @param array openTypeArr the array of opening hours to be parsed
 * @returns an object containing the open to close hours
 */
function getOpenHours(openTypeArr) {
  // will contain in a valid string format to convert to JSON
  let newArr = []

  // creates the valid JSON format for each restaurant
  openTypeArr.forEach(day => {
    let doubleQuotesDay = day.replace(/'/g, "\"");
    let noSpaceDay = doubleQuotesDay.replace(" ", "");
    let newDay = noSpaceDay.replace("}\"", "");
    newArr.push(newDay);
  });

  // the hours in a JSON object
  let jsonOpenCloseHours = JSON.parse("{" + newArr.toString() + "}");

  // will contain the open close hours in the format
  // {day} : {open - close}
  // by default, the hours are closed
  // if there is no dining room/drivethru, it is closed
  let hours = {};
  hours["monday"] = "closed";
  hours["tuesday"] = "closed";
  hours["wednesday"] = "closed";
  hours["thursday"] = "closed";
  hours["friday"] = "closed";
  hours["saturday"] = "closed";
  hours["sunday"] = "closed";

  if (newArr.length > 0) {

    // get all the opening hours using the default order
    let unorderedHours = {};
    // get the days it opens
    let days = getOpenDays(jsonOpenCloseHours);

    // get the corresponding opening hours
    let openHours = getAllOpenHours(jsonOpenCloseHours);

    // populates hours with {day} : {open - close}
    if (days.length === openHours.length) {
      for (let i = 0; i < days.length; i++) {
        unorderedHours[days[parseInt(i)]] = openHours[parseInt(i)];
      }

      // order the days as the days in a week
      hours["monday"] = unorderedHours["monday"];
      hours["tuesday"] = unorderedHours["tuesday"];
      hours["wednesday"] = unorderedHours["wednesday"];
      hours["thursday"] = unorderedHours["thursday"];
      hours["friday"] = unorderedHours["friday"];
      hours["saturday"] = unorderedHours["saturday"];
      hours["sunday"] = unorderedHours["sunday"];

      // for the ones that are opened 24/7
    } else {
      hours["monday"] = "24/7";
      hours["tuesday"] = "24/7";
      hours["wednesday"] = "24/7";
      hours["thursday"] = "24/7";
      hours["friday"] = "24/7";
      hours["saturday"] = "24/7";
      hours["sunday"] = "24/7";
    }
  }
  return hours;
}

/**
 * Creates and return an array containing the days
 * containing open and close hours
 * @param array json represents the json object
 * from which the days will be extracted
 * @returns all the days in the json
 */
function getOpenDays(json) {
  let keys = Object.keys(json);
  let days = [];
  keys.forEach(day => {
    if (day.includes("fri")) {
      days.push("friday");
    } else if (day.includes("mon")) {
      days.push("monday");
    } else if (day.includes("sat")) {
      days.push("saturday");
    } else if (day.includes("sun")) {
      days.push("sunday");
    } else if (day.includes("thr")) {
      days.push("thursday");
    } else if (day.includes("tue")) {
      days.push("tuesday");
    } else if (day.includes("wed")) {
      days.push("wednesday");
    }
  });

  // remove duplicates
  let uniqueDays = days.filter((d, index) => {
    return days.indexOf(d) === index;
  });
  return uniqueDays;
}

/**
 * Formats all the open and closing hours as {open} - {close}
 * @param array arr Represents the array containing the open hours
 * @returns the opening and closing hours in an array
 */
function getAllOpenHours(arr) {
  // all the hours
  let hours = Object.values(arr);
  // will contain the hours as hour:minutes
  let time = [];

  // format the hours as hour:minutes
  hours.forEach(h => {
    let hourTimeZone = new Date(Date.parse(h));
    let hour = hourTimeZone.getHours() + ":" + hourTimeZone.getMinutes();
    time.push(hour);
  });

  // format the hours as {open} - {close}
  let openClose = [];
  for (let i = 0; i < time.length; i++) {
    let open = "";
    let close = "";
    if (i % 2 === 0) {
      close = time[parseInt(i)];
      open = time[i + 1];
    } else {
      close = time[i + 1];
      open = time[parseInt(i)];
    }
    if (close === undefined) {
      close = "not provided";
    }
    if (open === undefined) {
      open = "not provided";
    }
    openClose.push(open + " - " + close);
  }

  // remove duplicates
  let filteredHours = openClose.filter(function (value, index) {
    return index % 2 === 0;
  });
  return filteredHours;
}

exports.getDocuments = getDocuments;
exports.getFileContents = getFileContents;
exports.getRows = getRows;
