const express = require("express");
const app = express();
const path = require("path");
const query = require("./routes/query");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const compression = require("compression");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Global Tim Hortons Locations",
    version: "1.0.0",
  },
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: ["./server/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// anything in the URL path /query uses the Router
app.use("/query", query);
// other route - static
app.use(express.static(path.resolve(__dirname, "../client/build")));
// use compression middleware
app.use(compression());
// add browser caching
app.use(function (req, res, next) {
  res.set("Cache-control", "public, max-age=31536000");
  next();
});

module.exports = app;