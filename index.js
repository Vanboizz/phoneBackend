//config env
require("dotenv").config();
const express = require("express");
const app = express();
const router = require("./router/index");
const cors = require("cors");

// JSON
app.use(express.json({ limit: "50mb" }));

//cors
app.use(cors());

// Body Parser
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    limit: "200mb",
    extended: true,
    parameterLimit: 1000000,
  })
);
app.use(bodyParser.json({ limit: "200mb" }));

//Router
app.use(router);

//Run Server
app.listen(8000, () => {
  console.log("Server is up");
});
