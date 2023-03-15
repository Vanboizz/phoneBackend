//config env
require('dotenv').config()
const express = require("express");
const app = express();
const router = require("./router/index");
const cors = require("cors");

app.use(cors())

// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// JSON
app.use(express.json());

//Router
router(app);

//Run Server
app.listen(8000, () => {
  console.log("Server is up");
});
