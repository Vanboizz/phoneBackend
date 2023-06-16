const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  let token = req.get("authorization");
  if (token) {
    token = token.slice(7);
    jwt.verify(token, process.env.APP_ACCESS_TOKEN, (err, decoded) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: "Invalid Token",
        });
      } else {
        req.auth = {
          id: decoded.idusers,
          email: decoded.email,
          role: decoded.role,
          password: decoded.password,
        };
        next();
      }
    });
  } else {
    res.status(500).json({
      success: false,
      message: "Access denied! authorized",
    });
  }
};

module.exports = authenticateToken;
