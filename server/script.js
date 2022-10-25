const writeToDb = require("./utils/writeToDb");

/**
 * Calls the writeArray function from writeToDb
 * to populate the database
 * @param {string} filename The path to the csv file
 */
async function loadAtlas(filename) {
  try{
    let rowsInserted = await writeToDb(filename);
    // prints the number of rows inserted
    console.log(`entered ${rowsInserted} documents!`);
  } catch(error){
    console.error("there was a problem " + error.message);
  } 
  process.exit();
}

module.exports = loadAtlas;
