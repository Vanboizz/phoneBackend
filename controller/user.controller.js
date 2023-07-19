const db = require("../connect/database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const decode = require("jwt-decode");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tuankhang951@gmail.com",
    pass: process.env.APP_PASSOFEMAIL,
  },
});
//register
const register = (req, res) => {
  try {
    const { fullname, phonenumber, email, password } = req.body;
    const querySelect = "select email,password from users where email = ?";
    const queryInsert =
      "insert into users(fullname,phonenumber,email,password,role) values(?,?,?,?,?)";
    // Kiểm tra rỗng
    if (
      fullname === "" ||
      phonenumber === "" ||
      email === "" ||
      password === ""
    ) {
      res.status(400).json({
        success: false,
        message: "Please fill in all field",
      });
    } else {
      db.connection.query(querySelect, [email], (err, result) => {
        // Kiểm tra email tồn tại
        if (result.length > 0) {
          if (err) {
            throw err;
          } else {
            res.status(401).json({
              success: false,
              message: "This email have been already existed",
            });
          }
        } else {
          // hash
          bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
              throw err;
            } else {
              db.connection.query(
                queryInsert,
                [fullname, phonenumber, email, hash, "user"],
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
      "select * from users where email = ?";
    const update = "update users set refreshToken = ? where email = ?";
    db.connection.query(querySelect, [email], (error, result) => {
      if (!result[0]) {
        res.status(401).json({
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
            {
              idusers: result[0].idusers,
              role: result[0].role,
              email: result[0].email,
              password: result[0].password,
            },
            process.env.APP_ACCESS_TOKEN,
            {
              expiresIn: "1y",
            }
          );
          //refresh token
          const refreshToken = jwt.sign(
            {
              idusers: result[0].idusers,
              role: result[0].role,
              email: result[0].email,
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
            role: result[0].role,
            accessToken: accessToken,
            refreshToken: refreshToken,
          });
        } else {
          res.status(401).json({
            success: false,
            message: "Invalid Password",
          });
        }
      } else {
        res.status(401).json({
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
          res
            .status(401)
            .json({ success: false, message: "Invalid RefreshToken" });
        } else {
          const token = jwt.sign(
            {
              idusers: result[0].idusers,
              role: result[0].role,
              email: result[0].email,
              password: result[0].password,
            },
            process.env.APP_ACCESS_TOKEN,
            { expiresIn: "1m" }
          );
          res.status(200).json({
            token: token,
          });
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid request",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Is Error",
    });
  }
};

//test authetication
const getUserById = (req, res) => {
  try {
    const idusers = req.auth.id;
    const querySelect = "select * from users where idusers = ? ";
    db.connection.query(querySelect, [idusers], (error, result) => {
      if (error) throw error;
      else {
        res.status(200).json(result);
      }
    });
  } catch (error) {
    res.status(400).json({ message: "Error Server" });
  }
};

//forgot password
const forgotpassword = (req, res) => {
  try {
    const { email } = req.body;
    const query = "select * from users where email = ?";
    db.connection.query(query, [email], (err, result) => {
      if (result.length <= 0) {
        res.status(401).json({
          success: false,
          message: "Invalid email",
        });
      } else {
        const accessToken = jwt.sign(
          {
            idusers: result[0].idusers,
            role: result[0].role,
            email: result[0].email,
          },
          process.env.APP_ACCESS_TOKEN,
          {
            expiresIn: "1m",
          }
        );
        const mailOptions = {
          from: "tuankhang951@gmail.com",
          to: result[0].email,
          subject: "Sending Email using Node.js[nodemailer]",
          html: `<p>Please use the below token to reset your password with the <a href="http://localhost:3000/changepassword/${accessToken}">Link</a> api route:</p>`,
        };
        transporter.sendMail(mailOptions, (err, info) => {
          if (err) {
            console.log(err);
          } else {
            console.log(info.response);
          }
        });
        res.status(200).json({
          success: true,
          message: "Success",
          accessToken: accessToken,
        });
      }
    });
  } catch (error) {
    res.status(400).json({
      message: "Not exists email",
    });
  }
};

//change password
const changepassword = (req, res) => {
  try {
    const password = req.body.password;
    const token = req.params.accessToken;
    const { email } = decode(token);
    const roundNumber = 10;

    bcrypt.genSalt(roundNumber, (error, salt) => {
      if (error) {
        res.status(400);
      } else {
        bcrypt.hash(password, salt, (error, hash) => {
          if (error) {
            res.status(400);
          } else {
            var data = {
              password: hash,
            };
            db.connection.query(
              `update users set password = '${data.password}' where email = '${email}'`,
              (error, result) => {
                if (error) {
                  res.status(400);
                } else {
                  res.status(200).json({
                    message: "Update is succesfully",
                  });
                }
              }
            );
          }
        });
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Server is error",
    });
  }
};

//update user
const updateUser = (req, res) => {
  try {
    const { fullname, email, phonenumber, gender, days, months, years } = req.body;
    const idusers = req.auth.id;
    const queryUpdate =
      "update users set fullname = ?, email = ?, phonenumber = ?, gender = ?, days = ?, months = ?, years = ? where idusers = ?";
    db.connection.query(
      queryUpdate,
      [fullname, email, phonenumber, gender, days, months, years, idusers],
      (error, userupdate) => {
        if (error) throw error;
        db.connection.query(
          `Select * from users where idusers = ?  `, [idusers], (err, data) => {
            if (err) throw err;
            res.status(200).json({ user: data, message: "Update is successfull" });
          }
        )

      }
    );
  } catch (error) {
    res.status(500).json({
      message: "Server is error",
    });
  }
};

//create new password
const createnewpassword = (req, res) => {

  try {
    const roundNumber = 10;
    const { curpass, newpass } = req.body;
    const idusers = req.auth.id;
    const queryGetPassword =
      "select password from users where idusers = ?";
    const queryUpdatePassWord =
      "update users set password = ? where  idusers = ?";
    db.connection.query(queryGetPassword, [idusers], (error, result) => {
      if (error) throw error;
      if (result.length < 0) {
        res.status(401).json({
          message: "Invalid password"
        });
      } else {
        const hashedPassword = result[0].password.toString(); // Mật khẩu đã được hash

        bcrypt.compare(curpass, hashedPassword, (err, isMatch) => {
          if (err) {
            console.error(err);
            return;
          }
          if (isMatch) {
            bcrypt.genSalt(roundNumber, (error, salt) => {
              if (error) {
                res.status(400);
              } else {
                bcrypt.hash(newpass, salt, (error, hash) => {
                  if (error) {
                    res.status(400);
                  } else {
                    var data = {
                      password: hash,
                    };
                    db.connection.query(
                      `update users set password = '${data.password}' where idusers = '${idusers}'`,
                      (error, result) => {
                        if (error) {
                          res.status(400);
                        } else {
                          res.status(200).json({
                            message: "Update succesfully",
                          });
                        }
                      }
                    );
                  }
                });
              }
            });
          } else {
            res.status(400).json({
              message: "Incorrect current password.",
            });
          }
        });

      }
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server is error",
    });
  }
};

module.exports = {
  register,
  login,
  token,
  getUserById,
  forgotpassword,
  changepassword,
  updateUser,
  createnewpassword,
};
