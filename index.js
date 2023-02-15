const express = require("express");
const app = express();
const router = require("./router/apiRouter");
// Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// JSON
app.use(express.json());

//Router
app.use(router);

//Run Server
app.listen(3000, () => {
  console.log("Server is up");
});
