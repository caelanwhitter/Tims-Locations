const request = require("supertest");
const connection = require("../db/conn");
const app = require("../app");

jest.mock("../db/conn");

describe("Tests query router", () => {
  // Will be used in each test case to mock the output of a function 
  let data = [{ "id": 1, "open": "true" }, { "id": 2, "open": "true" }];
  
  // Tests to see if all documents from the database is returned
  test("/GET /getAll returns all documents ", async () => {
    // Mock the output of the getAllDocuments function by using data
    jest.spyOn(connection.prototype, "getAllDocuments").mockResolvedValue(data);
    // Get response
    const response = await request(app).get("/query/getAll");
    // Assertions
    expect(response.body).toStrictEqual(data);
    expect(response.statusCode).toBe(200);
  });
  
  // Tests getting 1 document from the database
  test("/GET /getId returns 1 document", async () => {
    // Mock the output of the getSingleDocument function by using the first element in data
    jest.spyOn(connection.prototype, "getSingleDocument").mockResolvedValue(data[0]);
    const response = await request(app).get("/query/getId").query({"id": 1});
    // Assertions
    expect(response.body).toEqual(data[0]);
    expect(response.statusCode).toBe(200);
  });

  // Tests getting multiple documents whose coordinates fall within the given coordinates.
  // Since the conn module is being mocked, the query parameters don't really matter.
  test("/GET /getGeo tests ", async () => {
    // Mock the output of the getGeoDocument function by using data
    jest.spyOn(connection.prototype, "getGeoDocument").mockResolvedValue(data);
    const response = await request(app).get("/query/getGeo").
      query({ "neLat": 54.4567, "neLong": 60.234, "swLat": 39.3456, "swLong": 43.2345});
    // Assertions
    expect(response.body).toEqual(data);
    expect(response.statusCode).toBe(200);
  });
});