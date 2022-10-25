const { test } = require("@jest/globals");
const load = require("../utils/load");
const fs = require("fs/promises");

jest.mock("fs/promises");

/**
 * Tests to verify the return value of the getFileContents method. 
 */
test("Tests getFileContents", async () => {
  // Path of the fake csv file being used
  let filepath = "./__tests__/fakefile.csv";
  // Contents of the fake csv file
  let fakeCsv = "first, second, third, fourth, fifth, sixth, seven";
  // Mock function's return value
  await fs.readFile.mockResolvedValue(fakeCsv);

  let returnedFileContents = await load.getFileContents(filepath);
  expect(returnedFileContents).toEqual(fakeCsv);
});

/**
 * Tests to verify if the getDocuments method returns an array containing 
 * 1 document. 
 */
test("Tests getDocuments", async () => {
  // Path of the fake csv file being used
  let filepath = "./__tests__/fakelongfile.csv";
  
  // Used to mock the output of the getFileContents function which is a dependendency within the 
  //getRows
  let fileContent = "_id,diningRoomHours,driveThruHours,latitude,longitude,name,phoneNumber\n" +
    "1,\"{'_type': 'hoursOfOperation', 'fri': '12AM'}\",\"{'_type': 'hoursOfOperation', " +
    "'fri': '12AM'}\",43.37,-79.79,4000 MAINWAY,9053192663\n";
    
  // Used to mock the output of getRows 
  let fakeData = [["1", "{'_type': 'hoursOfOperation', 'fri': '12AM'}",
    "{'_type': 'hoursOfOperation', 'fri': '12AM'}",
    "43.37", "-79.79", "4000 MAINWAY", "9053192663"]];
  
  // Mock outputs
  fs.readFile.mockResolvedValue(fileContent);
  load.getRows = jest.fn().mockResolvedValue(fakeData);

  let returnedGetDocuments = await load.getDocuments(filepath);
  // It's expected to return an array with one element in it
  expect(returnedGetDocuments.length).toEqual(1);
});