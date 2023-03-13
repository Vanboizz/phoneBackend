const db = require("../connect/database");
const bcrypt = require("bcrypt")

const register = (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    const querySelect = "select * from users where email = ?";
    const queryInsert =
      "insert into users(fullname,email,password) values(?,?,?)";
    if (fullname === "" || email === "" || password === "") {
      res.json({
        success: false,
        message: "Please fill in all field",
      });
    } else {
      db.connection.query(querySelect, [email], (err, result) => {
        if (result.length > 0) {
          if (err) {
            throw err;
          } else {
            res.json({
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
                    res.json({
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
    res.json({
      success: false,
      message: "Server is error",
    });
  }
};

module.exports = {
  register,
};
