const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  let token = req.get("authorization");
  if (token) {
    token = token.slice(7);
    jwt.verify(token, process.env.APP_ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        res.json({
          success: false,
          message: "Invalid Token",
        });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.json({
      success: false,
      message: "Access denied! authorized",
    });
  }
};

module.exports = auth;
