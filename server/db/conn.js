require("dotenv").config();
const dbUrl = process.env.ATLAS_URI;
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;


let instance = null;

class DAO {
  /**
   * Constructor
   * @returns instance of DAO
   */  
  constructor() {
    // if there's no instance, create a new instance
    if (!instance) {
      instance = this;
      this.client = new MongoClient(dbUrl);
      this.db = null;
      this.collection = null;
    }
    return instance;
  }


  /**
   * Connects to the database and creates a collection
   * @param {string} dbname Name of the database
   * @param {string} collection Name of the collection 
   * @returns if the connection to the database already exists
   */
  async connect(dbname, collection) {
    // if database is not null, return
    if (this.db){
      return;
    }
    // create a database connection
    await this.client.connect();
    this.db = this.client.db(dbname);
    console.log("Successfully connected to MongoDB database " + dbname);
    // if there is no collection, create a collection
    if (!this.db.collection(collection)){
      await this.db.createCollection(collection);
    }
    // get collection
    this.collection = this.db.collection(collection);
  }

  /**
   * Set the geospatial object as an index
   * @param geo the key that will be used as an index
   */
  async createIndexes(geo) {
    return await this.collection.createIndex(geo);
  }

  /**
   * Inserts multiple records into the database
   * @param {array} array 
   * @returns the count of rows added
   */
  async insertMany(array) {
    let result = await this.collection.insertMany(array);
    return result.insertedCount;
  }

  /**
   * Close connection to the database
   */
  async disconnect(){
    await this.client.close();
  }

  /**
 * Method to get all documents
 * @returns Array of documents from database
 */
  async getAllDocuments() {
    return await this.db.collection("locations").find().toArray();
  }

  /**
   * method to get document by id
   * @returns Array containing document from database
   */
  async getSingleDocument(id) {
    let document = await this.db.collection("locations").
      find({ "_id": new ObjectId(id) }).
      toArray();
    
    return document;
  }

  /**
   * method to get document based on their geospatial field
   * @returns Array containing geo field from database
   * @param {string} neLat north-east latitude
   * @param {string} neLong north-east longitude
   * @param {string} swLat south-west latitude
   * @param {string} swLong south-west longitude
   */
  async getGeoDocument(neLat, neLong, swLat, swLong){
    return await this.db.collection("locations").find({
      geo: {$geoWithin: 
        {$geometry: {
          type: "Polygon",
          coordinates: [[[swLong, swLat], [swLong, neLat], [neLong, neLat],
            [neLong, swLat], [swLong, swLat]]],
        }}
      }
    }).toArray();
  }
}

module.exports = DAO;