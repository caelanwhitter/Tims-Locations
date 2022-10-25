// get db connection
const DAO = require("../db/conn");
const db = new DAO();
const documents = require("../utils/load");

/**
 * Inserts the documents into the database
 * @returns the return code from the insertMany method
 */
async function writeArray(filepath){
  // the array that will be inserted into the database
  let array = [];
  // get the documents
  let data = await documents.getDocuments(filepath);
  // put each document into the array
  Object.keys(data).forEach(key =>
    array.push(data[key.toString()])
  );
  try {
    // connect to the database
    await db.connect("TimHortonsLocations", "locations");
    // inserts the documents into the database
    const rowsInserted = await db.insertMany(array);
    // create the index
    await db.createIndexes({ "geo": "2dsphere" });
    return rowsInserted;
  } catch (err) {
    console.error(err);
  } finally {
    // disconnect from the database
    if (db) {
      db.disconnect();
    }
  }
}

module.exports = writeArray;
