const express = require("express");
const router = express.Router();
const DAO = require("../db/conn");
const db = new DAO();
const cache = require("memory-cache");


//parser middleware will parse the json payload
router.use(express.json());

/**
 * @swagger
 * /query/getAll:
 *    get:
 *      summary: Retrieves all Tim Hortons locations.
 *      description: Retrieves an array of all documents representing a Tim Hortons location.
 *      responses: 
 *        200: 
 *          description: A list of documents.
 *          content:
 *            application/json:
 *              schema: 
 *                type: array
 *                items: 
 *                  type: object
 *                  properties:
 *                    _id: 
 *                       type: string
 *                       description: ID of the document within the database.
 *                       example: 362gs8282hs86vj
 *                    diningRoomHours:
 *                      type: array
 *                      example: {"monday":"00:00 - 24:00", "tuesday": "5:00 - 24:00"}
 *                    driveThruHours:
 *                      type: array
 *                      example: {"monday":"05:00 - 21:00", "tuesday": "5:00 - 21:00"}
 *                    geo: 
 *                       type: Object
 *                       description: Object with coordinates 
 *                       example: {"type": "Point", "coordinates": [-79.432356, 24.3346224]}
 *                    address: 
 *                       type: string
 *                       description: The address of the Tim Hortons location.
 *                       example: "1234 Sherbrooke West, Montreal H4J 2C5 - Canada"
 *                    phone: 
 *                       type: string
 *                       description: The phone number of the Tim Hortons location.
 *                       example: "5141234567"
 */
router.get("/getAll", async function (req, res) {
  let data = cache.get("allDocs");
  if (!data) {
    data = await db.getAllDocuments();
    cache.put("allDocs", data);
  }
  res.send(data);
});

/**
 * @swagger
 * /query/getId:
 *    get:
 *      summary: Retrieves a single Tim Hortons location.
 *      description: Retrieves a single document from the database given an id.
 *      parameters:
 *        - in: query 
 *          name: id
 *          required: true
 *          description: ID of the document.
 *          schema:
 *            type: string
 *      responses: 
 *        200: 
 *          description: An array containing a single document.
 *          content:
 *            application/json:
 *              schema: 
 *                type: array
 *                items: 
 *                  type: object
 *                  properties:
 *                    _id: 
 *                       type: string
 *                       description: ID of the document within the database.
 *                       example: 362gs8282hs86vj
 *                    diningRoomHours:
 *                      type: array
 *                      example: {"monday":"00:00 - 24:00", "tuesday": "5:00 - 24:00"}
 *                    driveThruHours:
 *                      type: array
 *                      example: {"monday":"05:00 - 21:00", "tuesday": "5:00 - 21:00"}
 *                    geo: 
 *                       type: Object
 *                       description: Object with coordinates
 *                       example: {"type": "Point", "coordinates": [-79.432356, 24.3346224]}
 *                    address: 
 *                       type: string
 *                       description: The address of the Tim Hortons location.
 *                       example: "1234 Sherbrooke West, Montreal H4J 2C5 - Canada"
 *                    phone: 
 *                       type: string
 *                       description: The phone number of the Tim Hortons location.
 *                       example: "5141234567"
 *        404: 
 *          description: No document with the given id exists within the database.
 */
router.get("/getId", async function (req, res) {
  // Get the value of id from the request
  const id = req.query.id;
  // Get the value of id if it exists in memory
  let data = cache.get(id);
  // If id doesn't exist, get the document with the given id and store them both in memory
  if (!data) {
    data = await db.getSingleDocument(id);
    cache.put(id, data);
  }
  // Send the document in the response body
  res.send(data);
});

/**
 * @swagger
 * /query/getGeo:
 *    get:
 *      summary: Retrieves all locations whose coordinates are found within an area.
 *      description: |
 *        Retrieves all locations whose geospatial fields fall within a given 
 *        rectangle defined by the following:
 *        North-East lattitude, North-East longitude, South-West latitude and South-West longitude.
 *      parameters: 
 *        - in: query 
 *          name: neLat
 *          required: true
 *          description: North-East lattitude
 *          schema: 
 *            type: number
 *        - in: query 
 *          name: neLong
 *          required: true
 *          description: North-East longitude
 *          schema: 
 *            type: number
 *        - in: query 
 *          name: swLat
 *          required: true
 *          description: South-West latitude
 *          schema: 
 *            type: number
 *        - in: query 
 *          name: swLong
 *          required: true
 *          description: South-West longitude
 *          schema: 
 *            type: number
 *      responses: 
 *        200: 
 *          description: A list of documents.
 *          content:
 *            application/json:
 *              schema: 
 *                type: array
 *                items: 
 *                  type: object
 *                  properties:
 *                    _id: 
 *                       type: string
 *                       description: ID of the document within the database.
 *                       example: 362gs8282hs86vj
 *                    diningRoomHours:
 *                      type: array
 *                      example: {"monday":"00:00 - 24:00", "tuesday": "5:00 - 24:00"}
 *                    driveThruHours:
 *                      type: array
 *                      example: {"monday":"05:00 - 21:00", "tuesday": "5:00 - 21:00"}
 *                    geo: 
 *                       type: Object
 *                       description: Object with coordinates
 *                       example: {"type": "Point", "coordinates": [-79.432356, 24.3346224]}
 *                    address: 
 *                       type: string
 *                       description: The address of the Tim Hortons location.
 *                       example: "1234 Sherbrooke West, Montreal H4J 2C5 - Canada"
 *                    phone: 
 *                       type: string
 *                       description: The phone number of the Tim Hortons location.
 *                       example: "5141234567"
 */
router.get("/getGeo", async function (req, res) {
  // Key that will be used for cache - we'll use a concatenation of the latitudes and longitudes
  let key = req.query.neLat + req.query.neLong + req.query.swLat + req.query.swLong;
  // Get the cached data if it exists
  let data = cache.get(key);
  // If no cached data, insert key and data to cache
  if (!data) {
    // get parse coordinates to float
    let neLat = parseFloat(req.query.neLat);
    let neLong = parseFloat(req.query.neLong);
    let swLat = parseFloat(req.query.swLat);
    let swLong = parseFloat(req.query.swLong);
    // get Documents and store in data
    data = await db.getGeoDocument(neLat, neLong, swLat, swLong);
    // store in cache
    cache.put(key, data);
  }
  // return the data in the response body
  res.send(data);
});

module.exports = router;