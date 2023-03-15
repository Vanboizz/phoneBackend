const db = require("../connect/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
//register
const register = (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const querySelect = "select email,password from users where email = ?";
    const queryInsert =
      "insert into users(fullname,email,password) values(?,?,?)";
    if (fullname === "" || email === "" || password === "") {
      res.status(500).json({
        success: false,
        message: "Please fill in all field",
      });
    } else {
      db.connection.query(querySelect, [email], (err, result) => {
        if (result.length > 0) {
          if (err) {
            throw err;
          } else {
            res.status(500).json({
              success: false,
              message: "This email have been already existed",
            });
          }
        } else {
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              throw err;
            } else {
              db.connection.query(
                queryInsert,
                [fullname, email, hash],
                (err) => {
                  if (err) {
                    throw err;
                  } else {
                    res.status(200).json({
                      success: true,
                      message: "The user has been registerd with us!",
                    });
                  }
                }
              );
            }
          });
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server is error",
    });
  }
};

//login
const login = (req, res) => {
  try {
    const { email, password } = req.body;
    const querySelect =
      "select idusers,email,password,fullname,gender,dateofbirth,phonenumber,province,district,wards,address from users where email = ?";
    const update = "update users set refreshToken = ? where email = ?";
    db.connection.query(querySelect, [email], (error, result) => {
      if (!result[0]) {
        res.status(500).json({
          success: false,
          message: "Invalid Email",
        });
      } else if (result.length !== 0) {
        const comparePassword = bcrypt.compareSync(
          password,
          result[0].password
        );
        if (comparePassword) {
          //access token
          const accessToken = jwt.sign(
            { result: result },
            process.env.APP_ACCESS_TOKEN,
            {
              expiresIn: "1m",
            }
          );
          //refresh token
          const refreshToken = jwt.sign(
            {
              result: result,
            },
            process.env.APP_REFRESH_TOKEN,
            {
              expiresIn: "1y",
            }
          );
          db.connection.query(update, [refreshToken, email]);
          res.status(200).json({
            success: true,
            message: "Login is successfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Invalid Password",
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: "Invalid Email And Password",
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Is Error",
    });
  }
};

// get new token when jwt expried
const token = (req, res) => {
  try {
    const { refreshToken } = req.body;
    const querySelect = "select * from users where refreshToken = ?";
    if (refreshToken) {
      db.connection.query(querySelect, [refreshToken], (err, result) => {
        if (!result[0]) {
          res.json({ success: false, message: "Invalid RefreshToken" });
        } else {
          const token = jwt.sign(
            { result: result[0].email },
            process.env.APP_ACCESS_TOKEN,
            { expiresIn: "1m" }
          );
          res.json({
            token: token,
          });
        }
      });
    } else {
      res.json({
        success: false,
        message: "Invalid request",
      });
    }
  } catch (error) {
    res.json({
      success: false,
      message: "Server Is Error",
    });
  }
};

const getUserById = (req, res) => {
  const querySelect = "select * from users where idusers = ?";
  db.connection.query(querySelect, [req.params.id], (err, result) => {
    if (err) throw err;
    else {
      res.json(result);
    }
  });
};
module.exports = {
  register,
  login,
  token,
  getUserById,
};
